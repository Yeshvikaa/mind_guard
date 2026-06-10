import express from 'express';
import { 
  logMeditationSession, 
  getMeditationHistory, 
  toggleFavorite, 
  getFavorites 
} from '../controllers/meditationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/history', logMeditationSession);
router.get('/history', getMeditationHistory);
router.post('/favorite', toggleFavorite);
router.get('/favorites', getFavorites);

export default router;
