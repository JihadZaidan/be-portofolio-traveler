const io = require('socket.io-client');

console.log('🧪 Testing Admin Chat with Simulated Users...');

// Create multiple test users
async function testAdminChat() {
    const testUsers = [
        { name: 'Alice Johnson', email: 'alice@example.com', userId: 'user-1' },
        { name: 'Bob Smith', email: 'bob@example.com', userId: 'user-2' },
        { name: 'Carol Davis', email: 'carol@example.com', userId: 'user-3' }
    ];

    const sockets = [];

    try {
        // Connect each test user
        for (let i = 0; i < testUsers.length; i++) {
            const user = testUsers[i];
            console.log(`\n👤 Connecting user ${i + 1}: ${user.name}`);
            
            const socket = io('http://localhost:55435', {
                transports: ['websocket', 'polling'],
                withCredentials: true
            });

            sockets.push(socket);

            await new Promise((resolve) => {
                socket.on('connect', () => {
                    console.log(`✅ ${user.name} connected`);
                    
                    // Join as user
                    socket.emit('user:join', {
                        userInfo: {
                            name: user.name,
                            email: user.email,
                            phone: '+1234567890'
                        },
                        userId: user.userId
                    });

                    socket.on('chat:status', (data) => {
                        console.log(`📱 ${user.name} session: ${data.sessionId} (${data.status})`);
                        
                        // Send a test message after joining
                        setTimeout(() => {
                            socket.emit('message:send', {
                                message: `Hello admin, this is ${user.name}`,
                                sessionId: data.sessionId,
                                userInfo: {
                                    name: user.name,
                                    email: user.email
                                }
                            });
                            console.log(`📝 ${user.name} sent message`);
                        }, 1000);
                    });

                    socket.on('message:new', (data) => {
                        if (data.message.sender === 'admin') {
                            console.log(`💬 ${user.name} received admin response: ${data.message.message}`);
                        }
                    });

                    setTimeout(resolve, 500);
                });
            });
        }

        // Wait for all users to connect and send messages
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('\n✅ All test users connected and sent messages');
        console.log('🔍 Check the admin chat interface to see if users appear');
        console.log('📱 Admin Chat: http://localhost:5173/admin/chat');

        // Keep connections alive for testing
        console.log('\n⏳ Keeping connections alive for 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        // Cleanup
        sockets.forEach(socket => {
            socket.disconnect();
        });
        console.log('\n🔌 All test users disconnected');
        process.exit(0);
    }
}

testAdminChat();
