// Test API endpoints
const testAPI = async () => {
  console.log('🧪 Testing API endpoints...');
  
  // Test port 5000
  try {
    console.log('Testing port 5000...');
    const response = await fetch('http://localhost:5000/api/shops');
    console.log('Port 5000 status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('Port 5000 data count:', data.length);
    }
  } catch (error) {
    console.log('❌ Port 5000 failed:', error.message);
  }
  
  // Test port 5001
  try {
    console.log('Testing port 5001...');
    const response = await fetch('http://localhost:5001/api/shops');
    console.log('Port 5001 status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('Port 5001 data count:', data.length);
    }
  } catch (error) {
    console.log('❌ Port 5001 failed:', error.message);
  }
};

testAPI();
