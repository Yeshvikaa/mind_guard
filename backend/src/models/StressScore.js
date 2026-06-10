import mongoose from 'mongoose';

const stressScoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true }, // 0 to 100
  category: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  source: { type: String, default: 'Chat' }, // 'Chat', 'MoodLog', etc.
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const StressScore = mongoose.model('StressScore', stressScoreSchema);
