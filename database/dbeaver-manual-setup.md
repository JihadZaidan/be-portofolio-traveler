# 🔧 Manual DBeaver Setup Guide

## 📋 Problem: SQLite3 not installed
SQLite3 command line tidak tersedia di sistem Anda.

## 🎯 Solution: Use DBeaver to Create Schema

### Step 1: Connect DBeaver to SQLite
1. **Buka DBeaver**
2. **File → New → Database Connection** (Ctrl+Shift+N)
3. **Search:** ketik "SQLite"
4. **Pilih SQLite** → **Next >**
5. **Connection Name:** TRAVELLO_DB
6. **Path:** `C:/Users/ACER/workandshop/be-travello/database/travello.db`
7. **Test Connection** → **Finish**

### Step 2: Create Database Schema
1. **Double click** pada database TRAVELLO_DB
2. **Klik kanan** → **SQL Editor**
3. **Buka file:** `quick-setup.sql` (ada di folder yang sama)
4. **Select semua** SQL (Ctrl+A)
5. **Copy** (Ctrl+C)
6. **Paste** di DBeaver SQL Editor (Ctrl+V)
7. **Execute** (klik ▶️ atau tekan F5)

### Step 3: Verify Schema
1. **Refresh** database (klik kanan → Refresh atau F5)
2. **Expand** folder **Tables**
3. Harus muncul:
   - ✅ `users`
   - ✅ `chat_messages`
   - ✅ `user_sessions`
   - ✅ `travel_knowledge`

### Step 4: Test Data
```sql
-- Test users table
SELECT * FROM users;

-- Test knowledge base
SELECT * FROM travel_knowledge LIMIT 5;
```

### Step 5: Create ERD
1. **Klik kanan** pada database TRAVELLO_DB
2. **ER Diagrams → Create ER Diagram**
3. **Drag semua tables** ke diagram
4. **Auto-layout:** Right click → Layout → Hierarchical
5. **Save:** Ctrl+S

## 🚀 Alternative: Install SQLite3 (Optional)

### Option 1: Download Manual
1. Download dari: https://sqlite.org/download.html
2. Pilih "sqlite-tools-win32-x86-*.zip"
3. Extract dan tambahkan ke PATH

### Option 2: Use Chocolatey
```powershell
# Install Chocolatey (jika belum)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install SQLite3
choco install sqlite
```

### Option 3: Use Winget
```powershell
winget install SQLite.SQLite
```

## ✅ Success Criteria
- [ ] DBeaver connect ke travello.db
- [ ] 4 tables tercreate
- [ ] Sample data terinsert
- [ ] ERD bisa dibuat
- [ ] Backend bisa connect

## 📞 Help
Jika masih error:
1. Pastikan path file benar: `C:/Users/ACER/workandshop/be-travello/database/travello.db`
2. Gunakan forward slash `/` bukan backslash `\`
3. Run DBeaver as Administrator
4. Check file permissions
