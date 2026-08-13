import os
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=[FastApiIntegration()],
        traces_sample_rate=1.0,
        send_default_pii=True
    )

from app.core.database import Base, engine, SessionLocal, get_db
from app.core.config import settings
from app.models.models import Product, ProductImage, User
from app.core.security import get_password_hash

from fastapi.middleware.gzip import GZipMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure static directory exists
    os.makedirs("static/uploads", exist_ok=True)
    
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Ensure database columns exist (auto-migration for added columns in production DB)
    try:
        from sqlalchemy import text
        db_migration = SessionLocal()
        db_migration.execute(text("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_name VARCHAR;"))
        db_migration.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR;"))
        db_migration.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR;"))
        db_migration.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR;"))
        db_migration.commit()
    except Exception as migration_err:
        print(f"Auto-migration info: {migration_err}")
    finally:
        try:
            db_migration.close()
        except NameError:
            pass
    
    # Seed Database if empty
    db = SessionLocal()
    try:
        # Seed default customer user if none exists
        if db.query(User).count() == 0:
            print("Seeding database with a default customer user...")
            customer_user = User(
                full_name="John Doe",
                email="user@example.com",
                phone="1234567890",
                password_hash=get_password_hash("user123"),
                is_active=True
            )
            db.add(customer_user)
            db.commit()
            print("Successfully seeded default customer (user@example.com / user123).")

    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()
        
    yield

from app.core.limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

app = FastAPI(
    title="Luxury Watch Platform API",
    description="Backend API for the premium Luxury Watch E-Commerce Platform",
    version="1.0.0",
    lifespan=lifespan
)

# GZip compression middleware for fast response payloads
app.add_middleware(GZipMiddleware, minimum_size=500)

from sqlalchemy.exc import IntegrityError
from fastapi.responses import JSONResponse

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(IntegrityError)
async def integrity_exception_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=400,
        content={"detail": "Database integrity constraint violation. Duplicate or invalid record data."}
    )

# CORS Middleware
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if "*" in origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://browser.sentry-cdn.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com; "
        "connect-src 'self' http://localhost:8000 https://*.sentry.io;"
    )
    return response

# Mount static files for local uploads
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include Routers
from app.api.v1.api import api_router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Luxury Watch Platform API. Go to /docs for Swagger documentation."}

@app.get("/health")
def health_check(db = Depends(get_db)):
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": f"error: {str(e)}"}
