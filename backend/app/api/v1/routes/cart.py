from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Cart, CartItem, Product
from app.schemas.schemas import CartResponse, CartItemCreate, CartItemUpdate, CartItemResponse

router = APIRouter(prefix="/cart", tags=["Shopping Cart"])

@router.get("", response_model=CartResponse)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        # Create a cart if it somehow doesn't exist
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

@router.post("/items", response_model=CartItemResponse)
def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
        
    # Check if product exists and has stock
    target_product_id = item_data.product_id or item_data.watch_id
    if not target_product_id:
        raise HTTPException(status_code=400, detail="product_id or watch_id is required")
        
    product = db.query(Product).filter(Product.id == target_product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        


    # Check if item is already in cart
    cart_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == target_product_id
    ).first()
    
    if cart_item:
        new_quantity = cart_item.quantity + item_data.quantity

        cart_item.quantity = new_quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=target_product_id,
            quantity=item_data.quantity
        )
        db.add(cart_item)
        
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.put("/items/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    # Verify stock
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()

        
    cart_item.quantity = item_data.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.delete("/items/{item_id}")
def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}

@router.delete("/clear")
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
    return {"message": "Cart cleared successfully"}
