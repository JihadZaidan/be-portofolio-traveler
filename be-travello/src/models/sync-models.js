const { sequelize } = require('../config/database.config.js');
const { AIChatSession, AIChatMessage, AISuggestion, AIAnalytics } = require('./ai-chatbot.model.js');

const syncModels = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('✅ All AI Chatbot models synced successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Error syncing models:', error);
    return false;
  }
};

module.exports = { syncModels };
