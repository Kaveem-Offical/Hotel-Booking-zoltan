const { database } = require('../config/firebaseAdmin');

/**
 * Send a chat message (user or admin)
 * POST /api/chat/send
 * Body: { chatId, text, senderId, senderName, role }
 */
const sendMessage = async (req, res) => {
    try {
        const { chatId, text, senderId, senderName, role, userInfo } = req.body;

        if (!chatId || !text || !senderId || !role) {
            return res.status(400).json({ success: false, message: 'chatId, text, senderId, and role are required' });
        }

        const timestamp = new Date().toISOString();
        const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // Write the message
        const msgRef = database.ref(`supportChats/${chatId}/messages/${msgId}`);
        await msgRef.set({
            text: text.trim(),
            senderId,
            senderName: senderName || 'Unknown',
            role, // 'user' or 'admin'
            timestamp,
            read: role === 'admin' // admin messages are read by default, user msgs need admin to read
        });

        // Update conversation metadata
        const chatRef = database.ref(`supportChats/${chatId}`);
        const updates = {
            lastMessageAt: timestamp,
            lastMessage: text.trim().substring(0, 100),
            lastMessageRole: role
        };

        // If this is the first message from a user, set userInfo and createdAt
        if (userInfo) {
            const snapshot = await chatRef.child('userInfo').once('value');
            if (!snapshot.exists()) {
                updates['userInfo'] = userInfo;
                updates['createdAt'] = timestamp;
                updates['pinned'] = false;
            }
        }

        await chatRef.update(updates);

        res.json({ success: true, messageId: msgId, timestamp });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all chat conversations (admin only)
 * GET /api/chat/conversations
 */
const getConversations = async (req, res) => {
    try {
        const chatsRef = database.ref('supportChats');
        const snapshot = await chatsRef.once('value');
        const data = snapshot.val();

        if (!data) {
            return res.json({ success: true, conversations: [] });
        }

        const conversations = Object.entries(data).map(([chatId, chat]) => {
            const messageCount = chat.messages ? Object.keys(chat.messages).length : 0;

            // Count unread user messages
            let unreadCount = 0;
            if (chat.messages) {
                Object.values(chat.messages).forEach(msg => {
                    if (msg.role === 'user' && !msg.read) {
                        unreadCount++;
                    }
                });
            }

            return {
                chatId,
                userInfo: chat.userInfo || {},
                pinned: chat.pinned || false,
                createdAt: chat.createdAt,
                lastMessageAt: chat.lastMessageAt,
                lastMessage: chat.lastMessage || '',
                lastMessageRole: chat.lastMessageRole || 'user',
                messageCount,
                unreadCount
            };
        });

        // Sort by last message time (newest first), pinned chats at the top
        conversations.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
        });

        res.json({ success: true, conversations });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Toggle pin status on a conversation
 * POST /api/chat/pin/:chatId
 */
const togglePin = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chatRef = database.ref(`supportChats/${chatId}`);
        const snapshot = await chatRef.child('pinned').once('value');
        const currentPinned = snapshot.val() || false;

        await chatRef.update({ pinned: !currentPinned });

        res.json({ success: true, pinned: !currentPinned });
    } catch (error) {
        console.error('Toggle pin error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Mark all user messages in a conversation as read (admin)
 * POST /api/chat/read/:chatId
 */
const markAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const messagesRef = database.ref(`supportChats/${chatId}/messages`);
        const snapshot = await messagesRef.once('value');
        const messages = snapshot.val();

        if (!messages) {
            return res.json({ success: true, markedCount: 0 });
        }

        const updates = {};
        Object.entries(messages).forEach(([msgId, msg]) => {
            if (msg.role === 'user' && !msg.read) {
                updates[`${msgId}/read`] = true;
            }
        });

        if (Object.keys(updates).length > 0) {
            await messagesRef.update(updates);
        }

        res.json({ success: true, markedCount: Object.keys(updates).length });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Clean up old unpinned chats (older than 30 days)
 * DELETE /api/chat/cleanup
 */
const cleanupOldChats = async (req, res) => {
    try {
        const chatsRef = database.ref('supportChats');
        const snapshot = await chatsRef.once('value');
        const data = snapshot.val();

        if (!data) {
            return res.json({ success: true, deletedCount: 0, message: 'No chats to clean up' });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const deletePromises = [];
        let deletedCount = 0;

        Object.entries(data).forEach(([chatId, chat]) => {
            // Skip pinned chats
            if (chat.pinned) return;

            const lastActivity = new Date(chat.lastMessageAt || chat.createdAt);
            if (lastActivity < thirtyDaysAgo) {
                deletePromises.push(database.ref(`supportChats/${chatId}`).remove());
                deletedCount++;
            }
        });

        await Promise.all(deletePromises);

        res.json({
            success: true,
            deletedCount,
            message: `Cleaned up ${deletedCount} old conversation(s)`
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    togglePin,
    markAsRead,
    cleanupOldChats
};
