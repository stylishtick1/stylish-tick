from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
from typing import List, Optional

from app.core.database import get_db
from app.models.models import Product, Review, ProductImage, User
from app.schemas.schemas import ProductResponse, ProductDetailResponse, ReviewResponse

router = APIRouter(tags=["Products Shop"])

@router.get("", response_model=List[ProductResponse])
def list_products(
    search: Optional[str] = None,
    brand: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    movement_type: Optional[str] = None,
    featured: Optional[bool] = None,
    is_curated_trending: Optional[bool] = None,
    sort_by: Optional[str] = Query(None, description="price_asc, price_desc, newest"),
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Product).options(selectinload(Product.images)).filter(Product.is_deleted == False)

    # Filtering
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) |
            (Product.brand.ilike(f"%{search}%")) |
            (Product.description.ilike(f"%{search}%"))
        )
    if brand:
        brand_list = [b.strip() for b in brand.split(",") if b.strip()]
        if brand_list:
            query = query.filter(Product.brand.in_(brand_list))
    if category:
        category_list = [c.strip() for c in category.split(",") if c.strip()]
        if category_list:
            query = query.filter(Product.category.in_(category_list))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if movement_type:
        query = query.filter(Product.specifications['movement_type'].astext == movement_type)
    if featured is not None:
        query = query.filter(Product.featured == featured)
    if is_curated_trending is not None:
        query = query.filter(Product.is_curated_trending == is_curated_trending)

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(Product.id.desc())

    # Pagination
    products = query.offset(offset).limit(limit).all()
    return products

@router.get("/trending", response_model=List[ProductResponse])
def get_trending_products(db: Session = Depends(get_db)):
    # 1. Fetch Admin curated products (is_curated_trending == True)
    curated = db.query(Product).options(selectinload(Product.images)).filter(Product.is_deleted == False, Product.is_curated_trending == True).limit(2).all()
    
    # Fallback to featured or standard if not enough curated items
    if len(curated) < 2:
        needed = 2 - len(curated)
        fallback = db.query(Product).options(selectinload(Product.images)).filter(
            Product.is_deleted == False,
            Product.id.notin_([p.id for p in curated])
        ).limit(needed).all()
        curated.extend(fallback)
        
    # 2. Fetch Best selling products (sum of quantity in OrderItem)
    from app.models.models import OrderItem
    best_sellers_query = db.query(
        Product,
        func.sum(OrderItem.quantity).label('sales_volume')
    ).join(
        OrderItem, Product.id == OrderItem.product_id
    ).filter(
        Product.is_deleted == False,
        Product.id.notin_([p.id for p in curated])
    ).group_by(
        Product.id
    ).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(2).all()
    
    best_sellers = [item[0] for item in best_sellers_query]
    
    # Fallback to standard if no order items exist yet
    if len(best_sellers) < 2:
        needed = 2 - len(best_sellers)
        fallback = db.query(Product).options(selectinload(Product.images)).filter(
            Product.is_deleted == False,
            Product.id.notin_([p.id for p in curated] + [p.id for p in best_sellers])
        ).limit(needed).all()
        best_sellers.extend(fallback)
        
    combined = curated + best_sellers
    
    # 3. Default filter: "minimum 1 shoes to dikhana hi he"
    has_shoe = any("Shoes" in p.category for p in combined)
    if not has_shoe:
        shoe = db.query(Product).options(selectinload(Product.images)).filter(
            Product.is_deleted == False,
            Product.category.like("%Shoes%")
        ).first()
        if shoe:
            combined[-1] = shoe

    return combined


@router.get("/brands", response_model=List[str])
def get_all_brands(db: Session = Depends(get_db)):
    brands = db.query(Product.brand).filter(Product.is_deleted == False).distinct().all()
    return [b[0] for b in brands if b[0]]

@router.get("/categories", response_model=List[str])
def get_all_categories(db: Session = Depends(get_db)):
    categories = db.query(Product.category).filter(Product.is_deleted == False).distinct().all()
    return [c[0] for c in categories if c[0]]

@router.get("/suggest", response_model=List[ProductResponse])
def get_search_suggestions(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    suggestions = db.query(Product).options(selectinload(Product.images)).filter(
        Product.is_deleted == False,
        (Product.name.ilike(f"%{q}%")) | (Product.brand.ilike(f"%{q}%"))
    ).limit(5).all()
    return suggestions

@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product_details(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).options(selectinload(Product.images)).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    # Get reviews and calculate average rating
    from sqlalchemy.orm import joinedload
    reviews = db.query(Review).options(joinedload(Review.user)).filter(Review.product_id == product_id).all()
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.product_id == product_id).scalar()
    
    # Map reviews to includes user names
    review_responses = []
    for r in reviews:
        user_name = r.user.full_name if r.user else "Anonymous"
        review_responses.append(
            ReviewResponse(
                id=r.id,
                user_id=r.user_id,
                product_id=r.product_id,
                rating=r.rating,
                comment=r.comment,
                created_at=r.created_at,
                user_name=user_name
            )
        )

    # Fetch variants
    variants_list = []
    if product.parent_id:
        parent_product = db.query(Product).options(selectinload(Product.images)).filter(Product.id == product.parent_id, Product.is_deleted == False).first()
        if parent_product:
            variants_list.append(parent_product)
        siblings = db.query(Product).options(selectinload(Product.images)).filter(Product.parent_id == product.parent_id, Product.id != product_id, Product.is_deleted == False).all()
        variants_list.extend(siblings)
    else:
        children = db.query(Product).options(selectinload(Product.images)).filter(Product.parent_id == product_id, Product.is_deleted == False).all()
        variants_list.extend(children)
        
    response_data = ProductDetailResponse(
        id=product.id,
        name=product.name,
        brand=product.brand,
        description=product.description,
        price=product.price,
        stock=product.stock,
        category=product.category,
        featured=product.featured,
        parent_id=product.parent_id,
        created_at=product.created_at,
        updated_at=product.updated_at,
        specifications=product.specifications or {},
        images=[img for img in product.images],
        reviews=review_responses,
        average_rating=float(avg_rating) if avg_rating is not None else 0.0,
        variants=variants_list
    )
    
    return response_data
