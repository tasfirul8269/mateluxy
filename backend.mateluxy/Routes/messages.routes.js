import express from 'express';
import { createMessage, getAllMessages, getMessageById, updateMessageStatus, deleteMessage, replyToMessage } from '../controllers/message.controller.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

// Public route - Submit message
router.post('/submit', createMessage);

// Admin routes - Protected
router.get('/', verifyToken, getAllMessages);
router.get('/:id', verifyToken, getMessageById);
router.patch('/:id/status', verifyToken, updateMessageStatus);
router.delete('/:id', verifyToken, deleteMessage);
router.post('/reply', verifyToken, replyToMessage);

export default router;