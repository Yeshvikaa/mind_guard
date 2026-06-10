import express from 'express';
import { logMood, getMoodHistory } from '../controllers/moodController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', logMood);
router.get('/', getMoodHistory);

export default router;
