import express from 'express';
import { 
  startChat, 
  getChats, 
  getChatById, 
  sendMessage 
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', startChat);
router.get('/', getChats);
router.get('/:id', getChatById);
router.post('/:id/messages', sendMessage);

export default router;
