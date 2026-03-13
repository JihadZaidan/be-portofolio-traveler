// Simple shop items insertion
const mysql = require('mysql2/promise');

async function addShopItems() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            database: 'travello_db',
            user: 'root',
            password: ''
        });

        console.log('🔍 Checking shop_items...');
        
        // Check if table exists and has data
        try {
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM shop_items');
            console.log(`📦 Current shop items: ${rows[0].count}`);
            
            if (rows[0].count === 0) {
                console.log('➕ Adding sample shop items...');
                
                // Insert sample items
                await connection.execute(`
                    INSERT INTO shop_items (_id, title, imageSrc, price, deliveryTime, serviceCategory, status, details, advantages, packages, createdAt, updatedAt) 
                    VALUES 
                    ('shop-item-1', 'SEO Content Writing Package', '/placeholder-seo.png', '500000', '3 Days', 'copywriter', 'active', 
                     '{"description": "Professional SEO content", "features": ["Keyword research", "SEO optimization"]}', 
                     '["SEO friendly", "High quality"]', 
                     '[{"name": "Basic", "pages": 1, "price": 500000}]',
                     NOW(), NOW()),
                    ('shop-item-2', 'Travel Blog Writing Service', '/placeholder-blog.png', '750000', '5 Days', 'copywriter', 'active',
                     '{"description": "Travel blog content", "features": ["Travel stories", "Destination guides"]}',
                     '["Original content", "Travel expertise"]',
                     '[{"name": "Single Post", "posts": 1, "price": 750000}]',
                     NOW(), NOW()),
                    ('shop-item-3', 'Website Content Package', '/placeholder-web.png', '1000000', '7 Days', 'copywriter', 'active',
                     '{"description": "Complete website content", "features": ["Homepage content", "About us"]}',
                     '["Comprehensive", "Professional"]',
                     '[{"name": "Starter", "pages": 3, "price": 1000000}]',
                     NOW(), NOW())
                `);
                
                console.log('✅ Added 3 sample shop items!');
            } else {
                console.log('ℹ️ Shop items already exist');
            }
            
            // Show current items
            const [items] = await connection.execute('SELECT _id, title, price, status FROM shop_items LIMIT 5');
            console.log('\n📋 Current shop items:');
            items.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.title} - Rp ${item.price} - ${item.status}`);
            });
            
        } catch (error) {
            console.log('❌ Table error:', error.message);
        }
        
        await connection.end();
        console.log('🎉 Done!');
        
    } catch (error) {
        console.error('❌ Connection error:', error.message);
    }
}

addShopItems();
