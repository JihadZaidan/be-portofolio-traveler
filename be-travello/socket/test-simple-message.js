// Simple test to send user message to admin chat
console.log('🔄 Testing user message to admin chat...');

// Simulate user message data
const testMessage = {
  type: 'NEW_USER_MESSAGE',
  userName: 'Test User',
  message: 'Hello admin, this is a test message',
  userId: Date.now(),
  timestamp: new Date().toISOString()
};

// Send to admin chat window if it's open
try {
  // Try to find admin chat window
  const adminWindows = window.open('', '_blank');
  
  // Send message to all possible windows
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(testMessage, '*');
    console.log('📤 Message sent to opener window');
  }
  
  if (window.parent !== window) {
    window.parent.postMessage(testMessage, '*');
    console.log('📤 Message sent to parent window');
  }
  
  // Also try to send to any window that might be admin chat
  const messageString = `📤 Test message: ${testMessage.userName}: ${testMessage.message}`;
  console.log(messageString);
  
  // Show notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('👋 Test Message', {
      body: `${testMessage.userName}: ${testMessage.message}`,
      icon: '/images/default-avatar.png'
    });
  }
  
} catch (error) {
  console.error('❌ Error sending message:', error);
}

console.log('✅ Test completed. Check admin chat for messages.');
