import express from 'express';
import { triggerEmergency, getAlertHistory } from '../controllers/alertController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/trigger', triggerEmergency);
router.get('/', getAlertHistory);

export default router;
