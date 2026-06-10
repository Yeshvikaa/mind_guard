import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  sentimentScore: { type: Number, default: 0 }, // -1 (negative) to +1 (positive)
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stressScore: { type: Number, default: 0 }, // Calculated stress score (0-100)
  category: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  isCompleted: { type: Boolean, default: false },
  messages: [messageSchema],
  aiNotes: { type: String, default: '' }
}, {
  timestamps: true
});

export const Chat = mongoose.model('Chat', chatSchema);
export const Message = mongoose.model('Message', messageSchema);
