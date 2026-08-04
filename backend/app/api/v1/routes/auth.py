from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_refresh_token
from app.core.dependencies import get_current_user
from app.models.models import User, Cart
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, UserUpdate, PasswordChange, Token
from app.core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email is unique
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    # Hash password
    hashed_password = get_password_hash(user_data.password)

    # Create new user
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Automatically initialize cart
    user_cart = Cart(user_id=new_user.id)
    db.add(user_cart)
    db.commit()

    return new_user

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, response: Response, login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email, User.is_active == True).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT Token
    access_token = create_access_token(
        data={"sub": user.email, "role": "user", "user_id": user.id, "name": user.full_name}
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email}
    )
    
    # Set HTTP-Only Cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 3600 # 7 days
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh")
@limiter.limit("5/minute")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )
        
    payload = decode_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
        
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
        
    # Generate new access token
    new_access_token = create_access_token(
        data={"sub": user.email, "role": "user", "user_id": user.id, "name": user.full_name}
    )
    
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}

# Support both OAuth2 Form login (useful for Swagger docs) and standard JSON login
@router.post("/token", response_model=Token, include_in_schema=False)
@limiter.limit("10/minute")
def login_swagger(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username, User.is_active == True).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email, "role": "user", "user_id": user.id, "name": user.full_name}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile/update", response_model=UserResponse)
def update_profile(update_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.phone is not None:
        current_user.phone = update_data.phone
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/profile/change-password")
def change_password(password_data: PasswordChange, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(password_data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
        
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
