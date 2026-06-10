import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  durationMinutes: { type: Number, required: true },
  status: { type: String, enum: ['completed', 'paused', 'stopped'], required: true },
  taskName: { type: String, trim: true, default: 'General Focus' },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
