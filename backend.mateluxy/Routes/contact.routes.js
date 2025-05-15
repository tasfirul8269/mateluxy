import express from 'express';
const router = express.Router();
import * as contactController from '../controllers/contact.controller.js';
import { verifyToken } from '../utils/verifyToken.js';
import { createMessage } from '../controllers/message.controller.js';

// Log when routes are being registered
console.log('Setting up contact routes');

// Public route - Submit contact form
router.post('/submit', (req, res, next) => {
  console.log('Contact submit route called, forwarding to messages API');
  return createMessage(req, res, next);
});

// Admin routes - Require authentication
router.get('/', verifyToken, (req, res, next) => {
  console.log('Getting all contacts');
  contactController.getAllContacts(req, res, next);
});

router.get('/:id', verifyToken, (req, res, next) => {
  console.log('Getting contact by ID:', req.params.id);
  contactController.getContactById(req, res, next);
});

router.patch('/:id/status', verifyToken, (req, res, next) => {
  console.log('Updating contact status:', req.params.id, req.body.status);
  contactController.updateContactStatus(req, res, next);
});

router.delete('/:id', verifyToken, (req, res, next) => {
  console.log('Deleting contact:', req.params.id);
  contactController.deleteContact(req, res, next);
});

export default router;
