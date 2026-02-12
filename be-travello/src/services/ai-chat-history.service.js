const { AIChatSession, AIChatMessage, AISuggestion, AIAnalytics } = require('../models/ai-chatbot.model.js');

class AIChatHistoryService {
    constructor() {
        this.defaultSessionTimeout = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Create or get existing chat session
     */
    async createOrGetSession(sessionId, userId, userName = null, userEmail = null, metadata = {}) {
        try {
            // Try to find existing session
            let session = await AIChatSession.findOne({
                where: { session_id: sessionId }
            });

            if (!session) {
                // Create new session
                session = await AIChatSession.create({
                    session_id: sessionId,
                    user_id: userId,
                    user_name: userName,
                    user_email: userEmail,
                    session_metadata: metadata,
                    started_at: new Date(),
                    last_activity: new Date(),
                    is_active: true
                });

                // Log analytics for session start
                await this.logAnalytics(sessionId, userId, 'session_started', {
                    user_name: userName,
                    user_email: userEmail,
                    metadata
                });
            } else {
                // Update last activity
                await session.update({
                    last_activity: new Date(),
                    is_active: true
                });
            }

            return session;
        } catch (error) {
            console.error('Error creating/getting session:', error);
            throw new Error('Failed to create or get session');
        }
    }

    /**
     * Save message to database
     */
    async saveMessage(sessionId, messageId, userId, role, content, metadata = {}) {
        try {
            const message = await AIChatMessage.create({
                session_id: sessionId,
                message_id: messageId,
                user_id: userId,
                role: role,
                content: content,
                content_type: 'text',
                message_metadata: metadata,
                processing_time_ms: metadata.processingTime || null,
                tokens_used: metadata.tokensUsed || null,
                model_used: metadata.modelUsed || 'enhanced-ai',
                intent_detected: metadata.intent || null,
                confidence_score: metadata.confidence || null,
                created_at: new Date()
            });

            // Log analytics for message
            await this.logAnalytics(sessionId, userId, role === 'user' ? 'message_sent' : 'message_received', {
                message_id: messageId,
                role: role,
                content_length: content.length,
                processing_time_ms: metadata.processingTime,
                tokens_used: metadata.tokensUsed,
                intent_detected: metadata.intent
            });

            return message;
        } catch (error) {
            console.error('Error saving message:', error);
            throw new Error('Failed to save message');
        }
    }

    /**
     * Get chat history for a session
     */
    async getChatHistory(sessionId, limit = 50) {
        try {
            const messages = await AIChatMessage.findAll({
                where: { session_id: sessionId },
                order: [['created_at', 'ASC']],
                limit: limit
            });

            return messages.map(msg => ({
                id: msg.message_id,
                role: msg.role,
                content: msg.content,
                timestamp: msg.created_at,
                metadata: msg.message_metadata
            }));
        } catch (error) {
            console.error('Error getting chat history:', error);
            throw new Error('Failed to get chat history');
        }
    }

    /**
     * Get all sessions for a user
     */
    async getUserSessions(userId, limit = 20) {
        try {
            const sessions = await AIChatSession.findAll({
                where: { user_id: userId },
                order: [['last_activity', 'DESC']],
                limit: limit,
                include: [{
                    model: AIChatMessage,
                    as: 'messages',
                    limit: 1,
                    order: [['created_at', 'DESC']]
                }]
            });

            return sessions.map(session => ({
                id: session.session_id,
                user_name: session.user_name,
                started_at: session.started_at,
                last_activity: session.last_activity,
                message_count: session.messages ? session.messages.length : 0,
                last_message: session.messages && session.messages.length > 0 ? session.messages[0].content : null,
                is_active: session.is_active
            }));
        } catch (error) {
            console.error('Error getting user sessions:', error);
            throw new Error('Failed to get user sessions');
        }
    }

    /**
     * Save suggestions for a session
     */
    async saveSuggestions(sessionId, userId, suggestions) {
        try {
            const savedSuggestions = await Promise.all(
                suggestions.map(suggestion =>
                    AISuggestion.create({
                        session_id: sessionId,
                        user_id: userId,
                        suggestion_text: suggestion.text,
                        suggestion_category: suggestion.category || 'general',
                        context_keywords: suggestion.keywords || [],
                        created_at: new Date()
                    })
                )
            );

            return savedSuggestions;
        } catch (error) {
            console.error('Error saving suggestions:', error);
            throw new Error('Failed to save suggestions');
        }
    }

    /**
     * Log analytics events
     */
    async logAnalytics(sessionId, userId, eventType, eventData = {}, metadata = {}) {
        try {
            await AIAnalytics.create({
                session_id: sessionId,
                user_id: userId,
                event_type: eventType,
                event_data: eventData,
                processing_time_ms: metadata.processingTime || null,
                tokens_used: metadata.tokensUsed || null,
                model_version: metadata.modelVersion || 'enhanced-ai-v1',
                user_agent: metadata.userAgent || null,
                ip_address: metadata.ipAddress || null,
                created_at: new Date()
            });
        } catch (error) {
            console.error('Error logging analytics:', error);
            // Don't throw error for analytics logging to avoid breaking main flow
        }
    }

    /**
     * End session (mark as inactive)
     */
    async endSession(sessionId) {
        try {
            const session = await AIChatSession.findOne({
                where: { session_id: sessionId }
            });

            if (session) {
                await session.update({
                    is_active: false,
                    last_activity: new Date()
                });

                // Log analytics for session end
                await this.logAnalytics(sessionId, session.user_id, 'session_ended', {
                    session_duration: new Date() - session.started_at
                });

                return true;
            }

            return false;
        } catch (error) {
            console.error('Error ending session:', error);
            throw new Error('Failed to end session');
        }
    }

    /**
     * Get session analytics
     */
    async getSessionAnalytics(sessionId) {
        try {
            const analytics = await AIAnalytics.findAll({
                where: { session_id: sessionId },
                order: [['created_at', 'ASC']]
            });

            const messages = await AIChatMessage.findAll({
                where: { session_id: sessionId }
            });

            return {
                total_messages: messages.length,
                user_messages: messages.filter(m => m.role === 'user').length,
                ai_messages: messages.filter(m => m.role === 'ai').length,
                average_processing_time: analytics.reduce((sum, a) => sum + (a.processing_time_ms || 0), 0) / analytics.length,
                total_tokens_used: analytics.reduce((sum, a) => sum + (a.tokens_used || 0), 0),
                events: analytics.map(a => ({
                    type: a.event_type,
                    timestamp: a.created_at,
                    data: a.event_data
                }))
            };
        } catch (error) {
            console.error('Error getting session analytics:', error);
            throw new Error('Failed to get session analytics');
        }
    }

    /**
     * Clean up old inactive sessions
     */
    async cleanupOldSessions(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const deletedSessions = await AIChatSession.destroy({
                where: {
                    last_activity: {
                        [require('sequelize').Op.lt]: cutoffDate
                    },
                    is_active: false
                }
            });

            console.log(`Cleaned up ${deletedSessions} old sessions`);
            return deletedSessions;
        } catch (error) {
            console.error('Error cleaning up old sessions:', error);
            throw new Error('Failed to cleanup old sessions');
        }
    }
}

module.exports = new AIChatHistoryService();
