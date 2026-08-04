from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.models import User, Product, Order, OrderItem
from app.schemas.schemas import (
    DashboardAnalytics, MonthlyRevenue, TopSellingProduct, OrderResponse,
    AdminDashboardAnalytics, BrandSale, CategorySale
)

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])

@router.get("", response_model=DashboardAnalytics)
def get_dashboard_analytics(
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Total counts
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    total_orders = db.query(Order).count()
    total_customers = db.query(User).count()
    total_products = db.query(Product).filter(Product.is_deleted == False).count()

    # Recent Orders (last 5)
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()

    # Monthly revenue calculation (database-agnostic Python grouping, optimized to select only required columns)
    orders = db.query(Order.created_at, Order.total_amount).order_by(Order.created_at.asc()).all()
    monthly_map: Dict[str, float] = {}
    for created_at, total_amount in orders:
        month_str = created_at.strftime("%B %Y")
        monthly_map[month_str] = monthly_map.get(month_str, 0.0) + total_amount
        
    monthly_revenue_list = [
        MonthlyRevenue(month=m, revenue=r) for m, r in monthly_map.items()
    ]
    
    # If no monthly data exists, put current month with 0
    if not monthly_revenue_list:
        current_month = datetime.datetime.utcnow().strftime("%B %Y")
        monthly_revenue_list.append(MonthlyRevenue(month=current_month, revenue=0.0))

    # Top selling products (Optimized with Join to avoid N+1 query issue)
    top_selling_raw = (
        db.query(
            Product.id,
            Product.name,
            Product.brand,
            func.sum(OrderItem.quantity).label("qty_sold"),
            func.sum(OrderItem.quantity * OrderItem.price).label("rev_gen")
        )
        .join(Product, OrderItem.product_id == Product.id)
        .group_by(Product.id, Product.name, Product.brand)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    top_selling_products = [
        TopSellingProduct(
            product_id=prod_id,
            name=name,
            brand=brand,
            quantity_sold=qty,
            revenue_generated=float(rev)
        )
        for prod_id, name, brand, qty, rev in top_selling_raw
    ]

    return DashboardAnalytics(
        total_revenue=float(total_revenue),
        total_orders=total_orders,
        total_customers=total_customers,
        total_products=total_products,
        monthly_revenue=monthly_revenue_list,
        top_selling_products=top_selling_products,
        recent_orders=[OrderResponse.model_validate(o) for o in recent_orders]
    )

@router.get("/dashboard", response_model=AdminDashboardAnalytics)
def get_admin_dashboard(
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Total counts
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    total_orders = db.query(Order).count()
    total_customers = db.query(User).count()
    
    # Average order value
    average_order_value = total_revenue / total_orders if total_orders > 0 else 0.0

    # Brand sales analytics
    brand_sales_raw = (
        db.query(
            Product.brand,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.quantity * OrderItem.price).label("total_revenue")
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.brand)
        .all()
    )
    brand_sales = [
        BrandSale(brand=brand, units_sold=qty, total_revenue=float(rev))
        for brand, qty, rev in brand_sales_raw if brand
    ]

    # Category sales analytics
    category_sales_raw = (
        db.query(
            Product.category,
            func.sum(OrderItem.quantity * OrderItem.price).label("revenue"),
            func.count(OrderItem.order_id.distinct()).label("order_count")
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.category)
        .all()
    )
    revenue_by_category = [
        CategorySale(category=cat, revenue=float(rev), order_count=cnt)
        for cat, rev, cnt in category_sales_raw if cat
    ]

    return AdminDashboardAnalytics(
        total_revenue=float(total_revenue),
        total_orders=total_orders,
        average_order_value=float(average_order_value),
        total_customers=total_customers,
        brand_sales=brand_sales,
        revenue_by_category=revenue_by_category
    )
