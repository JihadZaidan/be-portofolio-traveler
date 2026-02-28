const { sequelize } = require('./src/config/database-mysql.config.js');

async function checkDatabase() {
  try {
    // Check users
    const [users] = await sequelize.query('SELECT id, username, email, role FROM users WHERE role = "user"');
    console.log('Users in database:', users.length);
    if (users.length > 0) {
      console.log('Sample users:', users.slice(0, 3));
    }

    // Check chat messages
    const [messages] = await sequelize.query('SELECT * FROM user_admin_chat_messages ORDER BY created_at DESC LIMIT 5');
    console.log('Chat messages in database:', messages.length);
    if (messages.length > 0) {
      console.log('Sample messages:', messages);
    }

    // Check conversations query
    const [conversations] = await sequelize.query(`
      SELECT 
        u.id as user_id,
        u.username as user_name,
        u.email as user_email,
        MAX(cm.created_at) as last_message_at,
        cm.message as last_message_preview,
        COUNT(CASE WHEN cm.message_type = 'user_to_admin' AND cm.is_read = false THEN 1 END) as unread_count_for_admin,
        COUNT(CASE WHEN cm.message_type = 'admin_to_user' AND cm.is_read = false THEN 1 END) as unread_count_for_user,
        cm.room_id
      FROM users u
      INNER JOIN user_admin_chat_messages cm ON (
        u.id = cm.sender_id OR u.id = cm.receiver_id
      )
      WHERE u.role = 'user'
      GROUP BY u.id, u.username, u.email, cm.room_id
      ORDER BY last_message_at DESC
    `);
    console.log('Conversations from query:', conversations.length);
    if (conversations.length > 0) {
      console.log('Sample conversations:', conversations);
    }

  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
