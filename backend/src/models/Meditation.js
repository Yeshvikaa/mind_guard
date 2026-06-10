import mongoose from 'mongoose';

const meditationHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trackId: { type: String, required: true },
  trackTitle: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'Breathing', 'Focus', 'Sleep'
  durationSeconds: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const meditationFavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trackId: { type: String, required: true }
}, {
  timestamps: true
});

export const MeditationHistory = mongoose.model('MeditationHistory', meditationHistorySchema);
export const MeditationFavorite = mongoose.model('MeditationFavorite', meditationFavoriteSchema);
