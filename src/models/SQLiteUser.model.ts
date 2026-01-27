import { getDatabase } from '../config/sqlite.config.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  displayName?: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class SQLiteUser {
  public id!: string;
  public username!: string;
  public email!: string;
  public password?: string;
  public googleId?: string;
  public displayName?: string;
  public profilePicture?: string;
  public role!: 'user' | 'admin';
  public isEmailVerified!: boolean;
  public lastLogin?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  constructor(userData: UserAttributes) {
    Object.assign(this, userData);
  }

  // Static methods
  static async findOne(options: { where?: { id?: string; googleId?: string; email?: string } }): Promise<SQLiteUser | null> {
    const db = getDatabase();
    
    if (options.where?.id) {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [options.where.id]);
      return user ? new SQLiteUser(user) : null;
    }
    
    if (options.where?.googleId) {
      const user = await db.get('SELECT * FROM users WHERE google_id = ?', [options.where.googleId]);
      return user ? new SQLiteUser(user) : null;
    }
    
    if (options.where?.email) {
      const user = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [options.where.email]);
      return user ? new SQLiteUser(user) : null;
    }
    
    return null;
  }

  static async findAll(): Promise<SQLiteUser[]> {
    const db = getDatabase();
    const users = await db.all('SELECT * FROM users ORDER BY created_at DESC');
    return users.map(user => new SQLiteUser(user));
  }

  static async create(userData: UserCreationAttributes): Promise<SQLiteUser> {
    const db = getDatabase();
    
    const newUser: UserAttributes = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.run(
      `INSERT INTO users (
        id, username, email, password, google_id, display_name, 
        profile_picture, role, is_email_verified, last_login, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newUser.id,
        newUser.username,
        newUser.email,
        newUser.password || null,
        newUser.googleId || null,
        newUser.displayName || null,
        newUser.profilePicture || null,
        newUser.role,
        newUser.isEmailVerified ? 1 : 0,
        newUser.lastLogin?.toISOString() || null,
        newUser.createdAt?.toISOString() || new Date().toISOString(),
        newUser.updatedAt?.toISOString() || new Date().toISOString()
      ]
    );

    return await SQLiteUser.findByPk(newUser.id) as SQLiteUser;
  }

  static async update(data: Partial<UserAttributes>, options: { where: { id: string } }): Promise<[number]> {
    const db = getDatabase();
    
    const updateFields = [];
    const updateValues = [];

    if (data.username !== undefined) {
      updateFields.push('username = ?');
      updateValues.push(data.username);
    }
    if (data.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(data.email);
    }
    if (data.password !== undefined) {
      updateFields.push('password = ?');
      updateValues.push(data.password);
    }
    if (data.googleId !== undefined) {
      updateFields.push('google_id = ?');
      updateValues.push(data.googleId);
    }
    if (data.displayName !== undefined) {
      updateFields.push('display_name = ?');
      updateValues.push(data.displayName);
    }
    if (data.profilePicture !== undefined) {
      updateFields.push('profile_picture = ?');
      updateValues.push(data.profilePicture);
    }
    if (data.role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(data.role);
    }
    if (data.isEmailVerified !== undefined) {
      updateFields.push('is_email_verified = ?');
      updateValues.push(data.isEmailVerified ? 1 : 0);
    }
    if (data.lastLogin !== undefined) {
      updateFields.push('last_login = ?');
      updateValues.push(data.lastLogin.toISOString());
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(options.where.id);

    const result = await db.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    return [result.changes || 0];
  }

  static async destroy(options: { where: { id: string } }): Promise<number> {
    const db = getDatabase();
    
    const result = await db.run('DELETE FROM users WHERE id = ?', [options.where.id]);
    return result.changes || 0;
  }

  static async findByPk(id: string): Promise<SQLiteUser | null> {
    return await SQLiteUser.findOne({ where: { id } });
  }

  static async sync(): Promise<void> {
    const db = getDatabase();
    
    // Create users table if not exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT,
        google_id TEXT UNIQUE,
        display_name TEXT,
        profile_picture TEXT,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        is_email_verified BOOLEAN NOT NULL DEFAULT 0,
        last_login DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    `);

    console.log('✅ Users table synchronized successfully');
  }

  async save(): Promise<SQLiteUser> {
    const db = getDatabase();
    
    const result = await db.run(
      `UPDATE users SET 
        username = ?, email = ?, password = ?, google_id = ?, display_name = ?,
        profile_picture = ?, role = ?, is_email_verified = ?, last_login = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        this.username,
        this.email,
        this.password || null,
        this.googleId || null,
        this.displayName || null,
        this.profilePicture || null,
        this.role,
        this.isEmailVerified ? 1 : 0,
        this.lastLogin?.toISOString() || null,
        new Date().toISOString(),
        this.id
      ]
    );

    return await SQLiteUser.findByPk(this.id) as SQLiteUser;
  }

  toJSON(): UserAttributes {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      password: this.password,
      googleId: this.googleId,
      displayName: this.displayName,
      profilePicture: this.profilePicture,
      role: this.role,
      isEmailVerified: this.isEmailVerified,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Static helper functions
const findByGoogleId = async (googleId: string): Promise<SQLiteUser | null> => {
  return await SQLiteUser.findOne({ where: { googleId } });
};

const findByEmail = async (email: string): Promise<SQLiteUser | null> => {
  return await SQLiteUser.findOne({ where: { email } });
};

const create = async (userData: UserCreationAttributes): Promise<SQLiteUser> => {
  return await SQLiteUser.create(userData);
};

const initUser = async (): Promise<void> => {
  try {
    await SQLiteUser.sync();
    
    // Insert default admin user if not exists
    const db = getDatabase();
    const adminExists = await db.get('SELECT id FROM users WHERE email = ?', ['admin@travello.com']);
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await db.run(`
        INSERT INTO users (
          id, username, email, password, role, is_email_verified, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        'admin',
        'admin@travello.com',
        hashedPassword,
        'admin',
        1,
        new Date().toISOString(),
        new Date().toISOString()
      ]);
      console.log('✅ Default admin user created');
    }
  } catch (error) {
    console.error('❌ Failed to initialize User table:', error);
    throw error;
  }
};

export { SQLiteUser, UserAttributes, findByGoogleId, findByEmail, create, initUser };