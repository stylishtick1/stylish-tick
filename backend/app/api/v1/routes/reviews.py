from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Review, Product
from app.schemas.schemas import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Product Reviews"])

@router.post("/{product_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def add_review(
    product_id: str,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Optional: check if user already reviewed this product
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.product_id == product_id
    ).first()
    
    if existing_review:
        # Update existing review
        existing_review.rating = review_data.rating
        existing_review.comment = review_data.comment
        db.commit()
        db.refresh(existing_review)
        review = existing_review
    else:
        # Create new review
        review = Review(
            user_id=current_user.id,
            product_id=product_id,
            rating=review_data.rating,
            comment=review_data.comment
        )
        db.add(review)
        db.commit()
        db.refresh(review)

    # Return with current user's name
    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        product_id=review.product_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        user_name=current_user.full_name
    )
