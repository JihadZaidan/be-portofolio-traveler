import { db } from '../config/database.config.js';
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

class ChatMessage {
  public id!: string;
  public sessionId!: string;
  public userId?: string;
  public message!: string;
  public response!: string;
  public role!: 'user' | 'ai';
  public timestamp!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  constructor(messageData: ChatMessageAttributes) {
    Object.assign(this, messageData);
  }

  // Static methods
  static async findOne(options: { where?: { id?: string; sessionId?: string; userId?: string } }): Promise<ChatMessage | null> {
    await db.read();
    const messages = db.data?.chatMessages || [];
    
    if (options.where?.id) {
      const message = messages.find(m => m.id === options.where!.id);
      return message ? new ChatMessage(message) : null;
    }
    if (options.where?.sessionId) {
      const message = messages.find(m => m.sessionId === options.where!.sessionId);
      return message ? new ChatMessage(message) : null;
    }
    if (options.where?.userId) {
      const message = messages.find(m => m.userId === options.where!.userId);
      return message ? new ChatMessage(message) : null;
    }
    
    return messages.length > 0 ? new ChatMessage(messages[0]) : null;
  }

  static async findAll(options?: { where?: { sessionId?: string; userId?: string } }): Promise<ChatMessage[]> {
    await db.read();
    let messages = db.data?.chatMessages || [];
    
    if (options?.where?.sessionId) {
      messages = messages.filter(m => m.sessionId === options.where!.sessionId);
    }
    if (options?.where?.userId) {
      messages = messages.filter(m => m.userId === options.where!.userId);
    }
    
    // Sort by timestamp
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return messages.map(message => new ChatMessage(message));
  }

  static async create(messageData: ChatMessageCreationAttributes): Promise<ChatMessage> {
    await db.read();
    if (!db.data) db.data = { users: [], chatMessages: [], userSessions: [], travelKnowledge: [] };
    
    const newMessage: ChatMessageAttributes = {
      id: uuidv4(),
      ...messageData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    db.data.chatMessages.push(newMessage);
    await db.write();
    
    return new ChatMessage(newMessage);
  }

  static async destroy(options: { where: { sessionId?: string; id?: string } }): Promise<number> {
    await db.read();
    if (!db.data) return 0;
    
    let deletedCount = 0;
    
    if (options.where.sessionId) {
      const initialLength = db.data.chatMessages.length;
      db.data.chatMessages = db.data.chatMessages.filter(m => m.sessionId !== options.where!.sessionId);
      deletedCount = initialLength - db.data.chatMessages.length;
    } else if (options.where.id) {
      const index = db.data.chatMessages.findIndex(m => m.id === options.where!.id);
      if (index !== -1) {
        db.data.chatMessages.splice(index, 1);
        deletedCount = 1;
      }
    }
    
    if (deletedCount > 0) {
      await db.write();
    }
    
    return deletedCount;
  }

  static async sync(): Promise<void> {
    await db.read();
    if (!db.data) {
      db.data = { users: [], chatMessages: [], userSessions: [], travelKnowledge: [] };
      await db.write();
    }
  }
}

// Static methods
const createMessage = async (messageData: ChatMessageCreationAttributes): Promise<ChatMessage> => {
  return await ChatMessage.create(messageData);
};

const findBySessionId = async (sessionId: string, limit: number = 50): Promise<ChatMessage[]> => {
  const messages = await ChatMessage.findAll({ where: { sessionId } });
  return messages.slice(0, limit);
};

const findByUserId = async (userId: string, limit: number = 100): Promise<ChatMessage[]> => {
  const messages = await ChatMessage.findAll({ where: { userId } });
  return messages.slice(0, limit);
};

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
