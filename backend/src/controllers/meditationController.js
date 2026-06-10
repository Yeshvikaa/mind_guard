import { MeditationHistory, MeditationFavorite } from '../models/Meditation.js';

// @desc    Log a completed meditation session
// @route   POST /api/meditation/history
// @access  Private
export const logMeditationSession = async (req, res, next) => {
  try {
    const { trackId, trackTitle, category, durationSeconds } = req.body;

    if (!trackId || !trackTitle || !category || !durationSeconds) {
      return res.status(400).json({ success: false, error: 'Please provide all details' });
    }

    const session = await MeditationHistory.create({
      user: req.user.id,
      trackId,
      trackTitle,
      category,
      durationSeconds
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's meditation history
// @route   GET /api/meditation/history
// @access  Private
export const getMeditationHistory = async (req, res, next) => {
  try {
    const history = await MeditationHistory.find({ user: req.user.id }).sort({ timestamp: -1 }).limit(10);
    res.status(200).json({ success: true, count: history.length, history });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite on a track
// @route   POST /api/meditation/favorite
// @access  Private
export const toggleFavorite = async (req, res, next) => {
  try {
    const { trackId } = req.body;

    if (!trackId) {
      return res.status(400).json({ success: false, error: 'Please provide track ID' });
    }

    const favoriteExists = await MeditationFavorite.findOne({ user: req.user.id, trackId });

    if (favoriteExists) {
      await MeditationFavorite.deleteOne({ _id: favoriteExists._id });
      return res.status(200).json({ success: true, favorited: false, message: 'Removed from favorites' });
    } else {
      await MeditationFavorite.create({ user: req.user.id, trackId });
      return res.status(201).json({ success: true, favorited: true, message: 'Added to favorites' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorited tracks
// @route   GET /api/meditation/favorites
// @access  Private
export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await MeditationFavorite.find({ user: req.user.id });
    res.status(200).json({ success: true, count: favorites.length, favorites });
  } catch (error) {
    next(error);
  }
};
