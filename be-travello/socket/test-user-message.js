const io = require('socket.io-client');

// Connect to backend
const socket = io('http://localhost:55435', {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO');
  
  // Join as user
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
    
    console.log('💬 Test message sent');
  }, 2000);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from Socket.IO');
});

socket.on('chat:status', (data) => {
  console.log('📊 Chat status:', data);
});

socket.on('message:new', (data) => {
  console.log('💬 Received admin response:', data);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

console.log('🔄 Connecting to Socket.IO...');
