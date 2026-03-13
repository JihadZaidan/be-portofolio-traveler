// Create transactions table using Node.js
const mysql = require('mysql2/promise');

async function createTransactionsTable() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            database: 'travello_db',
            user: 'root',
            password: ''
        });

        console.log('🔨 Creating transactions table...');

        // Drop table if exists
        await connection.execute('DROP TABLE IF EXISTS transactions');
        console.log('🗑️ Dropped existing transactions table');

        // Create transactions table
        await connection.execute(`
            CREATE TABLE transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                transactionId VARCHAR(255) NOT NULL UNIQUE,
                userId VARCHAR(255) NULL,
                type ENUM('copywriter_service', 'travel_package', 'consultation', 'other') NOT NULL,
                serviceName VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                amount DECIMAL(15,2) NOT NULL DEFAULT 0,
                currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
                discount DECIMAL(15,2) NOT NULL DEFAULT 0,
                tax DECIMAL(15,2) NOT NULL DEFAULT 0,
                finalAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
                paymentMethod ENUM('transfer', 'ewallet', 'credit_card', 'paypal', 'other', 'midtrans', 'bank_transfer', 'qris') NOT NULL,
                paymentStatus ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled', 'unpaid') NOT NULL DEFAULT 'pending',
                paymentDate DATETIME NULL,
                status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
                confirmedAt DATETIME NULL,
                startedAt DATETIME NULL,
                completedAt DATETIME NULL,
                cancelledAt DATETIME NULL,
                notes TEXT NULL,
                adminNotes TEXT NULL,
                serviceDetails JSON NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_transactionId (transactionId),
                INDEX idx_userId (userId),
                INDEX idx_status (status),
                INDEX idx_paymentStatus (paymentStatus),
                INDEX idx_createdAt (createdAt)
            )
        `);
        console.log('✅ Transactions table created successfully');

        // Insert sample data
        await connection.execute(`
            INSERT INTO transactions (
                transactionId, userId, type, serviceName, description, amount, 
                currency, discount, tax, finalAmount, paymentMethod, paymentStatus, 
                status, serviceDetails, createdAt, updatedAt
            ) VALUES 
            ('TXN-001', 'john.doe@example.com', 'copywriter_service', 'SEO Content Writing', 
             'Professional SEO content for website', 500000.00, 'IDR', 0, 0, 500000.00, 
             'bank_transfer', 'paid', 'completed',
             '{"customFields": {"customerEmail": "john.doe@example.com", "customerName": "John Doe"}, "copywriterPackage": "standard"}',
             NOW(), NOW()),
            ('TXN-002', 'jane.smith@example.com', 'copywriter_service', 'Blog Writing Package', 
             'Travel blog content writing service', 750000.00, 'IDR', 50000, 0, 700000.00, 
             'midtrans', 'paid', 'in_progress',
             '{"customFields": {"customerEmail": "jane.smith@example.com", "customerName": "Jane Smith"}, "copywriterPackage": "premium"}',
             NOW(), NOW()),
            ('TXN-003', 'guest@example.com', 'consultation', 'Travel Consultation', 
             'Personalized travel planning consultation', 1000000.00, 'IDR', 100000, 0, 900000.00, 
             'qris', 'pending', 'confirmed',
             '{"customFields": {"customerEmail": "guest@example.com", "customerName": "Guest User"}, "consultationType": "travel_planning"}',
             NOW(), NOW())
        `);
        console.log('✅ Sample transactions inserted');

        // Verify
        const [result] = await connection.execute('SELECT COUNT(*) as count FROM transactions');
        console.log(`📊 Total transactions: ${result[0].count}`);

        await connection.end();
        console.log('🎉 Done!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createTransactionsTable();
