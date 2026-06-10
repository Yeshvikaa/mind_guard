import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorEmail: { type: String },
  action: { type: String, required: true },
  target: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
