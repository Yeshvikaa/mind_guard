import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configurations & Database
dotenv.config();
import { connectDB } from './config/db.js';

// Route Imports
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import chatRoutes from './routes/chats.js';
import moodRoutes from './routes/mood.js';
import meditationRoutes from './routes/meditation.js';
import focusRoutes from './routes/focus.js';
import gameRoutes from './routes/games.js';
import alertRoutes from './routes/alerts.js';
import notificationRoutes from './routes/notifications.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';
import searchRoutes from './routes/search.js';

// Middlewares
import { errorHandler } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Programmatic directory check for Multer uploads
const uploadDir = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created directory: ${uploadDir}`);
}

// Copy default-avatar if not exists
const defaultAvatarPath = path.join(uploadDir, 'default-avatar.png');
if (!fs.existsSync(defaultAvatarPath)) {
  // Create a tiny transparent png file or mock image representation for development
  fs.writeFileSync(defaultAvatarPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));
}

// Database Connection
connectDB();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images uploaded to server
}));
app.use(mongoSanitize());

// Rate Limiter (15 minutes, max 300 requests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', limiter);

// CORS config
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://mind-guard-1.onrender.com',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads folder access
app.use('/uploads', express.static(uploadDir));

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/meditation', meditationRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);

// Database Seeding logic
import { seedDatabase } from './services/seeder.js';
seedDatabase();

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MindGuard backend running in dev-watch mode on port ${PORT}`);
});
