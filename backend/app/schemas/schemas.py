from pydantic import BaseModel, EmailStr, Field, computed_field
from typing import List, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Admin Authentication
class AdminLogin(BaseModel):
    username: str
    password: str

# User Schemas
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Product Image Schemas
class ProductImageBase(BaseModel):
    image_url: str
    image_type: str
    display_order: int = 0

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    id: int
    product_id: str

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    brand: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    category: str
    featured: bool = False
    is_curated_trending: bool = False
    parent_id: Optional[str] = None
    specifications: dict = {}

class ProductCreate(ProductBase):
    images: Optional[List[ProductImageCreate]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    category: Optional[str] = None
    featured: Optional[bool] = None
    is_curated_trending: Optional[bool] = None
    parent_id: Optional[str] = None
    specifications: Optional[dict] = None

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime
    images: List[ProductImageResponse] = []
    
    # Backward compatibility properties
    movement_type: Optional[str] = None
    strap_material: Optional[str] = None
    water_resistance: Optional[str] = None
    warranty_years: Optional[int] = None

    class Config:
        from_attributes = True

# Review Schemas
class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    reviews: List[ReviewResponse] = []
    average_rating: float = 0.0
    variants: List[ProductResponse] = []

# Wishlist Schemas
class WishlistCreate(BaseModel):
    product_id: Optional[str] = None
    watch_id: Optional[str] = None

class WishlistResponse(BaseModel):
    id: int
    product: ProductResponse

    @computed_field
    @property
    def watch(self) -> ProductResponse:
        return self.product

    class Config:
        from_attributes = True

# Cart Schemas
class CartItemCreate(BaseModel):
    product_id: Optional[str] = None
    watch_id: Optional[str] = None
    quantity: int = Field(1, ge=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)

class CartItemResponse(BaseModel):
    id: int
    product_id: str
    quantity: int
    product: ProductResponse

    @computed_field
    @property
    def watch(self) -> ProductResponse:
        return self.product

    @computed_field
    @property
    def watch_id(self) -> str:
        return self.product_id

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse] = []

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemResponse(BaseModel):
    id: int
    product_id: str
    quantity: int
    price: float
    product: ProductResponse

    @computed_field
    @property
    def watch(self) -> ProductResponse:
        return self.product

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    shipping_address: str
    city: str
    state: str
    country: str
    postal_code: str
    payment_method: str = "Credit Card"

class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    total_amount: float
    status: str
    shipping_address: str
    city: str
    state: str
    country: str
    postal_code: str
    payment_method: str
    payment_status: str
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str
    payment_status: Optional[str] = None

# Analytics Schemas
class MonthlyRevenue(BaseModel):
    month: str
    revenue: float

class TopSellingProduct(BaseModel):
    product_id: str
    name: str
    brand: str
    quantity_sold: int
    revenue_generated: float

class DashboardAnalytics(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    total_products: int
    monthly_revenue: List[MonthlyRevenue]
    top_selling_products: List[TopSellingProduct]
    recent_orders: List[OrderResponse]

class BrandSale(BaseModel):
    brand: str
    units_sold: int
    total_revenue: float

class CategorySale(BaseModel):
    category: str
    revenue: float
    order_count: int

class AdminDashboardAnalytics(BaseModel):
    total_revenue: float
    total_orders: int
    average_order_value: float
    total_customers: int
    brand_sales: List[BrandSale]
    revenue_by_category: List[CategorySale]
