// Database configuration fallback
module.exports = {
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DATABASE || 'travello_db',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || ''
  },
  aiChatbot: {
    host: process.env.AI_MYSQL_HOST || 'localhost',
    port: process.env.AI_MYSQL_PORT || 3306,
    database: process.env.AI_MYSQL_DATABASE || 'ai_chatbot_db',
    user: process.env.AI_MYSQL_USER || 'root',
    password: process.env.AI_MYSQL_PASSWORD || '',
    dialect: process.env.AI_MYSQL_DIALECT || 'mysql',
    logging: process.env.AI_MYSQL_LOGGING === 'true' || false
  },
  sqlite: {
    path: process.env.DATABASE_PATH || './database/travello.db'
  }
};
