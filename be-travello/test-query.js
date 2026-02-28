const { sequelize } = require('./src/config/database-mysql.config.js');

async function testConversationsQuery() {
  try {
    console.log('Testing updated conversations query...');
    
    // Test the updated query
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
        u.email = cm.sender_id OR u.email = cm.receiver_id OR u.id = cm.sender_id OR u.id = cm.receiver_id
      )
      WHERE u.role = 'user'
      GROUP BY u.id, u.username, u.email, cm.room_id
      ORDER BY last_message_at DESC
    `);
    
    console.log('Conversations from UPDATED query:', conversations.length);
    if (conversations.length > 0) {
      console.log('Sample conversations:', conversations);
    }

    // Test simple join
    const [simpleJoin] = await sequelize.query(`
      SELECT u.id, u.username, u.email, cm.sender_id, cm.message
      FROM users u
      INNER JOIN user_admin_chat_messages cm ON u.email = cm.sender_id
      WHERE u.role = 'user'
      LIMIT 3
    `);
    
    console.log('Simple join results:', simpleJoin.length);
    if (simpleJoin.length > 0) {
      console.log('Sample simple join:', simpleJoin);
    }

  } catch (error) {
    console.error('Query test error:', error);
  } finally {
    await sequelize.close();
  }
}

testConversationsQuery();
