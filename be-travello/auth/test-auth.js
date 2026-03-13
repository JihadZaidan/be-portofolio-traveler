// Use built-in fetch for Node.js 18+
// If using older Node.js, install: npm install node-fetch@2

// Test authentication endpoints
async function testAuth() {
    const baseUrl = 'http://localhost:55435';
    
    console.log('🧪 Testing Authentication Endpoints\n');
    
    // Test 1: Health Check
    try {
        console.log('1. Testing health check...');
        const healthResponse = await fetch(`${baseUrl}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
        return;
    }
    
    // Test 2: User Registration
    try {
        console.log('\n2. Testing user registration...');
        const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                username: 'testuser',
                displayName: 'Test User',
                password: 'password123'
            })
        });
        
        const registerData = await registerResponse.json();
        console.log('Registration response:', registerData);
        
        if (registerData.success) {
            console.log('✅ Registration successful');
            console.log('User ID:', registerData.data.user.id);
            console.log('Token:', registerData.data.token.substring(0, 50) + '...');
            
            // Test 3: User Login with the same credentials
            console.log('\n3. Testing user login...');
            const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            });
            
            const loginData = await loginResponse.json();
            console.log('Login response:', loginData);
            
            if (loginData.success) {
                console.log('✅ Login successful');
                console.log('User ID:', loginData.data.user.id);
                console.log('Token:', loginData.data.token.substring(0, 50) + '...');
                
                // Test 4: Get User Profile
                console.log('\n4. Testing get user profile...');
                const profileResponse = await fetch(`${baseUrl}/api/auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${loginData.data.token}`,
                        'Content-Type': 'application/json',
                    }
                });
                
                const profileData = await profileResponse.json();
                console.log('Profile response:', profileData);
                
                if (profileData.success) {
                    console.log('✅ Profile fetch successful');
                } else {
                    console.log('❌ Profile fetch failed:', profileData.message);
                }
            } else {
                console.log('❌ Login failed:', loginData.message);
            }
        } else {
            console.log('❌ Registration failed:', registerData.message);
        }
    } catch (error) {
        console.log('❌ Auth test error:', error.message);
    }
}

// Run the test
testAuth();
