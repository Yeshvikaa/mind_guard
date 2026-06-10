import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactName: { type: String, required: true },
  contactPhone: { type: String },
  contactEmail: { type: String },
  triggeredByScore: { type: Number, required: true },
  status: { type: String, enum: ['sent', 'cancelled', 'failed'], default: 'sent' },
  details: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const EmergencyAlert = mongoose.model('EmergencyAlert', emergencyAlertSchema);
