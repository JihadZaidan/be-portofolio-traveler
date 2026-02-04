import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.config.js';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessageAttributes {
  id: string;
  sessionId: string;
  userId?: string;
  message: string;
  response: string;
  role: 'user' | 'ai';
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ChatMessageCreationAttributes extends Omit<ChatMessageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class ChatMessage extends Model<ChatMessageAttributes> implements ChatMessageAttributes {
  public id!: string;
  public sessionId!: string;
  public userId?: string;
  public message!: string;
  public response!: string;
  public role!: 'user' | 'ai';
  public timestamp!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  static async createMessage(messageData: ChatMessageAttributes): Promise<ChatMessage> {
    return await ChatMessage.create(messageData);
  }

  static async findBySessionId(sessionId: string, limit: number = 20): Promise<ChatMessage[]> {
    return await ChatMessage.findAll({
      where: { sessionId },
      order: [['timestamp', 'ASC']],
      limit
    });
  }

  static async findByUserId(userId: string): Promise<ChatMessage[]> {
    return await ChatMessage.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']]
    });
  }

  static async destroy(options: { where: { sessionId: string } }): Promise<number> {
    return await ChatMessage.destroy(options);
  }
}

// Initialize the model
ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'ai'),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    timestamps: true,
  }
);

// Helper functions for backward compatibility
export const createMessage = ChatMessage.createMessage.bind(ChatMessage);
export const findBySessionId = ChatMessage.findBySessionId.bind(ChatMessage);
export const findByUserId = ChatMessage.findByUserId.bind(ChatMessage);

const deleteBySessionId = async (sessionId: string): Promise<number> => {
  return await ChatMessage.destroy({
    where: { sessionId }
  });
};

const initChatMessage = async (): Promise<void> => {
  try {
    await ChatMessage.sync();
    console.log('✅ ChatMessage table initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize ChatMessage table:', error);
    throw error;
  }
};

export { 
  ChatMessage, 
  createMessage, 
  findBySessionId, 
  findByUserId, 
  deleteBySessionId, 
  initChatMessage 
};
