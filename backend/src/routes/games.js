import express from 'express';
import { saveGameScore, getLeaderboard } from '../controllers/gameController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', saveGameScore);
router.get('/leaderboard', getLeaderboard);

export default router;
