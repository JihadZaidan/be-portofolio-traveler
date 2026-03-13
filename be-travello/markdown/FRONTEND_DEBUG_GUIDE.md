# Frontend Data Display Debugging Guide

## Problem
Data berhasil disimpan di backend tapi tidak muncul di frontend admin shop table.

## Debugging Steps

### 1. **Buka Developer Tools**
1. Buka http://localhost:5173/admin/shop
2. Tekan **F12** untuk buka Developer Tools
3. Pergi ke **Console** tab

### 2. **Expected Console Logs**
Saat halaman dimuat, seharusnya muncul:
```
🔄 useEffect triggered, calling loadShopItems...
🔄 Starting to load shop items...
Fetching shop items with params: {status: 'all'}
Query string: status=all
Response status: 200
API response: {success: true, data: [...]}
📦 Shop items loaded from API: {success: true, data: [...]}
📊 Data length: X
📋 Data sample: {_id: "shop_...", title: "...", ...}
✅ Items state updated: X, 'items'
🔄 Loading completed, loading state: false
📊 Items state changed: X, 'items'
📋 Items data: [{_id: "...", title: "...", ...}]
```

### 3. **Check Network Tab**
1. Pergi ke **Network** tab
2. Filter dengan `/api/shop`
3. Lihat request dan response:
   - **Request URL**: `http://localhost:55435/api/shop?status=all`
   - **Response Status**: 200 OK
   - **Response Body**: `{success: true, data: [...]}`

### 4. **Common Issues & Solutions**

#### ❌ **Issue 1: CORS Error**
```
Access to fetch at 'http://localhost:55435/api/shop' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: Backend CORS configuration

#### ❌ **Issue 2: API Not Found**
```
GET http://localhost:55435/api/shop 404 (Not Found)
```
**Solution**: Backend routes tidak terdaftar

#### ❌ **Issue 3: Backend Not Running**
```
GET http://localhost:55435/api/shop net::ERR_CONNECTION_REFUSED
```
**Solution**: Start backend server

#### ❌ **Issue 4: State Not Updated**
```
📦 Shop items loaded from API: {success: true, data: [...]}
✅ Items state updated: 0, 'items'  // ❌ Length 0!
```
**Solution**: React state issue

### 5. **Manual Testing**

#### Test API Directly
```bash
# Di PowerShell
Invoke-RestMethod -Uri "http://localhost:55435/api/shop" -Method GET

# Expected Result:
success data
------- ----
   True [{_id=shop_...; title=...; ...}]
```

#### Test Create Product
```bash
# Test create new product
Invoke-RestMethod -Uri "http://localhost:55435/api/shop" -Method POST -ContentType "application/json" -Body '{"title":"Test Product","price":"$50","serviceCategory":"Test","status":"active"}'
```

### 6. **React DevTools Debugging**

#### Check State
1. Buka React DevTools
2. Pergi ke **Components** tab
3. Pilih **AdminShopPage**
4. Lihat **Hooks** section:
   - `items`: harusnya berisi array
   - `loading`: harusnya false setelah load
   - `search`: string untuk filter

#### Check Props
1. Pergi ke **AdminTable** component
2. Lihat **data** prop:
   - Harusnya menerima array dengan data

### 7. **Backend Verification**

#### Check MySQL Database
```sql
-- Connect ke MySQL dan cek table
SELECT * FROM shop_items;
```

#### Check Backend Logs
```bash
# Lihat console output backend
npm start
# Harusnya muncul:
# Using MySQL ShopItem model (fallback)
# GET /api/shop?status=all
# Shop items loaded from API: [...]
```

## Current Implementation Status

### ✅ **Backend Working**
- MySQL database connection
- ShopItem CRUD operations  
- API responses dengan data

### ✅ **Frontend Implementation**
- API calls dengan proper error handling
- Loading state management
- Console logging untuk debugging

### 🔧 **Added Debugging**
- Enhanced console logging dengan emojis
- useEffect tracking
- State change monitoring
- API response logging

## Next Steps

### 1. **Debug dengan Console Logs**
Buka admin shop dan lihat console logs untuk tracking data flow

### 2. **Verify API Response**
Pastikan API mengembalikan data dengan format benar

### 3. **Check React State**
Gunakan React DevTools untuk memverifikasi state updates

### 4. **Test Manual Refresh**
Coba refresh halaman untuk trigger data reload

---
**Status**: Enhanced debugging ditambahkan, siap untuk melacak masalah data flow.
