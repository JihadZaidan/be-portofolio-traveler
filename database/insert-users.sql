-- TRAVELLO Database - Insert User Data
-- Script ini untuk memasukkan data user yang sudah login ke DBeaver SQLite

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Insert data users dari travello.json
INSERT OR IGNORE INTO users (
    id,
    username,
    email,
    password,
    display_name,
    role,
    is_email_verified,
    last_login,
    created_at,
    updated_at
) VALUES
(
    'fa029540-14ae-4054-945d-12f0d0fa5fa9',
    'testuser',
    'test@example.com',
    '$2b$12$36K1ayZtQVfe3MPEJSzxXeqD5ZMGlFli4ac2P9oKtjZrYam0vlW9e',
    'Test User',
    'user',
    1,
    '2026-01-26T03:06:13.644Z',
    '2026-01-26T03:05:44.747Z',
    '2026-01-26T03:06:13.645Z'
),
(
    '7cb3664b-40ac-4baa-a55e-e60f0944a69c',
    'wrm23r13rn',
    'wrm23r13rn@yahoo.com',
    '$2b$12$BeUAN5HWobBV0obhgli.8.2eA4DdGdCPUKNELmNAv7sfSu9il7l4y',
    'Revo Admj',
    'user',
    1,
    '2026-01-26T03:06:57.253Z',
    '2026-01-26T03:06:56.346Z',
    '2026-01-26T03:06:57.254Z'
),
(
    'c65fd650-3603-44ab-b37c-f2770cedfff2',
    'imanueladmojo',
    'admjrevo@gmail.com',
    '$2b$12$wuxVMStYMe316GFnBqTocuZjwah.njlMjDhm.9jJaKN/e90dtLRi2',
    'Imanuel Admojo',
    'user',
    1,
    '2026-01-26T04:21:37.787Z',
    '2026-01-26T04:21:37.772Z',
    '2026-01-26T04:21:37.788Z'
);

-- Verifikasi data yang diinsert
SELECT 
    '✅ User data inserted successfully!' as status,
    COUNT(*) as total_users_inserted
FROM users;

-- Tampilkan semua users untuk verifikasi
SELECT 
    id,
    username,
    email,
    display_name,
    role,
    is_email_verified,
    last_login,
    created_at,
    updated_at
FROM users 
ORDER BY created_at DESC;

-- Query tambahan untuk statistik users
SELECT 
    '📊 User Statistics' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
    COUNT(CASE WHEN is_email_verified = 1 THEN 1 END) as verified_users,
    COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_users
FROM users;
