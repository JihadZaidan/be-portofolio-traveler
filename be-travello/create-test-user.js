const bcrypt = require('bcryptjs');
const fs = require('fs');

// Create a simple test script
async function createTestUser() {
  try {
    // Read current database
    const data = JSON.parse(fs.readFileSync('./database/travello.json', 'utf8'));
    
    // Hash password for 'password123'
    const hashedPassword = await bcrypt.hash('password123', 12);
    console.log('Generated hash:', hashedPassword);
    
    // Check if user already exists
    const existingUser = data.users.find(u => u.email === 'chilipari@gmail.com');
    if (existingUser) {
      // Update password for existing user
      existingUser.password = hashedPassword;
      existingUser.updatedAt = new Date();
      console.log('Updated existing user password');
    } else {
      // Create new user
      const { v4: uuidv4 } = require('uuid');
      const newUser = {
        id: uuidv4(),
        username: 'fufufafa',
        email: 'chilipari@gmail.com',
        password: hashedPassword,
        role: 'user',
        isEmailVerified: true,
        displayName: 'Fufu Fafa',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      };
      data.users.push(newUser);
      console.log('Created new user');
    }
    
    // Save database
    fs.writeFileSync('./database/travello.json', JSON.stringify(data, null, 2));
    
    // Test the password
    const isValid = await bcrypt.compare('password123', hashedPassword);
    console.log('Password verification test:', isValid);
    
    console.log('✅ User setup completed successfully!');
    console.log('Email: chilipari@gmail.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestUser();
