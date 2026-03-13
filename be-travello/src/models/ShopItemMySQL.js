const mysql = require('mysql2/promise');

// MySQL ShopItem model (fallback when MongoDB is not available)
class ShopItemMySQL {
    constructor() {
        this.tableName = 'shop_items';
        this.initTable();
    }

    async initTable() {
        try {
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || 'localhost',
                port: process.env.MYSQL_PORT || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'travello_db'
            });

            await connection.execute(`
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                    _id VARCHAR(255) PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    imageSrc TEXT DEFAULT '/placeholder-image.png',
                    price VARCHAR(255) NOT NULL,
                    deliveryTime TEXT,
                    serviceCategory VARCHAR(255) NOT NULL,
                    status ENUM('active', 'inactive') DEFAULT 'active',
                    details JSON,
                    advantages JSON,
                    packages JSON,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            await connection.end();
            console.log('✅ ShopItem MySQL table created/verified');
        } catch (error) {
            console.error('❌ Error creating ShopItem table:', error);
        }
    }

    async create(data) {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'travello_db'
        });

        try {
            const id = `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const [result] = await connection.execute(`
                INSERT INTO ${this.tableName} (_id, title, imageSrc, price, deliveryTime, serviceCategory, status, details, advantages, packages)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id,
                data.title,
                data.imageSrc || '/placeholder-image.png',
                data.price,
                data.deliveryTime || null,
                data.serviceCategory,
                data.status || 'active',
                JSON.stringify(data.details || []),
                JSON.stringify(data.advantages || []),
                JSON.stringify(data.packages || [])
            ]);

            await connection.end();
            return { _id: id, ...data };
        } catch (error) {
            await connection.end();
            throw error;
        }
    }

    async find(query = {}) {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'travello_db'
        });

        try {
            let sql = `SELECT * FROM ${this.tableName}`;
            const params = [];

            if (query.status) {
                sql += ` WHERE status = ?`;
                params.push(query.status);
            }

            if (query.serviceCategory) {
                sql += sql.includes('WHERE') ? ` AND serviceCategory LIKE ?` : ` WHERE serviceCategory LIKE ?`;
                params.push(`%${query.serviceCategory}%`);
            }

            if (query.$or) {
                const searchConditions = [];
                query.$or.forEach(condition => {
                    if (condition.title) {
                        searchConditions.push(`title LIKE ?`);
                        params.push(`%${condition.title.$options === 'i' ? condition.title.$regex : condition.title}%`);
                    }
                    if (condition.serviceCategory) {
                        searchConditions.push(`serviceCategory LIKE ?`);
                        params.push(`%${condition.serviceCategory.$options === 'i' ? condition.serviceCategory.$regex : condition.serviceCategory}%`);
                    }
                });
                sql += sql.includes('WHERE') ? ` AND (${searchConditions.join(' OR ')})` : ` WHERE ${searchConditions.join(' OR ')}`;
            }

            sql += ` ORDER BY createdAt DESC`;

            if (query.limit) {
                sql += ` LIMIT ?`;
                params.push(parseInt(query.limit));
            }

            if (query.skip) {
                sql += ` OFFSET ?`;
                params.push(parseInt(query.skip));
            }

            const [rows] = await connection.execute(sql, params);
            await connection.end();
            return rows;
        } catch (error) {
            await connection.end();
            throw error;
        }
    }

    async countDocuments(query = {}) {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'travello_db'
        });

        try {
            let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
            const params = [];

            if (query.status) {
                sql += ` WHERE status = ?`;
                params.push(query.status);
            }

            const [rows] = await connection.execute(sql, params);
            await connection.end();
            return rows[0].count;
        } catch (error) {
            await connection.end();
            throw error;
        }
    }

    async findByIdAndUpdate(id, updateData) {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'travello_db'
        });

        try {
            const [result] = await connection.execute(`
                UPDATE ${this.tableName} 
                SET title = ?, imageSrc = ?, price = ?, deliveryTime = ?, serviceCategory = ?, status = ?, details = ?, advantages = ?, packages = ?, updatedAt = CURRENT_TIMESTAMP
                WHERE _id = ?
            `, [
                updateData.title,
                updateData.imageSrc,
                updateData.price,
                updateData.deliveryTime,
                updateData.serviceCategory,
                updateData.status,
                JSON.stringify(updateData.details || []),
                JSON.stringify(updateData.advantages || []),
                JSON.stringify(updateData.packages || []),
                id
            ]);

            await connection.end();
            
            if (result.affectedRows === 0) {
                return null;
            }

            // Return updated item
            return this.findById(id);
        } catch (error) {
            await connection.end();
            throw error;
        }
    }

    async findById(id) {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'travello_db'
        });

        try {
            const [rows] = await connection.execute(`
                SELECT * FROM ${this.tableName} WHERE _id = ?
            `, [id]);

            await connection.end();
            return rows[0] || null;
        } catch (error) {
            await connection.end();
            throw error;
        }
    }

    async findByIdAndDelete(id) {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'travello_db'
        });

        try {
            const [result] = await connection.execute(`
                DELETE FROM ${this.tableName} WHERE _id = ?
            `, [id]);

            await connection.end();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.end();
            throw error;
        }
    }

    async getAll() {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'travello_db'
        });

        try {
            const [rows] = await connection.execute(`
                SELECT * FROM ${this.tableName} ORDER BY createdAt DESC
            `);

            await connection.end();
            return rows;
        } catch (error) {
            await connection.end();
            throw error;
        }
    }
}

module.exports = new ShopItemMySQL();
