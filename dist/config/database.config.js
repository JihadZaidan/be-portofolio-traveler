import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Database path (using JSON file for simplicity)
const dbPath = path.join(__dirname, '../../database/travello.json');
// Create database file if it doesn't exist
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], chatMessages: [], userSessions: [], travelKnowledge: [] }, null, 2));
}
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { users: [], chatMessages: [], userSessions: [], travelKnowledge: [] });
// Test database connection
const testConnection = async () => {
    try {
        await db.read();
        if (!db.data) {
            db.data = { users: [], chatMessages: [], userSessions: [], travelKnowledge: [] };
            await db.write();
        }
        console.log('✅ Database connection has been established successfully.');
    }
    catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error;
    }
};
// Mock Sequelize interface for compatibility
const sequelize = {
    authenticate: () => testConnection(),
    sync: async () => {
        await db.read();
        if (!db.data) {
            db.data = { users: [], chatMessages: [], userSessions: [], travelKnowledge: [] };
            await db.write();
        }
        console.log('✅ Database synchronized successfully');
    },
    close: async () => {
        // Lowdb doesn't need explicit closing
    },
    models: {},
    define: (name, attributes, options = {}) => {
        const tableName = name.toLowerCase();
        return {
            findAll: async () => {
                await db.read();
                return db.data?.[tableName] || [];
            },
            findOne: async (options) => {
                await db.read();
                const items = db.data?.[tableName] || [];
                if (options.where && options.where.id) {
                    return items.find((item) => item.id === options.where.id) || null;
                }
                if (options.where && options.where.email) {
                    return items.find((item) => item.email === options.where.email) || null;
                }
                return items[0] || null;
            },
            findByPk: async (id) => {
                await db.read();
                const items = db.data?.[tableName] || [];
                return items.find((item) => item.id === id) || null;
            },
            create: async (data) => {
                await db.read();
                if (!db.data)
                    db.data = { users: [], chatMessages: [], userSessions: [], travelKnowledge: [] };
                const newItem = { id: Date.now().toString(), ...data };
                db.data[tableName].push(newItem);
                await db.write();
                return newItem;
            },
            update: async (data, options) => {
                await db.read();
                if (!db.data)
                    return [0];
                const items = db.data[tableName];
                let updatedCount = 0;
                if (options.where && options.where.id) {
                    const index = items.findIndex((item) => item.id === options.where.id);
                    if (index !== -1) {
                        items[index] = { ...items[index], ...data };
                        updatedCount = 1;
                    }
                }
                await db.write();
                return [updatedCount];
            },
            destroy: async (options) => {
                await db.read();
                if (!db.data)
                    return 0;
                const items = db.data[tableName];
                let deletedCount = 0;
                if (options.where && options.where.id) {
                    const index = items.findIndex((item) => item.id === options.where.id);
                    if (index !== -1) {
                        items.splice(index, 1);
                        deletedCount = 1;
                    }
                }
                await db.write();
                return deletedCount;
            }
        };
    }
};
export { sequelize, testConnection, db };
