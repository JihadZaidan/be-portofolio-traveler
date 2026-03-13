const http = require('http');

// Test untuk membuat sample user
const sampleUser = {
  id: 'user_' + Date.now(),
  email: 'testuser@example.com',
  username: 'testuser',
  displayName: 'Test User',
  password: 'hashed_password',
  profilePicture: null,
  provider: 'local',
  loginPage: 'default',
  phone: '+628123456789',
  dateOfBirth: '1990-01-01',
  gender: 'other',
  address_street: 'Test Street 123',
  address_city: 'Jakarta',
  address_province: 'DKI Jakarta',
  address_postalCode: '12345',
  address_country: 'Indonesia',
  travelPreferences_favoriteDestinations: JSON.stringify(['Bali', 'Yogyakarta']),
  travelPreferences_travelStyle: 'mid-range',
  travelPreferences_interests: JSON.stringify(['beach', 'culture']),
  isVerified: false,
  isActive: true,
  role: 'user',
  totalTransactions: 0,
  totalSpent: 0.00
};

const options = {
  hostname: 'localhost',
  port: 55435,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:');
    console.log(data);
    try {
      const parsed = JSON.parse(data);
      console.log('User created successfully!');
    } catch (e) {
      console.log('Error creating user');
    }
    
    // Test get users setelah create
    console.log('\n=== Testing GET users ===');
    testGetUsers();
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(JSON.stringify(sampleUser));
req.end();

function testGetUsers() {
  const getOptions = {
    hostname: 'localhost',
    port: 55435,
    path: '/api/admin/chat-users',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const getReq = http.request(getOptions, (res) => {
    console.log(`GET Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('GET Response:');
      console.log(data);
      try {
        const parsed = JSON.parse(data);
        console.log(`Found ${parsed.data.users.length} users`);
        if (parsed.data.users.length > 0) {
          console.log('First user:', parsed.data.users[0]);
        }
      } catch (e) {
        console.log('Error parsing response');
      }
    });
  });

  getReq.on('error', (e) => {
    console.error(`Problem with GET request: ${e.message}`);
  });

  getReq.end();
}
