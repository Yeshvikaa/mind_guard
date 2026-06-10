import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getDashboardData);

export default router;
