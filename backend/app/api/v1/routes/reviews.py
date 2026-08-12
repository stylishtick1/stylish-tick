from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_optional_current_user
from app.models.models import User, Review, Product
from app.schemas.schemas import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Product Reviews"])

@router.post("/{product_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def add_review(
    product_id: str,
    review_data: ReviewCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    user_id = current_user.id if current_user else None
    reviewer_name = current_user.full_name if current_user else (review_data.reviewer_name or "Verified Customer")

    review = Review(
        user_id=user_id,
        reviewer_name=reviewer_name,
        product_id=product_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        product_id=review.product_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        user_name=reviewer_name
    )
