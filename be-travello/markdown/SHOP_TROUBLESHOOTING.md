# Shop Error Troubleshooting Guide

## Error: "Failed to save product changes"

Jika Anda mengalami error "Failed to save product changes" saat mencoba save/upload di shop admin, berikut adalah langkah troubleshooting:

## 🔍 **Debugging Steps**

### 1. **Check Browser Console**
Buka Developer Tools (F12) dan lihat tab Console:
- Refresh halaman admin shop
- Coba tambah/edit product
- Lihat error logs di console

### 2. **Check Network Tab**
Di Developer Tools, buka tab Network:
- Filter dengan "shop" 
- Lihat request ke `/api/shop`
- Periksa status code dan response

### 3. **Backend Logs**
Backend sekarang memiliki detailed logging. Cek:
```bash
cd be-travello
npm logs
```

## 🛠️ **Common Issues & Solutions**

### Issue 1: **Missing Required Fields**
**Error**: `Missing required fields: title, imageSrc, price, serviceCategory`
**Solution**: Pastikan semua field required diisi:
- ✅ Title (wajib)
- ✅ Image (wajib) 
- ✅ Price (wajib)
- ✅ Category (wajib)
- ⚪ Delivery Time (opsional)

### Issue 2: **Invalid Image Format**
**Error**: Image upload gagal
**Solution**: 
- Gunakan image URL yang valid
- Atau upload image ke folder `public/images/`
- Contoh: `/images/product-name.jpg`

### Issue 3: **CORS Issues**
**Error**: Network error/CORS blocked
**Solution**: Backend sudah dikonfigurasi untuk CORS, pastikan:
- Frontend berjalan di `http://localhost:5173`
- Backend berjalan di `http://localhost:55435`

### Issue 4: **Database Connection**
**Error**: MongoDB connection failed
**Solution**:
```bash
# Start MongoDB
net start MongoDB

# Atau
mongod
```

## 🧪 **Test API Directly**

### Test Create Product:
```bash
# Di PowerShell
Invoke-RestMethod -Uri "http://localhost:55435/api/shop" -Method POST -ContentType "application/json" -Body '{"title":"Test Product","imageSrc":"/placeholder-image.png","price":"$50","serviceCategory":"Test","status":"active"}'

# Atau dengan curl (jika tersedia)
curl -X POST http://localhost:55435/api/shop -H "Content-Type: application/json" -d "{\"title\":\"Test Product\",\"imageSrc\":\"/placeholder-image.png\",\"price\":\"$50\",\"serviceCategory\":\"Test\",\"status\":\"active\"}"
```

### Test Get Products:
```bash
Invoke-RestMethod -Uri "http://localhost:55435/api/shop" -Method GET
```

## 📋 **Data Validation**

Backend memvalidasi field berikut:
```javascript
const requiredFields = ['title', 'imageSrc', 'price', 'serviceCategory'];
```

**Valid Data Example**:
```json
{
  "title": "I will write SEO content",
  "imageSrc": "/images/product.jpg",
  "price": "$50",
  "deliveryTime": "2 Days Delivery",
  "serviceCategory": "SEO Content",
  "status": "active"
}
```

## 🔧 **Quick Fix**

Jika error masih terjadi, coba:

1. **Restart Backend**:
```bash
cd be-travello
taskkill /F /IM node.exe
npm start
```

2. **Clear Browser Cache**:
- Ctrl + Shift + R (atau Cmd + Shift + R)
- Atau clear cache di Developer Tools

3. **Check Port**:
Pastikan tidak ada port conflict:
```bash
netstat -ano | findstr :55435
```

## 📞 **Get Help**

Jika masalah berlanjut:
1. **Screenshot error** dari browser console
2. **Screenshot network** request/response
3. **Copy backend logs** dari terminal
4. **Informasikan**:
   - Browser yang digunakan
   - Data yang dicoba input
   - Full error message

## 🎯 **Next Steps**

Setelah error diperbaiki:
1. Test create new product
2. Test edit existing product  
3. Test delete product
4. Verify data muncul di user shop: http://localhost:5173/work/shop

---
**Status**: Backend sudah diperbarui dengan detailed logging untuk memudahkan debugging.
