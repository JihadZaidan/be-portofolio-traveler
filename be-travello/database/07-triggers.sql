-- TRAVELLO Database Triggers
-- Automatic data updates and integrity

DELIMITER //

-- Trigger to update user stats after transaction insert
CREATE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    CALL UpdateUserStats(NEW.user_id);
END //

-- Trigger to update user stats after transaction update
CREATE TRIGGER after_transaction_update
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF NEW.payment_status != OLD.payment_status OR NEW.final_amount != OLD.final_amount THEN
        CALL UpdateUserStats(NEW.user_id);
    END IF;
END //

-- Trigger to update last activity in chat after message insert
CREATE TRIGGER after_message_insert
AFTER INSERT ON chat_messages
FOR EACH ROW
BEGIN
    UPDATE admin_chat 
    SET 
        last_message = NEW.message,
        last_message_sender = NEW.sender,
        last_message_timestamp = NEW.timestamp,
        last_activity_at = NEW.timestamp,
        unread_admin_count = CASE WHEN NEW.sender = 'user' THEN unread_admin_count + 1 ELSE unread_admin_count END,
        unread_user_count = CASE WHEN NEW.sender = 'admin' THEN unread_user_count + 1 ELSE unread_user_count END
    WHERE id = NEW.chat_id;
END //

-- Trigger to update last activity in chat after message update
CREATE TRIGGER after_message_update
AFTER UPDATE ON chat_messages
FOR EACH ROW
BEGIN
    IF NEW.message != OLD.message OR NEW.is_edited != OLD.is_edited THEN
        UPDATE admin_chat 
        SET 
            last_message = NEW.message,
            last_activity_at = NEW.timestamp
        WHERE id = NEW.chat_id;
    END IF;
END //

-- Trigger to maintain user last login
CREATE TRIGGER before_user_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    -- Auto-update last_login if user is being marked as verified
    IF NEW.is_verified = TRUE AND OLD.is_verified = FALSE THEN
        SET NEW.last_login = NOW();
    END IF;
END //

-- Trigger to log transaction status changes
CREATE TRIGGER log_transaction_status_change
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        -- You could insert into a log table here if needed
        -- For now, just update timestamps
        IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
            UPDATE transactions SET confirmed_at = NOW() WHERE id = NEW.id;
        ELSEIF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
            UPDATE transactions SET started_at = NOW() WHERE id = NEW.id;
        ELSEIF NEW.status = 'completed' AND OLD.status != 'completed' THEN
            UPDATE transactions SET completed_at = NOW() WHERE id = NEW.id;
        ELSEIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
            UPDATE transactions SET cancelled_at = NOW() WHERE id = NEW.id;
        END IF;
    END IF;
END //

DELIMITER ;
