# Membuat Google OAuth Client ID Baru

## Langkah 1: Buat Client ID Baru

1. **Buka Google Cloud Console**
   - https://console.cloud.google.com/
   - Pilih project yang sama atau buat project baru

2. **Buat Credentials Baru**
   - Menu: APIs & Services → Credentials
   - Klik "+ CREATE CREDENTIALS"
   - Pilih "OAuth 2.0 Client ID"

3. **Configure OAuth Consent Screen**
   - Pilih "External" (jika belum ada)
   - Isi aplikasi name: "TRAVELLO Development"
   - User support email: email Anda
   - Developer contact: email Anda
   - Klik "SAVE AND CONTINUE"

4. **Add Scopes**
   - Klik "+ ADD OR REMOVE SCOPES"
   - Pilih: `.../auth/userinfo.email`
   - Pilih: `.../auth/userinfo.profile`
   - Klik "UPDATE"

5. **Test Users**
   - Klik "+ ADD USERS"
   - Tambahkan email Anda untuk testing
   - Klik "SAVE AND CONTINUE"

6. **Create Client ID**
   - Application type: "Web application"
   - Name: "TRAVELLO Web Client"
   - Authorized redirect URIs:
     ```
     http://localhost:55435/api/auth/google/callback
     ```
   - Klik "CREATE"

7. **Copy Credentials**
   - Client ID (baru)
   - Client Secret (baru)

## Langkah 2: Update .env

```bash
# Ganti dengan credentials baru
GOOGLE_CLIENT_ID=client_id_baru_disini
GOOGLE_CLIENT_SECRET=client_secret_baru_disini
GOOGLE_CALLBACK_URL=http://localhost:55435/api/auth/google/callback
```

## Langkah 3: Restart Server

```bash
# Kill existing server
taskkill /F /IM node.exe

# Start dengan credentials baru
$env:GOOGLE_CLIENT_ID="client_id_baru"
$env:GOOGLE_CLIENT_SECRET="client_secret_baru"
npm start
```

## Keuntungan Client ID Baru
- Tidak ada conflict dengan URI lama
- Clean configuration untuk development
- Bisa di-set khusus untuk localhost
