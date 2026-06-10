import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', upload.single('profilePhoto'), register);
router.post('/login', login);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resettoken', resetPassword);

export default router;
