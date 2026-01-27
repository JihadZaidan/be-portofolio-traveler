import { db } from '../config/database.config.js';
import { v4 as uuidv4 } from 'uuid';

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

class User {
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
  static async findOne(options: { where?: { id?: string; googleId?: string; email?: string } }): Promise<User | null> {
    await db.read();
    const users = db.data?.users || [];
    
    if (options.where?.id) {
      const user = users.find(u => u.id === options.where!.id);
      return user ? new User(user) : null;
    }
    if (options.where?.googleId) {
      const user = users.find(u => u.googleId === options.where!.googleId);
      return user ? new User(user) : null;
    }
    if (options.where?.email) {
      const user = users.find(u => u.email.toLowerCase() === options.where?.email?.toLowerCase());
      return user ? new User(user) : null;
    }
    
    return users.length > 0 ? new User(users[0]) : null;
  }

  static async findAll(): Promise<User[]> {
    await db.read();
    const users = db.data?.users || [];
    return users.map(user => new User(user));
  }

  static async create(userData: UserCreationAttributes): Promise<User> {
    await db.read();
    if (!db.data) db.data = { users: [], chatMessages: [], userSessions: [], travelKnowledge: [] };
    
    const newUser: UserAttributes = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    db.data.users.push(newUser);
    await db.write();
    
    return new User(newUser);
  }

  static async update(data: Partial<UserAttributes>, options: { where: { id: string } }): Promise<[number]> {
    await db.read();
    if (!db.data) return [0];
    
    const index = db.data.users.findIndex(u => u.id === options.where.id);
    if (index === -1) return [0];
    
    db.data.users[index] = {
      ...db.data.users[index],
      ...data,
      updatedAt: new Date()
    };
    
    await db.write();
    return [1];
  }

  static async destroy(options: { where: { id: string } }): Promise<number> {
    await db.read();
    if (!db.data) return 0;
    
    const index = db.data.users.findIndex(u => u.id === options.where.id);
    if (index === -1) return 0;
    
    db.data.users.splice(index, 1);
    await db.write();
    
    return 1;
  }

  static async findByPk(id: string): Promise<User | null> {
    return await User.findOne({ where: { id } });
  }

  static async sync(): Promise<void> {
    await db.read();
    if (!db.data) {
      db.data = { users: [], chatMessages: [], userSessions: [], travelKnowledge: [] };
      await db.write();
    }
  }

  async save(): Promise<User> {
    await db.read();
    if (!db.data) throw new Error('Database not initialized');
    
    const index = db.data.users.findIndex(u => u.id === this.id);
    if (index === -1) {
      // If user doesn't exist, create it
      const newUser: UserAttributes = {
        ...this,
        createdAt: this.createdAt || new Date(),
        updatedAt: new Date()
      };
      db.data.users.push(newUser);
    } else {
      // Update existing user
      db.data.users[index] = {
        ...db.data.users[index],
        ...this,
        updatedAt: new Date()
      };
    }
    
    await db.write();
    return this;
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

// Static methods
const findByGoogleId = async (googleId: string): Promise<User | null> => {
  return await User.findOne({ where: { googleId } });
};

const findByEmail = async (email: string): Promise<User | null> => {
  return await User.findOne({ where: { email } });
};

const create = async (userData: UserCreationAttributes): Promise<User> => {
  return await User.create(userData);
};

const initUser = async (): Promise<void> => {
  try {
    await User.sync();
    console.log('✅ User table initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize User table:', error);
    throw error;
  }
};

export { User, UserAttributes, findByGoogleId, findByEmail, create, initUser };
