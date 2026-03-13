const http = require('http');

const options = {
  hostname: 'localhost',
  port: 55435,
  path: '/api/admin/chat-users',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:');
    console.log(data);
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed JSON:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Not JSON format');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
