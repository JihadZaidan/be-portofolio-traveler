const axios = require('axios');

const API_BASE = 'http://localhost:55435/api/dynamic-auth';

// Test dynamic login functionality
async function testDynamicLogin() {
    console.log('🚀 Testing Dynamic Login System\n');

    try {
        // Test 1: Get all users
        console.log('1️⃣ Getting all users...');
        const usersResponse = await axios.get(`${API_BASE}/users`);
        console.log('✅ Users retrieved:', usersResponse.data.data.total);
        
        const users = usersResponse.data.data.users;
        if (users.length > 0) {
            console.log('📋 Available users:');
            users.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.displayName} (${user.email}) - ${user.role}`);
            });
        }

        // Test 2: Quick login (auto-login)
        console.log('\n2️⃣ Testing quick login...');
        try {
            const quickLoginResponse = await axios.post(`${API_BASE}/quick-login`, {
                userType: 'user'
            });
            console.log('✅ Quick login successful!');
            console.log('👤 User:', quickLoginResponse.data.data.user.displayName);
            console.log('🔑 Token:', quickLoginResponse.data.data.token.substring(0, 50) + '...');
        } catch (error) {
            console.log('❌ Quick login failed:', error.response?.data?.message || error.message);
        }

        // Test 3: Dynamic login with email
        console.log('\n3️⃣ Testing dynamic login with email...');
        if (users.length > 0) {
            const testUser = users[0];
            try {
                const emailLoginResponse = await axios.post(`${API_BASE}/dynamic-login`, {
                    email: testUser.email,
                    password: 'password123', // Default password for existing users
                    loginMethod: 'email'
                });
                console.log('✅ Email login successful!');
                console.log('👤 User:', emailLoginResponse.data.data.user.displayName);
            } catch (error) {
                console.log('❌ Email login failed:', error.response?.data?.message || error.message);
            }
        }

        // Test 4: Dynamic login with username
        console.log('\n4️⃣ Testing dynamic login with username...');
        if (users.length > 0) {
            const testUser = users[0];
            try {
                const usernameLoginResponse = await axios.post(`${API_BASE}/dynamic-login`, {
                    username: testUser.username,
                    password: 'password123',
                    loginMethod: 'username'
                });
                console.log('✅ Username login successful!');
                console.log('👤 User:', usernameLoginResponse.data.data.user.displayName);
            } catch (error) {
                console.log('❌ Username login failed:', error.response?.data?.message || error.message);
            }
        }

        // Test 5: Dynamic registration
        console.log('\n5️⃣ Testing dynamic registration...');
        try {
            const registerResponse = await axios.post(`${API_BASE}/dynamic-register`, {
                email: `testuser${Date.now()}@example.com`,
                username: `testuser${Date.now()}`,
                displayName: 'Test User Dynamic',
                password: 'newpassword123',
                confirmPassword: 'newpassword123',
                phone: '08123456789',
                address_city: 'Jakarta',
                address_country: 'Indonesia',
                role: 'user'
            });
            console.log('✅ Dynamic registration successful!');
            console.log('👤 New user:', registerResponse.data.data.user.displayName);
            console.log('📧 Email:', registerResponse.data.data.user.email);
            console.log('🔑 Token:', registerResponse.data.data.token.substring(0, 50) + '...');
        } catch (error) {
            console.log('❌ Dynamic registration failed:', error.response?.data?.message || error.message);
        }

        // Test 6: Create new user
        console.log('\n6️⃣ Testing create user...');
        try {
            const createUserResponse = await axios.post(`${API_BASE}/create-user`, {
                email: `newuser${Date.now()}@example.com`,
                username: `newuser${Date.now()}`,
                displayName: 'New Test User',
                password: 'testpass123',
                role: 'user',
                phone: '08123456789',
                address_city: 'Bandung',
                address_country: 'Indonesia'
            });
            console.log('✅ User creation successful!');
            console.log('👤 New user:', createUserResponse.data.data.user.displayName);
            console.log('📧 Email:', createUserResponse.data.data.user.email);
            console.log('🔑 Password:', createUserResponse.data.data.user.password);
        } catch (error) {
            console.log('❌ User creation failed:', error.response?.data?.message || error.message);
        }

        // Test 7: Admin registration with invite code
        console.log('\n7️⃣ Testing admin registration...');
        try {
            const adminRegisterResponse = await axios.post(`${API_BASE}/dynamic-register`, {
                email: `admin${Date.now()}@example.com`,
                username: `admin${Date.now()}`,
                displayName: 'New Admin User',
                password: 'adminpass123',
                confirmPassword: 'adminpass123',
                role: 'admin',
                inviteCode: 'TRAVELLO_ADMIN_2024'
            });
            console.log('✅ Admin registration successful!');
            console.log('👤 New admin:', adminRegisterResponse.data.data.user.displayName);
            console.log('🔑 Role:', adminRegisterResponse.data.data.user.role);
        } catch (error) {
            console.log('❌ Admin registration failed:', error.response?.data?.message || error.message);
        }

        // Test 8: Admin registration without invite code (should fail)
        console.log('\n8️⃣ Testing admin registration without invite code...');
        try {
            const adminRegisterResponse = await axios.post(`${API_BASE}/dynamic-register`, {
                email: `fakeadmin${Date.now()}@example.com`,
                username: `fakeadmin${Date.now()}`,
                displayName: 'Fake Admin User',
                password: 'adminpass123',
                confirmPassword: 'adminpass123',
                role: 'admin'
                // No invite code
            });
            console.log('❌ This should have failed!');
        } catch (error) {
            console.log('✅ Admin registration correctly failed:', error.response?.data?.message || error.message);
        }

        console.log('\n🎉 Dynamic login testing completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the backend server is running on port 55435');
        }
    }
}

// Test login with specific credentials
async function testSpecificLogin(email, password) {
    console.log(`🔐 Testing login for ${email}...`);
    
    try {
        const response = await axios.post(`${API_BASE}/dynamic-login`, {
            email: email,
            password: password,
            loginMethod: 'email'
        });
        
        console.log('✅ Login successful!');
        console.log('👤 User:', response.data.data.user.displayName);
        console.log('🔑 Role:', response.data.data.user.role);
        console.log('📧 Email:', response.data.data.user.email);
        console.log('🔑 Token:', response.data.data.token.substring(0, 50) + '...');
        
        return response.data;
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data?.message || error.message);
        return null;
    }
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 2) {
        // Test specific login
        testSpecificLogin(args[0], args[1]);
    } else {
        // Run all tests
        testDynamicLogin();
    }
}

module.exports = {
    testDynamicLogin,
    testSpecificLogin
};
