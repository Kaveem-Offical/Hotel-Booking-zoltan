const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Send a message (user or admin)
router.post('/send', chatController.sendMessage);

// Get all conversations (admin)
router.get('/conversations', chatController.getConversations);

// Toggle pin on a conversation (admin)
router.post('/pin/:chatId', chatController.togglePin);

// Mark conversation as read (admin)
router.post('/read/:chatId', chatController.markAsRead);

// Cleanup old unpinned chats (admin)
router.delete('/cleanup', chatController.cleanupOldChats);

module.exports = router;
