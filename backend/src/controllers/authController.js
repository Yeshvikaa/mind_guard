import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import { AuditLog } from '../models/AuditLog.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Helper to sign JWT and save as cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'super_secret_mindguard_jwt_key_1234567890_abc',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      company: user.company,
      department: user.department,
      profilePhoto: user.profilePhoto,
      streak: user.streak
    }
  });
};

// @desc    Register a new employee/user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      age,
      gender,
      company,
      employeeId,
      department,
      companyId,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactEmail,
      phone
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already registered with this email' });
    }

    // Set profile photo path if file uploaded
    const profilePhoto = req.file ? `/uploads/${req.file.filename}` : '/uploads/default-avatar.png';

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      age: age ? Number(age) : undefined,
      gender,
      company,
      employeeId,
      department,
      companyId,
      emergencyContact: {
        name: emergencyContactName,
        phone: emergencyContactPhone,
        email: emergencyContactEmail
      },
      phone,
      profilePhoto,
      streak: 1, // Start with streak of 1 on register
      lastActive: new Date()
    });

    // Create default settings for user
    await Settings.create({ user: user._id });

    // Write audit log
    await AuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      action: 'REGISTER',
      details: `User registered: ${user.fullName} (${user.role})`
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Calculate/update streak
    const now = new Date();
    const lastActive = new Date(user.lastActive || now);
    const diffTime = Math.abs(now - lastActive);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays >= 1 && diffDays < 2) {
      user.streak += 1;
    } else if (diffDays >= 2) {
      user.streak = 1;
    } else if (user.streak === 0) {
      user.streak = 1;
    }
    user.lastActive = now;
    await user.save();

    // Write audit log
    await AuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      action: 'LOGIN',
      details: `User logged in: ${user.fullName}`
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await AuditLog.create({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: 'LOGOUT',
        details: `User logged out: ${req.user.fullName}`
      });
    }

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const settings = await Settings.findOne({ user: req.user.id });

    res.status(200).json({
      success: true,
      user,
      settings
    });
  } catch (error) {
    next(error);
  }
};

// Temporary password storage in-memory for tokens (fallback if reset link used)
const resetTokens = new Map();

// @desc    Forgot Password - request email with reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'There is no user with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const expireTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save token in memory map (or could save in User model, in-memory Map is faster for demos)
    resetTokens.set(resetToken, { userId: user._id, expires: expireTime });

    // Build reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the link or paste it into your browser:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.`;

    // Attempt to send email via SMTP, fallback to console log
    let emailSent = false;
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT || 2525,
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || ''
        }
      });

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: `"MindGuard Safety" <${process.env.ADMIN_EMAIL}>`,
          to: user.email,
          subject: 'MindGuard Password Reset Request',
          text: message
        });
        emailSent = true;
      }
    } catch (err) {
      console.warn('SMTP transport failed or not configured. Falling back to log display.', err.message);
    }

    // Log the reset email to console regardless for verification
    console.log('\n========= MINDGUARD PASSWORD RESET MAIL =========');
    console.log(`To: ${user.email}`);
    console.log(`Subject: MindGuard Password Reset Request`);
    console.log(`Body: ${message}`);
    console.log('==================================================\n');

    res.status(200).json({
      success: true,
      message: emailSent ? 'Reset email dispatched successfully' : 'Reset token generated (displayed in console log)',
      token: resetToken // Expose in dev mode for easy navigation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password using token
// @route   POST /api/auth/reset-password/:resettoken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { resettoken } = req.params;
    const { password } = req.body;

    const tokenData = resetTokens.get(resettoken);
    if (!tokenData) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(resettoken);
      return res.status(400).json({ success: false, error: 'Reset token has expired' });
    }

    const user = await User.findById(tokenData.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User no longer exists' });
    }

    // Update password
    user.password = password;
    await user.save();

    // Clean token
    resetTokens.delete(resettoken);

    // Audit log
    await AuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      action: 'PASSWORD_RESET',
      details: `Password reset successfully for ${user.fullName}`
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
