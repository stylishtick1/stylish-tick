from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.core.dependencies import get_current_admin
from app.models.models import User, Product, ProductImage, Order, OrderItem
from app.schemas.schemas import (
    AdminLogin, Token, UserResponse, ProductResponse, ProductCreate, ProductUpdate,
    OrderResponse, OrderStatusUpdate, ProductImageCreate, ProductImageResponse
)
from app.services.cloudinary import upload_watch_image, delete_watch_image
from app.core.limiter import limiter

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def admin_login(request: Request, login_data: AdminLogin):
    if login_data.username != settings.ADMIN_USERNAME or login_data.password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": settings.ADMIN_USERNAME, "role": "admin"}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- IMAGE UPLOAD ---
@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    admin: str = Depends(get_current_admin)
):
    try:
        url = upload_watch_image(file)
        return {"image_url": url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )

# --- PRODUCT CRUD ---
@router.post("/watches", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Create the product object
    new_product = Product(
        name=product_data.name,
        brand=product_data.brand,
        description=product_data.description,
        price=product_data.price,
        stock=product_data.stock,
        category=product_data.category,
        featured=product_data.featured,
        parent_id=product_data.parent_id,
        specifications=product_data.specifications or {}
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    # Add images if provided
    if product_data.images:
        for idx, img in enumerate(product_data.images):
            new_img = ProductImage(
                product_id=new_product.id,
                image_url=img.image_url,
                image_type=img.image_type,
                display_order=img.display_order if img.display_order else idx
            )
            db.add(new_img)
        db.commit()
        db.refresh(new_product)

    return new_product

@router.put("/watches/{product_id}", response_model=ProductResponse)
def edit_product(
    product_id: str,
    product_data: ProductUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update base product attributes
    update_dict = product_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product

@router.delete("/watches/{product_id}")
def delete_product(
    product_id: str,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Soft delete
    product.is_deleted = True
    db.commit()
    return {"message": f"Product '{product.name}' has been soft-deleted successfully."}

# --- PRODUCT IMAGE CRUD & REORDER ---
@router.post("/watches/{product_id}/images", response_model=ProductImageResponse)
def add_product_image(
    product_id: str,
    image_data: ProductImageCreate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_img = ProductImage(
        product_id=product_id,
        image_url=image_data.image_url,
        image_type=image_data.image_type,
        display_order=image_data.display_order
    )
    db.add(new_img)
    db.commit()
    db.refresh(new_img)
    return new_img

@router.delete("/watches/images/{image_id}")
def delete_image(
    image_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    image = db.query(ProductImage).filter(ProductImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Delete from storage (Cloudinary or local)
    delete_watch_image(image.image_url)
    
    db.delete(image)
    db.commit()
    return {"message": "Image deleted successfully"}

@router.put("/watches/{product_id}/images/reorder")
def reorder_product_images(
    product_id: str,
    image_ids: List[int],
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for index, img_id in enumerate(image_ids):
        image = db.query(ProductImage).filter(ProductImage.id == img_id, ProductImage.product_id == product_id).first()
        if image:
            image.display_order = index
            
    db.commit()
    return {"message": "Images reordered successfully"}


# --- CUSTOMER MANAGEMENT ---
@router.get("/customers", response_model=List[UserResponse])
def get_customers(
    search: Optional[str] = None,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%")) |
            (User.phone.ilike(f"%{search}%"))
        )
    return query.all()

@router.put("/customers/{customer_id}/toggle-active")
def toggle_customer_active(
    customer_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    customer = db.query(User).filter(User.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    customer.is_active = not customer.is_active
    db.commit()
    db.refresh(customer)
    status_str = "activated" if customer.is_active else "disabled"
    return {"message": f"Customer account has been {status_str}.", "is_active": customer.is_active}

@router.get("/customers/{customer_id}/orders", response_model=List[OrderResponse])
def get_customer_orders(
    customer_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.user_id == customer_id).all()
    return orders


# --- ORDER MANAGEMENT ---
@router.get("/orders", response_model=List[OrderResponse])
def get_orders(
    status: Optional[str] = None,
    search: Optional[str] = None,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if search:
        query = query.join(User).filter(
            (Order.order_number.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )
    return query.order_by(Order.created_at.desc()).all()

@router.put("/orders/{order_id}", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status_data.status
    if status_data.payment_status:
        order.payment_status = status_data.payment_status
        
    db.commit()
    db.refresh(order)
    return order
