// Simple database configuration for development
let data = {
  users: [],
  chatMessages: [],
  userSessions: [],
  travelKnowledge: []
};

export const db = {
  data,
  async read() {
    return this.data;
  },
  async write() {
    // Mock write operation
    return true;
  },
  async prepare() {
    return this;
  },
  async run() {
    return { lastID: Math.random() };
  },
  async get() {
    return null;
  },
  async all() {
    return [];
  }
};

export async function testConnection() {
  try {
    console.log('Database connection test - using mock database for development');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export async function initDatabase() {
  try {
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}
