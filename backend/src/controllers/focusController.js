import { FocusSession } from '../models/FocusSession.js';

// @desc    Log a focus timer session
// @route   POST /api/focus
// @access  Private
export const saveFocusSession = async (req, res, next) => {
  try {
    const { durationMinutes, status, taskName } = req.body;

    if (!durationMinutes || !status) {
      return res.status(400).json({ success: false, error: 'Please specify session duration and status' });
    }

    const session = await FocusSession.create({
      user: req.user.id,
      durationMinutes,
      status,
      taskName
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's focus sessions
// @route   GET /api/focus
// @access  Private
export const getFocusSessions = async (req, res, next) => {
  try {
    const sessions = await FocusSession.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};
