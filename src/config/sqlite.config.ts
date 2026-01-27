import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, '../../database/travello.db');

let db: Database | null = null;

// Initialize SQLite database
export const initializeDatabase = async (): Promise<Database> => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    console.log('✅ SQLite database connected successfully');
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to SQLite database:', error);
    throw error;
  }
};

// Get database instance
export const getDatabase = (): Database => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

// Test connection
export const testConnection = async (): Promise<void> => {
  try {
    const database = await initializeDatabase();
    const result = await database.get('SELECT 1 as test');
    if (result.test === 1) {
      console.log('✅ Database connection test passed');
    }
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    throw error;
  }
};

// Close database
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close();
    db = null;
    console.log('✅ Database connection closed');
  }
};

export { db };