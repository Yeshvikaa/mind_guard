import express from 'express';
import { updateProfile, updateSettings } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.put('/', upload.single('profilePhoto'), updateProfile);
router.put('/settings', updateSettings);

export default router;
