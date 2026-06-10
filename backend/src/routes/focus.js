import express from 'express';
import { saveFocusSession, getFocusSessions } from '../controllers/focusController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', saveFocusSession);
router.get('/', getFocusSessions);

export default router;
