import datetime
import random
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Cart, CartItem, Order, OrderItem, Product
from app.schemas.schemas import OrderCreate, OrderResponse
from app.core.limiter import limiter

router = APIRouter(prefix="/orders", tags=["Order Management"])

def generate_order_number() -> str:
    date_str = datetime.datetime.utcnow().strftime("%Y%m%d")
    rand_str = uuid.uuid4().hex[:6].upper()
    return f"LWP-{date_str}-{rand_str}"

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def place_order(
    request: Request,
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your cart is empty. Cannot place an order."
        )

    # Use a database transaction block to ensure atomicity
    try:
        total_amount = 0.0
        order_items_to_create = []

        # Perform stock check and calculate total (with database lock on product stock to prevent race conditions)
        for item in cart.items:
            product = db.query(Product).filter(
                Product.id == item.product_id, 
                Product.is_deleted == False
            ).with_for_update().first()
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID '{item.product_id}' is no longer available."
                )
                
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.name}'. In stock: {product.stock}, Requested: {item.quantity}"
                )
                
            # Deduct stock
            product.stock -= item.quantity
            item_total = product.price * item.quantity
            total_amount += item_total
            
            # Prepare OrderItem
            order_items_to_create.append({
                "product_id": product.id,
                "quantity": item.quantity,
                "price": product.price
            })

        # Create the Order
        order_number = generate_order_number()
        new_order = Order(
            order_number=order_number,
            user_id=current_user.id,
            total_amount=total_amount,
            status="Pending",
            shipping_address=order_data.shipping_address,
            city=order_data.city,
            state=order_data.state,
            country=order_data.country,
            postal_code=order_data.postal_code,
            payment_method=order_data.payment_method,
            payment_status="Pending" if order_data.payment_method == "Cash on Delivery" else "Paid"
        )
        db.add(new_order)
        # Flush to database to generate new_order.id without committing yet
        db.flush()

        # Save all order items
        for item_info in order_items_to_create:
            new_item = OrderItem(
                order_id=new_order.id,
                product_id=item_info["product_id"],
                quantity=item_info["quantity"],
                price=item_info["price"]
            )
            db.add(new_item)

        # Clear user's cart
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        
        # Commit all changes atomically (Order creation, stock deduction, order items, cart clear)
        db.commit()
        db.refresh(new_order)
        return new_order
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to place order due to database error: {str(e)}"
        )

@router.get("", response_model=List[OrderResponse])
def get_order_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_details(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order
