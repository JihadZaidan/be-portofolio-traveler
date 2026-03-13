// Test Socket.IO connection to backend
const io = require('socket.io-client');

console.log('🔄 Connecting to Socket.IO server...');

const socket = io('http://localhost:55435', {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO');
  
  // Test user join
  socket.emit('user:join', {
    userInfo: {
      name: 'Test User',
      email: 'testuser@example.com',
      isGuest: true
    },
    userId: null
  });
  
  console.log('👤 User joined chat');
  
  // Send test message after 2 seconds
  setTimeout(() => {
    socket.emit('message:send', {
      message: 'Hello admin, this is a test message from user',
      sessionId: 'session-' + Date.now(),
      userInfo: {
        name: 'Test User',
        email: 'testuser@example.com',
        isGuest: true
      }
    });
    
    console.log('💬 Test message sent to admin');
  }, 2000);
  
  // Send another message after 4 seconds
  setTimeout(() => {
    socket.emit('message:send', {
      message: 'How can I help you today?',
      sessionId: 'session-' + Date.now(),
      userInfo: {
        name: 'Test User',
        email: 'testuser@example.com',
        isGuest: true
      }
    });
    
    console.log('💬 Second message sent to admin');
  }, 4000);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from Socket.IO');
});

socket.on('chat:status', (data) => {
  console.log('📊 Chat status:', data);
});

socket.on('message:new', (data) => {
  console.log('💬 Received admin response:', data.message.message);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Keep connection alive
setTimeout(() => {
  console.log('🔌 Disconnecting after 10 seconds...');
  socket.disconnect();
}, 10000);
