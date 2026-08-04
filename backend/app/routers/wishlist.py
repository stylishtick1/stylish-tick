from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Wishlist, Product
from app.schemas.schemas import WishlistResponse, WishlistCreate

router = APIRouter(prefix="/wishlist", tags=["User Wishlist"])

@router.get("", response_model=List[WishlistResponse])
def get_wishlist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wishlist_items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    return wishlist_items

@router.post("", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    item_data: WishlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if product exists
    target_product_id = item_data.product_id or item_data.watch_id
    if not target_product_id:
        raise HTTPException(status_code=400, detail="product_id or watch_id is required")

    product = db.query(Product).filter(Product.id == target_product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if already in wishlist
    existing_item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == target_product_id
    ).first()
    
    if existing_item:
        return existing_item

    # Add to wishlist
    new_item = Wishlist(
        user_id=current_user.id,
        product_id=target_product_id
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.delete("/{wishlist_id}")
def remove_from_wishlist(
    wishlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Wishlist).filter(
        Wishlist.id == wishlist_id,
        Wishlist.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist successfully"}

# Support both endpoints for backward compatibility
@router.delete("/product/{product_id}")
@router.delete("/watch/{product_id}")
def remove_by_product_id(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Wishlist).filter(
        Wishlist.product_id == product_id,
        Wishlist.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist successfully"}
