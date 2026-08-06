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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure static directory exists
    os.makedirs("static/uploads", exist_ok=True)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Seed Database if empty
    db = SessionLocal()
    try:
        # Check if products exist
        if db.query(Product).count() == 0:
            print("Seeding database with initial luxury watches...")
            
            # Initial watches data
            watches_seed = [
                {
                    "name": "Submariner Date 'Starbucks'",
                    "brand": "Rolex",
                    "description": "The Oyster Perpetual Submariner Date in Oystersteel with a Cerachrom bezel insert in green ceramic and a black dial. Waterproof to 300 meters (1,000 feet). Highly legible Chromalight display.",
                    "price": 14500.0,
                    "stock": 5,
                    "category": "Male Watches",
                    "featured": True,
                    "specifications": {
                        "movement_type": "Automatic",
                        "strap_material": "Stainless Steel",
                        "water_resistance": "300m",
                        "warranty_years": 5
                    },
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800", "type": "Front View"},
                        {"url": "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=800", "type": "Wrist View"},
                        {"url": "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800", "type": "Packaging View"}
                    ]
                },
                {
                    "name": "Speedmaster Professional 'Moonwatch'",
                    "brand": "Omega",
                    "description": "The legendary chronograph worn by astronauts on the moon. Featuring the Co-Axial Master Chronometer Calibre 3861, asymmetrical case, and black step dial.",
                    "price": 7600.0,
                    "stock": 8,
                    "category": "Premium Watches",
                    "featured": True,
                    "specifications": {
                        "movement_type": "Automatic",
                        "strap_material": "Stainless Steel",
                        "water_resistance": "50m",
                        "warranty_years": 5
                    },
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800", "type": "Front View"},
                        {"url": "https://images.unsplash.com/photo-1539874754764-5a96559165b0?q=80&w=800", "type": "Side View"}
                    ]
                },
                {
                    "name": "Prospex Alpinist 'Mountain Glacier'",
                    "brand": "Seiko",
                    "description": "Features a stunning sunburst deep blue-green dial, rotating inner compass ring, and Cyclops date magnifier. Powered by the reliable 6R35 automatic movement.",
                    "price": 820.0,
                    "stock": 15,
                    "category": "Male Watches",
                    "featured": False,
                    "specifications": {
                        "movement_type": "Automatic",
                        "strap_material": "Leather",
                        "water_resistance": "200m",
                        "warranty_years": 3
                    },
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800", "type": "Front View"},
                        {"url": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800", "type": "Wrist View"}
                    ]
                },
                {
                    "name": "Presage Cocktail Time 'Blue Moon'",
                    "brand": "Seiko",
                    "description": "Inspired by the blue cocktail. The dial has a deep, textured pattern with a glossy finish. Stainless steel case with blue leather strap.",
                    "price": 450.0,
                    "stock": 20,
                    "category": "Female Watches",
                    "featured": True,
                    "specifications": {
                        "movement_type": "Automatic",
                        "strap_material": "Leather",
                        "water_resistance": "50m",
                        "warranty_years": 2
                    },
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1619134778706-7015533a6150?q=80&w=800", "type": "Front View"}
                    ]
                },
                {
                    "name": "Minimalist Chronograph",
                    "brand": "Fossil",
                    "description": "Clean and contemporary, this 44mm watch features a black satin dial, chronograph movement, and black leather strap.",
                    "price": 160.0,
                    "stock": 35,
                    "category": "Male Watches",
                    "featured": False,
                    "specifications": {
                        "movement_type": "Quartz",
                        "strap_material": "Leather",
                        "water_resistance": "50m",
                        "warranty_years": 2
                    },
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800", "type": "Front View"}
                    ]
                },
                {
                    "name": "Heritage Automatic Gold",
                    "brand": "Titan",
                    "description": "An exquisite premium dress watch featuring an open-heart dial showing off the movement, paired with luxurious gold plating and genuine brown leather.",
                    "price": 380.0,
                    "stock": 12,
                    "category": "Male Watches",
                    "featured": True,
                    "specifications": {
                        "movement_type": "Automatic",
                        "strap_material": "Leather",
                        "water_resistance": "300m",
                        "warranty_years": 2
                    },
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800", "type": "Front View"},
                        {"url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800", "type": "Side View"}
                    ]
                }
            ]
            
            for w in watches_seed:
                product_obj = Product(
                    name=w["name"],
                    brand=w["brand"],
                    description=w["description"],
                    price=w["price"],
                    stock=w["stock"],
                    category=w["category"],
                    specifications=w["specifications"],
                    featured=w["featured"]
                )
                db.add(product_obj)
                db.commit()
                db.refresh(product_obj)
                
                for idx, img in enumerate(w["images"]):
                    img_obj = ProductImage(
                        product_id=product_obj.id,
                        image_url=img["url"],
                        image_type=img["type"],
                        display_order=idx
                    )
                    db.add(img_obj)
                db.commit()
            print("Successfully seeded products.")

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
