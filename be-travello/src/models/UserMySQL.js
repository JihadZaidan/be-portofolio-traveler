const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

class UserMySQL {
    constructor() {
        this.connection = null;
        this.useSQLite = false;
        this.sqliteDb = null;
        this.initConnection();
    }

    async initConnection() {
        try {
            // Try MySQL first
            this.connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || 'localhost',
                port: process.env.MYSQL_PORT || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'travello_db'
            });
            console.log('✅ MySQL User model initialized');
        } catch (error) {
            console.error('❌ MySQL User model initialization failed:', error.message);
            console.log('🔄 Falling back to SQLite for development');
            this.useSQLite = true;
            this.initSQLite();
        }
    }

    initSQLite() {
        try {
            // Simple in-memory storage for development
            this.sqliteDb = {
                users: [],
                nextId: 1
            };
            console.log('✅ SQLite fallback initialized for development');
        } catch (error) {
            console.error('❌ SQLite initialization failed:', error);
        }
    }

    async create(userData) {
        try {
            const {
                id,
                googleId = null,
                email,
                username,
                displayName,
                password = null,
                profilePicture = null,
                provider = 'local',
                loginPage = 'default',
                isActive = true,
                isVerified = false,
                role = 'user'
            } = userData;

            if (this.useSQLite) {
                // SQLite fallback
                const user = {
                    id: id || `user_${this.sqliteDb.nextId++}`,
                    googleId,
                    email,
                    username,
                    displayName,
                    password,
                    profilePicture,
                    provider,
                    loginPage,
                    isActive,
                    isVerified,
                    role,
                    lastLogin: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                this.sqliteDb.users.push(user);
                console.log('✅ User created in SQLite fallback:', email);
                return user;
            }

            // MySQL implementation
            const query = `
                INSERT INTO users (
                    id, googleId, email, username, displayName, password, 
                    profilePicture, provider, loginPage, isActive, isVerified, 
                    role, lastLogin, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
            `;

            const [result] = await this.connection.execute(query, [
                id, googleId, email, username, displayName, password,
                profilePicture, provider, loginPage, isActive, isVerified, role
            ]);

            return { id, ...userData };
        } catch (error) {
            console.error('❌ Error creating user:', error);
            throw error;
        }
    }

    async findOne(criteria) {
        try {
            if (this.useSQLite) {
                // SQLite fallback
                return this.sqliteDb.users.find(user => {
                    if (criteria.email) return user.email === criteria.email;
                    if (criteria.username) return user.username === criteria.username;
                    if (criteria.googleId) return user.googleId === criteria.googleId;
                    if (criteria.id) return user.id === criteria.id;
                    return false;
                }) || null;
            }

            // MySQL implementation
            let query = 'SELECT * FROM users WHERE ';
            const params = [];

            if (criteria.email) {
                query += 'email = ?';
                params.push(criteria.email);
            } else if (criteria.username) {
                query += 'username = ?';
                params.push(criteria.username);
            } else if (criteria.googleId) {
                query += 'googleId = ?';
                params.push(criteria.googleId);
            } else if (criteria.id) {
                query += 'id = ?';
                params.push(criteria.id);
            }

            const [rows] = await this.connection.execute(query, params);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('❌ Error finding user:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            if (this.useSQLite) {
                // SQLite fallback
                return this.sqliteDb.users.find(user => user.id === id) || null;
            }

            // MySQL implementation
            const [rows] = await this.connection.execute(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('❌ Error finding user by ID:', error);
            throw error;
        }
    }

    async findMany(criteria = {}) {
        try {
            if (this.useSQLite) {
                // SQLite fallback
                let users = [...this.sqliteDb.users];
                
                // Apply filters
                if (criteria.isActive !== undefined) {
                    users = users.filter(user => user.isActive === criteria.isActive);
                }
                if (criteria.role) {
                    users = users.filter(user => user.role === criteria.role);
                }
                
                // Sort by createdAt descending
                users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // Apply limit
                if (criteria.limit) {
                    users = users.slice(0, criteria.limit);
                }
                
                return users;
            }

            // MySQL implementation
            let query = 'SELECT * FROM users';
            const params = [];

            // Build WHERE clause
            const whereConditions = [];
            if (criteria.isActive !== undefined) {
                whereConditions.push('isActive = ?');
                params.push(criteria.isActive);
            }
            if (criteria.role) {
                whereConditions.push('role = ?');
                params.push(criteria.role);
            }

            if (whereConditions.length > 0) {
                query += ' WHERE ' + whereConditions.join(' AND ');
            }

            // Add ORDER BY
            query += ' ORDER BY createdAt DESC';

            // Add LIMIT if specified
            if (criteria.limit) {
                query += ' LIMIT ?';
                params.push(criteria.limit);
            }

            console.log('🔍 Executing query:', query, 'with params:', params);
            const [rows] = await this.connection.execute(query, params);
            return rows;
        } catch (error) {
            console.error('❌ Error finding users:', error);
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            if (this.useSQLite) {
                // SQLite fallback
                const userIndex = this.sqliteDb.users.findIndex(user => user.id === id);
                if (userIndex === -1) {
                    throw new Error('User not found');
                }
                
                this.sqliteDb.users[userIndex] = {
                    ...this.sqliteDb.users[userIndex],
                    ...updateData,
                    updatedAt: new Date()
                };
                
                console.log('✅ User updated in SQLite fallback:', id);
                return this.sqliteDb.users[userIndex];
            }

            // MySQL implementation
            const fields = [];
            const params = [];

            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    params.push(updateData[key]);
                }
            });

            fields.push('updatedAt = NOW()');
            params.push(id);

            const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
            await this.connection.execute(query, params);

            return await this.findById(id);
        } catch (error) {
            console.error('❌ Error updating user:', error);
            throw error;
        }
    }

    async comparePassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('❌ Error comparing password:', error);
            return false;
        }
    }

    async hashPassword(password) {
        try {
            const salt = await bcrypt.genSalt(12);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            console.error('❌ Error hashing password:', error);
            throw error;
        }
    }

    async getUserStats() {
        try {
            if (this.useSQLite) {
                // SQLite fallback
                const activeUsers = this.sqliteDb.users.filter(user => user.isActive);
                const verifiedUsers = activeUsers.filter(user => user.isVerified);
                const totalSpent = activeUsers.reduce((sum, user) => sum + (user.totalSpent || 0), 0);
                const avgSpent = activeUsers.length > 0 ? totalSpent / activeUsers.length : 0;
                
                return {
                    totalUsers: activeUsers.length,
                    verifiedUsers: verifiedUsers.length,
                    totalSpent,
                    avgSpent
                };
            }

            // MySQL implementation
            const [rows] = await this.connection.execute(`
                SELECT 
                    COUNT(*) as totalUsers,
                    SUM(CASE WHEN isVerified = 1 THEN 1 ELSE 0 END) as verifiedUsers,
                    SUM(totalSpent) as totalSpent,
                    AVG(totalSpent) as avgSpent
                FROM users 
                WHERE isActive = 1
            `);
            
            return rows[0];
        } catch (error) {
            console.error('❌ Error getting user stats:', error);
            throw error;
        }
    }
}

module.exports = new UserMySQL();
