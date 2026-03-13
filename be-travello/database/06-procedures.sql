-- TRAVELLO Stored Procedures
-- Common database operations

DELIMITER //

-- Procedure to get user transaction history
CREATE PROCEDURE GetUserTransactionHistory(IN user_id_param INT, IN limit_param INT)
BEGIN
    SELECT 
        t.transaction_id,
        t.type,
        t.service_name,
        t.final_amount,
        t.payment_status,
        t.status,
        t.created_at,
        CASE t.type
            WHEN 'copywriter_service' THEN t.copywriter_package
            WHEN 'travel_package' THEN t.travel_destination
            WHEN 'consultation' THEN t.consultation_type
            ELSE 'Other'
        END as service_detail
    FROM transactions t
    WHERE t.user_id = user_id_param
    ORDER BY t.created_at DESC
    LIMIT limit_param;
END //

-- Procedure to get monthly revenue
CREATE PROCEDURE GetMonthlyRevenue(IN year_param INT)
BEGIN
    SELECT 
        MONTH(created_at) as month,
        COUNT(*) as transactions,
        SUM(final_amount) as revenue,
        AVG(final_amount) as avg_transaction,
        COUNT(CASE WHEN type = 'copywriter_service' THEN 1 END) as copywriter_count,
        COUNT(CASE WHEN type = 'travel_package' THEN 1 END) as travel_count,
        COUNT(CASE WHEN type = 'consultation' THEN 1 END) as consultation_count
    FROM transactions
    WHERE YEAR(created_at) = year_param
        AND payment_status = 'paid'
    GROUP BY MONTH(created_at)
    ORDER BY month;
END //

-- Procedure to update user statistics
CREATE PROCEDURE UpdateUserStats(IN user_id_param INT)
BEGIN
    UPDATE users 
    SET 
        total_transactions = (
            SELECT COUNT(*) 
            FROM transactions 
            WHERE user_id = user_id_param
        ),
        total_spent = (
            SELECT COALESCE(SUM(final_amount), 0) 
            FROM transactions 
            WHERE user_id = user_id_param 
                AND payment_status = 'paid'
        )
    WHERE id = user_id_param;
END //

-- Procedure to get chat analytics
CREATE PROCEDURE GetChatAnalytics(IN date_range_days INT)
BEGIN
    SELECT 
        COUNT(*) as total_chats,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_chats,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_chats,
        AVG(satisfaction_rating) as avg_satisfaction,
        COUNT(CASE WHEN is_guest = TRUE THEN 1 END) as guest_chats,
        COUNT(CASE WHEN is_guest = FALSE THEN 1 END) as registered_chats,
        AVG(TIMESTAMPDIFF(MINUTE, created_at, COALESCE(resolved_at, NOW()))) as avg_resolution_time_minutes
    FROM admin_chat
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL date_range_days DAY);
END //

-- Procedure to create new chat session
CREATE PROCEDURE CreateChatSession(
    IN user_id_param INT,
    IN user_name_param VARCHAR(255),
    IN user_email_param VARCHAR(255),
    IN is_guest_param BOOLEAN,
    OUT session_id_param VARCHAR(50)
)
BEGIN
    DECLARE new_session_id VARCHAR(50);
    
    SET new_session_id = CONCAT('CHAT', UNIX_TIMESTAMP(), FLOOR(RAND() * 10000));
    
    INSERT INTO admin_chat (session_id, user_id, user_name, user_email, is_guest)
    VALUES (new_session_id, user_id_param, user_name_param, user_email_param, is_guest_param);
    
    SET session_id_param = new_session_id;
END //

-- Procedure to add chat message
CREATE PROCEDURE AddChatMessage(
    IN chat_id_param INT,
    IN sender_param ENUM('user', 'admin'),
    IN sender_name_param VARCHAR(255),
    IN message_param TEXT,
    IN sender_id_param INT
)
BEGIN
    INSERT INTO chat_messages (chat_id, sender, sender_name, message, sender_id)
    VALUES (chat_id_param, sender_param, sender_name_param, message_param, sender_id_param);
    
    -- Update chat session
    UPDATE admin_chat 
    SET 
        last_message = message_param,
        last_message_sender = sender_param,
        last_message_timestamp = NOW(),
        last_activity_at = NOW(),
        unread_admin_count = CASE WHEN sender_param = 'user' THEN unread_admin_count + 1 ELSE unread_admin_count END,
        unread_user_count = CASE WHEN sender_param = 'admin' THEN unread_user_count + 1 ELSE unread_user_count END
    WHERE id = chat_id_param;
END //

DELIMITER ;
