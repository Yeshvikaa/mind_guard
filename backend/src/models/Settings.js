import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  darkMode: { type: Boolean, default: false },
  notificationsEnabled: { type: Boolean, default: true },
  privacySettings: {
    shareStressWithAdmin: { type: Boolean, default: true }
  },
  language: { type: String, default: 'en' },
  aiPreferences: {
    conversationStyle: { type: String, enum: ['Supportive', 'Direct', 'Coach'], default: 'Supportive' }
  }
}, {
  timestamps: true
});

export const Settings = mongoose.model('Settings', settingsSchema);
