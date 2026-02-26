const { create } = require('./src/models/User.model.mysql.js');

const testUsers = [
  {
    username: 'john_doe',
    email: 'john.doe@example.com',
    password: 'password123',
    displayName: 'John Doe',
    role: 'user'
  },
  {
    username: 'jane_smith',
    email: 'jane.smith@example.com', 
    password: 'password123',
    displayName: 'Jane Smith',
    role: 'user'
  },
  {
    username: 'admin_user',
    email: 'admin@travello.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin'
  },
  {
    username: 'anwar_ibrahim',
    email: 'dsaikumadani@gmail.com',
    password: 'password123',
    displayName: 'Anwar Ibrahim',
    role: 'user'
  },
  {
    username: 'test_user1',
    email: 'test1@example.com',
    password: 'test123',
    displayName: 'Test User 1',
    role: 'user'
  },
  {
    username: 'test_user2',
    email: 'test2@example.com',
    password: 'test123',
    displayName: 'Test User 2',
    role: 'user'
  }
];

async function createTestUsers() {
  console.log('🔄 Creating test users...');
  
  for (const userData of testUsers) {
    try {
      const user = await create(userData);
      console.log(`✅ Created user: ${user.email} (${user.username})`);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log(`⚠️  User already exists: ${userData.email}`);
      } else {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
  }
  
  console.log('🎉 Test users creation completed!');
  process.exit(0);
}

createTestUsers().catch(console.error);
