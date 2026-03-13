const UserMySQL = require('../src/models/UserMySQL');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
    try {
        console.log('🔧 Creating admin user...');
        
        const adminData = {
            id: `admin_${Date.now()}`,
            googleId: null,
            email: 'rizwordswrote@gmail.com',
            username: 'rizwordswrote',
            displayName: 'Admin Rizwords',
            password: await bcrypt.hash('rizminwrote', 12),
            profilePicture: null,
            provider: 'local',
            loginPage: 'default',
            role: 'admin',
            isActive: true,
            isVerified: true
        };

        // Check if user already exists
        const existingUser = await UserMySQL.findOne({ email: adminData.email });
        if (existingUser) {
            console.log('⚠️  User with this email already exists. Updating role to admin...');
            await UserMySQL.update(existingUser.id, { role: 'admin' });
            console.log('✅ User role updated to admin successfully!');
            return;
        }

        // Create new admin user
        const adminUser = await UserMySQL.create(adminData);
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', adminData.email);
        console.log('👤 Username:', adminData.username);
        console.log('🔑 Password: rizminwrote');
        console.log('🛡️  Role:', adminData.role);
        console.log('🆔 User ID:', adminUser.id);

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        process.exit(0);
    }
}

createAdminUser();
