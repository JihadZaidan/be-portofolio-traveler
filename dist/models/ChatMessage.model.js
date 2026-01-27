import { db } from '../config/database.config.js';
import { v4 as uuidv4 } from 'uuid';
class ChatMessage {
    constructor(messageData) {
        Object.assign(this, messageData);
    }
    // Static methods
    static async findOne(options) {
        await db.read();
        const messages = db.data?.chatMessages || [];
        if (options.where?.id) {
            const message = messages.find(m => m.id === options.where.id);
            return message ? new ChatMessage(message) : null;
        }
        if (options.where?.sessionId) {
            const message = messages.find(m => m.sessionId === options.where.sessionId);
            return message ? new ChatMessage(message) : null;
        }
        if (options.where?.userId) {
            const message = messages.find(m => m.userId === options.where.userId);
            return message ? new ChatMessage(message) : null;
        }
        return messages.length > 0 ? new ChatMessage(messages[0]) : null;
    }
    static async findAll(options) {
        await db.read();
        let messages = db.data?.chatMessages || [];
        if (options?.where?.sessionId) {
            messages = messages.filter(m => m.sessionId === options.where.sessionId);
        }
        if (options?.where?.userId) {
            messages = messages.filter(m => m.userId === options.where.userId);
        }
        // Sort by timestamp
        messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return messages.map(message => new ChatMessage(message));
    }
    static async create(messageData) {
        await db.read();
        if (!db.data)
            db.data = { users: [], chatMessages: [], userSessions: [], travelKnowledge: [] };
        const newMessage = {
            id: uuidv4(),
            ...messageData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        db.data.chatMessages.push(newMessage);
        await db.write();
        return new ChatMessage(newMessage);
    }
    static async destroy(options) {
        await db.read();
        if (!db.data)
            return 0;
        let deletedCount = 0;
        if (options.where.sessionId) {
            const initialLength = db.data.chatMessages.length;
            db.data.chatMessages = db.data.chatMessages.filter(m => m.sessionId !== options.where.sessionId);
            deletedCount = initialLength - db.data.chatMessages.length;
        }
        else if (options.where.id) {
            const index = db.data.chatMessages.findIndex(m => m.id === options.where.id);
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
    static async sync() {
        await db.read();
        if (!db.data) {
            db.data = { users: [], chatMessages: [], userSessions: [], travelKnowledge: [] };
            await db.write();
        }
    }
}
// Static methods
const createMessage = async (messageData) => {
    return await ChatMessage.create(messageData);
};
const findBySessionId = async (sessionId, limit = 50) => {
    const messages = await ChatMessage.findAll({ where: { sessionId } });
    return messages.slice(0, limit);
};
const findByUserId = async (userId, limit = 100) => {
    const messages = await ChatMessage.findAll({ where: { userId } });
    return messages.slice(0, limit);
};
const deleteBySessionId = async (sessionId) => {
    return await ChatMessage.destroy({
        where: { sessionId }
    });
};
const initChatMessage = async () => {
    try {
        await ChatMessage.sync();
        console.log('✅ ChatMessage table initialized successfully');
    }
    catch (error) {
        console.error('❌ Failed to initialize ChatMessage table:', error);
        throw error;
    }
};
export { ChatMessage, createMessage, findBySessionId, findByUserId, deleteBySessionId, initChatMessage };
