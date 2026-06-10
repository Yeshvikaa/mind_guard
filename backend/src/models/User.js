import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Employee', 'Admin', 'Super Admin'], default: 'Employee' },
  age: { type: Number },
  gender: { type: String },
  company: { type: String },
  employeeId: { type: String },
  department: { type: String },
  companyId: { type: String },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  phone: { type: String },
  profilePhoto: { type: String }, // File path or URL
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
