import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import { AuditLog } from '../models/AuditLog.js';

// @desc    Update user profile data
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      age,
      gender,
      phone,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactEmail
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update details
    if (fullName) user.fullName = fullName;
    if (age) user.age = Number(age);
    if (gender) user.gender = gender;
    if (phone) user.phone = phone;

    // Update emergency details
    if (emergencyContactName || emergencyContactPhone || emergencyContactEmail) {
      user.emergencyContact = {
        name: emergencyContactName || user.emergencyContact?.name,
        phone: emergencyContactPhone || user.emergencyContact?.phone,
        email: emergencyContactEmail || user.emergencyContact?.email
      };
    }

    // Update profile photo if upload present
    if (req.file) {
      user.profilePhoto = `/uploads/${req.file.filename}`;
    }

    await user.save();

    // Log event
    await AuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      action: 'UPDATE_PROFILE',
      details: `User updated profile settings: ${user.fullName}`
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings configurations
// @route   PUT /api/settings
// @access  Private
export const updateSettings = async (req, res, next) => {
  try {
    const { darkMode, notificationsEnabled, shareStressWithAdmin, language, conversationStyle } = req.body;

    let settings = await Settings.findOne({ user: req.user.id });

    if (!settings) {
      settings = new Settings({ user: req.user.id });
    }

    if (darkMode !== undefined) settings.darkMode = darkMode;
    if (notificationsEnabled !== undefined) settings.notificationsEnabled = notificationsEnabled;
    if (shareStressWithAdmin !== undefined) settings.privacySettings.shareStressWithAdmin = shareStressWithAdmin;
    if (language) settings.language = language;
    if (conversationStyle) settings.aiPreferences.conversationStyle = conversationStyle;

    await settings.save();

    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};
