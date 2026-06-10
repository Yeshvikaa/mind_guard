import mongoose from 'mongoose';

const gameScoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameName: { 
    type: String, 
    enum: ['Memory Match', 'Breathing Tap', 'Focus Challenge', 'Color Relax'], 
    required: true 
  },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const GameScore = mongoose.model('GameScore', gameScoreSchema);
