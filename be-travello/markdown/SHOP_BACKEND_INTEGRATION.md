# Shop Backend Integration Guide

## Overview
Berhasil mengintegrasikan backend shop dengan frontend AdminShopPage dan ShopPage user.

## Backend Structure

### 1. Model (`src/models/ShopItem.js`)
- MongoDB schema untuk shop items
- Support untuk details, advantages, dan packages
- Index untuk search performance

### 2. Controller (`src/controllers/shop.controller.js`)
- `getAllShopItems()` - Get dengan filtering & pagination
- `getShopItemById()` - Get single item
- `createShopItem()` - Create new item
- `updateShopItem()` - Update existing item
- `deleteShopItem()` - Delete item
- `getShopCategories()` - Get all categories

### 3. Routes (`src/routes/shop.routes.js`)
- `GET /api/shop` - Public (user shop)
- `GET /api/shop/categories` - Get categories
- `GET /api/shop/:id` - Get single item
- `POST /api/shop` - Create (admin)
- `PUT /api/shop/:id` - Update (admin)
- `DELETE /api/shop/:id` - Delete (admin)

### 4. Integration
- Added to `src/app.js`
- Model initialization included
- CORS enabled for frontend

## Frontend Integration

### 1. Service (`src/services/shopService.ts`)
- TypeScript interfaces untuk type safety
- API methods untuk semua CRUD operations
- Error handling

### 2. AdminShopPage (`src/pages/admin/shop/AdminShopPage.tsx`)
- Connect ke backend API
- Real-time data loading
- Create, Update, Delete operations
- Type-safe dengan MongoDB _id

### 3. ShopPage (`src/pages/shop/shopPage.tsx`)
- Load active items dari backend
- Filter dan pagination
- Grid display dengan ShopCard

### 4. ShopCard (`src/components/ui/shopCards.tsx`)
- Updated untuk MongoDB _id compatibility
- Navigation ke detail page

## API Endpoints

### Public (User Shop)
```
GET http://localhost:55435/api/shop
GET http://localhost:55435/api/shop?search=SEO
GET http://localhost:55435/api/shop?category=Blog%20Writing
GET http://localhost:55435/api/shop/categories
GET http://localhost:55435/api/shop/:id
```

### Admin (Shop Management)
```
POST http://localhost:55435/api/shop
PUT http://localhost:55435/api/shop/:id
DELETE http://localhost:55435/api/shop/:id
```

## Setup Instructions

### 1. Start Backend
```bash
cd be-travello
npm start
```

### 2. Start Frontend
```bash
cd fe-travello-new
npm run dev
```

### 3. Access Points
- **Admin Shop**: http://localhost:5173/admin/shop
- **User Shop**: http://localhost:5173/work/shop
- **API Health**: http://localhost:55435/api/health

## Testing

### 1. Admin Shop Management
1. Buka http://localhost:5173/admin/shop
2. Login sebagai admin
3. Test:
   - Add new product
   - Edit existing product
   - Delete product
   - Search/filter products

### 2. User Shop Display
1. Buka http://localhost:5173/work/shop
2. Verifikasi:
   - Products dari backend muncul
   - Filter berfungsi
   - Pagination berfungsi
   - Click product untuk detail

### 3. API Testing
```bash
# Get all products
curl http://localhost:55435/api/shop

# Create product (admin)
curl -X POST http://localhost:55435/api/shop \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Product","price":"$50","serviceCategory":"Test","status":"active"}'

# Get categories
curl http://localhost:55435/api/shop/categories
```

## Database Schema

### ShopItem Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  imageSrc: String (default: "/placeholder-image.png"),
  price: String (required),
  deliveryTime: String,
  serviceCategory: String (required),
  status: String (enum: ["active", "inactive"], default: "active"),
  details: [{
    _id: ObjectId,
    fullText: String (required)
  }],
  advantages: [{
    _id: ObjectId,
    title: String (required),
    subtitle: String (required)
  }],
  packages: [{
    _id: ObjectId,
    packageKey: String (enum: ["basic", "standard", "premium"]),
    badge: String (required),
    description: String (required),
    features: [String],
    defaultWords: Number (required),
    basePrice: Number (required)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Port Conflict
Jika port 55435 digunakan:
```bash
PORT=55436 npm start
```

### MongoDB Connection
Pastikan MongoDB running:
```bash
# Windows
net start MongoDB

# Atau manual
mongod
```

### CORS Issues
Check frontend URL di backend CORS config di `src/app.js`.

## Features Implemented

✅ **Backend**
- MongoDB model dengan schema lengkap
- RESTful API endpoints
- Error handling & validation
- Search & filtering
- Pagination

✅ **Frontend Admin**
- Real-time data loading
- CRUD operations
- Type safety
- Error handling & toasts

✅ **Frontend User**
- Dynamic product loading
- Filter & search
- Responsive grid
- Navigation to details

## Next Steps

1. **Product Details Page**: Implement detail view dengan packages, advantages, details
2. **Image Upload**: Implement file upload untuk product images
3. **Order System**: Add order management
4. **Payment Integration**: Connect dengan payment gateway
5. **Reviews**: Add product review system
