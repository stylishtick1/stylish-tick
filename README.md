# StylishTick - Luxury Watch Boutique E-Commerce

A full-stack, production-ready luxury watch e-commerce platform designed for high-concurrency ordering, real-time analytics, and premium user experience. Built with a FastAPI backend and a Next.js (App Router) frontend, utilizing PostgreSQL for persistence and TailwindCSS for responsive, high-end styling.

---

## 🏗️ Architecture Overview

The project uses a clean, decoupled architecture:
1. **Frontend:** Next.js with React server components, styled with TailwindCSS, utilizing Zustand for global client-state management, and Axios for API interactions.
2. **Backend:** FastAPI (Python ASGI) providing a high-performance REST API, validated by Pydantic V2 schemas, and using SQLAlchemy ORM for database connection pooling and queries.
3. **Database:** PostgreSQL for production, optimized with connection pooling and transactions.

---

## 🚀 Local Quickstart

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL** (or SQLite for light testing)

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
# Database configuration
DATABASE_URL=postgresql://postgres:username@localhost:5432/stylishtick_db

# JWT Security
JWT_SECRET=your_super_secure_random_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Default Admin Setup
ADMIN_USERNAME=admin@gmail.com
ADMIN_PASSWORD=AdminPassword123!

# Cloudinary (Optional, for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend Config
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```
- API Docs: `http://localhost:8000/docs` (Swagger UI)

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Site Address: `http://localhost:3000`

---

## 🛠️ Production Reorganization & Optimizations

This codebase has been hardened with the following production-grade features:
- **API Schema Backward-Compatibility:** Exposes alias layers (`watch_id`/`watch` computed properties) to handle frontend requests while maintaining standardized relational models in the database.
- **Race Condition Prevention:** Utilizes database-level row locks (`SELECT FOR UPDATE`) on product stocks inside transactions during checkout.
- **Transaction Atomicity:** Ensures all order components (order creation, stock adjustment, item mappings, cart clearing) succeed or fail as a single unit of work.
- **Query Optimization:** Implemented database-level joins and selective columns fetch in analytics endpoints, resolving standard N+1 query bottlenecks.
- **Security hardening:** Fallback settings are configured to require environment variables, preventing key exposure.
- **Production Server Configuration:** Removed Uvicorn file watcher triggers in production Dockerfiles.
