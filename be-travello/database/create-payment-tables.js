const { sequelize } = require('../src/config/database.config.js');

async function createPaymentTables() {
    try {
        console.log('Creating payment tables...');

        // Create payments table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                method VARCHAR(50) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
                description TEXT NOT NULL,
                booking_id VARCHAR(255),
                customer_info TEXT,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                processing_fee DECIMAL(10,2) DEFAULT 0,
                total_amount DECIMAL(10,2) NOT NULL,
                payment_gateway_response TEXT,
                refund_reason TEXT,
                refund_processed_at DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create indexes for payments table
        await sequelize.query(`
            ALTER TABLE payments 
            ADD INDEX IF NOT EXISTS idx_payments_user_id (user_id),
            ADD INDEX IF NOT EXISTS idx_payments_status (status),
            ADD INDEX IF NOT EXISTS idx_payments_method (method),
            ADD INDEX IF NOT EXISTS idx_payments_booking_id (booking_id),
            ADD INDEX IF NOT EXISTS idx_payments_created_at (created_at),
            ADD INDEX IF NOT EXISTS idx_payments_user_status (user_id, status)
        `);

        // Create payment_transactions table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS payment_transactions (
                id VARCHAR(255) PRIMARY KEY,
                payment_id VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
                description TEXT,
                gateway_transaction_id VARCHAR(255),
                gateway_response TEXT,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create indexes for payment_transactions table
        await sequelize.query(`
            ALTER TABLE payment_transactions
            ADD INDEX IF NOT EXISTS idx_payment_transactions_payment_id (payment_id),
            ADD INDEX IF NOT EXISTS idx_payment_transactions_type (type),
            ADD INDEX IF NOT EXISTS idx_payment_transactions_status (status),
            ADD INDEX IF NOT EXISTS idx_payment_transactions_gateway_id (gateway_transaction_id)
        `);

        // Create payment_methods table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS payment_methods (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                display_name VARCHAR(100) NOT NULL,
                description TEXT,
                icon VARCHAR(50),
                fees DECIMAL(5,2) DEFAULT 0,
                fixed_fee DECIMAL(10,2) DEFAULT 0,
                min_amount DECIMAL(10,2),
                max_amount DECIMAL(10,2),
                is_active BOOLEAN NOT NULL DEFAULT 1,
                config TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create index for payment_methods table
        await sequelize.query(`
            ALTER TABLE payment_methods
            ADD INDEX IF NOT EXISTS idx_payment_methods_is_active (is_active)
        `);

        // Insert default payment methods
        await sequelize.query(`
            INSERT IGNORE INTO payment_methods (id, name, display_name, description, icon, fees, fixed_fee, min_amount, max_amount, is_active) VALUES
            ('credit_card', 'credit_card', 'Credit Card', 'Visa, Mastercard, JCB', '💳', 2.9, 0, 10000, 50000000, 1),
            ('bank_transfer', 'bank_transfer', 'Bank Transfer', 'Transfer to virtual account', '🏦', 0, 0, 10000, 100000000, 1),
            ('ewallet', 'ewallet', 'E-Wallet', 'GoPay, OVO, Dana, ShopeePay', '📱', 1.5, 0, 1000, 20000000, 1),
            ('virtual_account', 'virtual_account', 'Virtual Account', 'BCA, BNI, BRI, Mandiri VA', '🔢', 0, 0, 10000, 50000000, 1)
        `);

        console.log('✅ Payment tables created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating payment tables:', error);
        throw error;
    }
}

// Run the migration
if (require.main === module) {
    createPaymentTables()
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { createPaymentTables };
