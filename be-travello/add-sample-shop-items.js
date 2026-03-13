// Add sample shop items to database
const mysql = require('mysql2');

async function addSampleShopItems() {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            database: 'travello_db',
            user: 'root',
            password: ''
        });

        console.log('🔍 Checking existing shop items...');
        const [existing] = await connection.execute('SELECT COUNT(*) as count FROM shop_items');
        console.log(`📦 Existing shop items: ${existing[0].count}`);

        // Add sample shop items if table is empty
        if (existing[0].count === 0) {
            console.log('➕ Adding sample shop items...');
            
            const sampleItems = [
                {
                    _id: 'shop-item-1',
                    title: 'SEO Content Writing Package',
                    imageSrc: '/placeholder-seo.png',
                    price: '500000',
                    deliveryTime: '3 Days',
                    serviceCategory: 'copywriter',
                    status: 'active',
                    details: JSON.stringify({
                        description: 'Professional SEO content writing for your website',
                        features: ['Keyword research', 'SEO optimization', '500-1000 words']
                    }),
                    advantages: JSON.stringify(['SEO friendly', 'High quality', 'Fast delivery']),
                    packages: JSON.stringify([
                        { name: 'Basic', pages: 1, price: 500000 },
                        { name: 'Standard', pages: 3, price: 1200000 },
                        { name: 'Premium', pages: 5, price: 2000000 }
                    ])
                },
                {
                    _id: 'shop-item-2',
                    title: 'Travel Blog Writing Service',
                    imageSrc: '/placeholder-blog.png',
                    price: '750000',
                    deliveryTime: '5 Days',
                    serviceCategory: 'copywriter',
                    status: 'active',
                    details: JSON.stringify({
                        description: 'Engaging travel blog content for your audience',
                        features: ['Travel stories', 'Destination guides', '1000-2000 words']
                    }),
                    advantages: JSON.stringify(['Original content', 'Travel expertise', 'SEO optimized']),
                    packages: JSON.stringify([
                        { name: 'Single Post', posts: 1, price: 750000 },
                        { name: 'Blog Package', posts: 5, price: 3500000 }
                    ])
                },
                {
                    _id: 'shop-item-3',
                    title: 'Website Content Package',
                    imageSrc: '/placeholder-web.png',
                    price: '1000000',
                    deliveryTime: '7 Days',
                    serviceCategory: 'copywriter',
                    status: 'active',
                    details: JSON.stringify({
                        description: 'Complete website content package',
                        features: ['Homepage content', 'About us', 'Services pages']
                    }),
                    advantages: JSON.stringify(['Comprehensive', 'Professional tone', 'Brand aligned']),
                    packages: JSON.stringify([
                        { name: 'Starter', pages: 3, price: 1000000 },
                        { name: 'Business', pages: 7, price: 2200000 }
                    ])
                }
            ];

            for (const item of sampleItems) {
                await connection.execute(`
                    INSERT INTO shop_items (
                        _id, title, imageSrc, price, deliveryTime, serviceCategory, 
                        status, details, advantages, packages
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    item._id, item.title, item.imageSrc, item.price, item.deliveryTime,
                    item.serviceCategory, item.status, item.details, item.advantages, item.packages
                ]);
                console.log(`✅ Added: ${item.title}`);
            }

            console.log(`🎉 Successfully added ${sampleItems.length} sample shop items!`);
        } else {
            console.log('ℹ️ Shop items already exist, skipping sample data insertion');
        }

        // Verify insertion
        const [check] = await connection.execute('SELECT * FROM shop_items LIMIT 3');
        console.log('\n📋 Current shop items:');
        check.forEach((item, index) => {
            console.log(`${index + 1}. ${item.title} - ${item.price} - ${item.status}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addSampleShopItems();
