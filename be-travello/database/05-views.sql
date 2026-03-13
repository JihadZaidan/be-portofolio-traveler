-- TRAVELLO Database Views
-- Reporting and analytics views

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_verified = TRUE THEN 1 END) as verified_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
    SUM(total_spent) as total_revenue,
    AVG(total_spent) as avg_spent_per_user,
    COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users_this_week
FROM users
WHERE is_active = TRUE;

-- Transaction statistics view
CREATE OR REPLACE VIEW transaction_stats AS
SELECT 
    COUNT(*) as total_transactions,
    SUM(final_amount) as total_revenue,
    COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_transactions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
    AVG(final_amount) as avg_transaction_value,
    COUNT(CASE WHEN type = 'copywriter_service' THEN 1 END) as copywriter_transactions,
    COUNT(CASE WHEN type = 'travel_package' THEN 1 END) as travel_transactions,
    COUNT(CASE WHEN type = 'consultation' THEN 1 END) as consultation_transactions
FROM transactions;

-- Chat statistics view
CREATE OR REPLACE VIEW chat_stats AS
SELECT 
    COUNT(*) as total_chats,
    COUNT(CASE WHEN status IN ('active', 'waiting') THEN 1 END) as active_chats,
    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_chats,
    COUNT(CASE WHEN is_guest = FALSE THEN 1 END) as registered_user_chats,
    COUNT(CASE WHEN is_guest = TRUE THEN 1 END) as guest_chats,
    AVG(satisfaction_rating) as avg_satisfaction,
    COUNT(CASE WHEN satisfaction_rating >= 4 THEN 1 END) as happy_customers,
    COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_chats
FROM admin_chat;

-- Monthly revenue view
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT 
    YEAR(created_at) as year,
    MONTH(created_at) as month,
    COUNT(*) as transactions,
    SUM(final_amount) as revenue,
    AVG(final_amount) as avg_transaction
FROM transactions
WHERE payment_status = 'paid'
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY year DESC, month DESC;

-- User activity view
CREATE OR REPLACE VIEW user_activity AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.last_login,
    COUNT(DISTINCT t.id) as transaction_count,
    COALESCE(SUM(t.final_amount), 0) as total_spent,
    COUNT(DISTINCT ac.id) as chat_count,
    CASE 
        WHEN u.last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'active'
        WHEN u.last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'moderate'
        ELSE 'inactive'
    END as activity_level
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN admin_chat ac ON u.id = ac.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.name, u.email, u.last_login
ORDER BY u.last_login DESC;
