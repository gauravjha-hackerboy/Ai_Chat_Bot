import express from 'express';
import { chatWithGemini, createNewChatSession, getChatSessions, getSessionMessages, deleteChatSession, renameChatSession } from '../controllers/chatController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateUser, chatWithGemini);
router.get('/sessions', authenticateUser, getChatSessions);
router.get('/history/:sessionId', authenticateUser, getSessionMessages);
router.post('/sessions', authenticateUser, createNewChatSession);
router.delete('/sessions/:sessionId', authenticateUser, deleteChatSession); // New route for deleting
router.put('/sessions/:sessionId/rename', authenticateUser, renameChatSession); // New route for renaming

export default router;