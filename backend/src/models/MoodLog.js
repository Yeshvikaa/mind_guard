import mongoose from 'mongoose';

const moodLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { 
    type: String, 
    enum: ['Happy', 'Calm', 'Neutral', 'Tired', 'Anxious', 'Sad', 'Angry'], 
    required: true 
  },
  note: { type: String, trim: true, default: '' },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const MoodLog = mongoose.model('MoodLog', moodLogSchema);
