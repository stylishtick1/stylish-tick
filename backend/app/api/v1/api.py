from fastapi import APIRouter
from app.api.v1.routes import auth, admin, watches, cart, orders, reviews, wishlist, analytics

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(watches.router, prefix="/watches")
api_router.include_router(watches.router, prefix="/products")
api_router.include_router(cart.router)
api_router.include_router(orders.router)
api_router.include_router(reviews.router)
api_router.include_router(wishlist.router)
api_router.include_router(analytics.router)
