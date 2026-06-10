import { MoodLog } from '../models/MoodLog.js';
import { StressScore } from '../models/StressScore.js';

// @desc    Log today's mood
// @route   POST /api/mood
// @access  Private
export const logMood = async (req, res, next) => {
  try {
    const { mood, note } = req.body;

    if (!mood) {
      return res.status(400).json({ success: false, error: 'Please select a mood' });
    }

    // Map mood type to an estimated stress equivalent to save in StressScore
    const moodStressMap = {
      'Happy': 10,
      'Calm': 15,
      'Neutral': 30,
      'Tired': 45,
      'Anxious': 65,
      'Sad': 70,
      'Angry': 75
    };

    const estimatedScore = moodStressMap[mood] || 30;
    const estimatedCategory = estimatedScore > 70 ? 'High' : (estimatedScore > 40 ? 'Medium' : 'Low');

    const moodLog = await MoodLog.create({
      user: req.user.id,
      mood,
      note
    });

    // Save as stress score log
    await StressScore.create({
      user: req.user.id,
      score: estimatedScore,
      category: estimatedCategory,
      source: 'MoodLog'
    });

    res.status(201).json({ success: true, moodLog });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user mood log history
// @route   GET /api/mood
// @access  Private
export const getMoodHistory = async (req, res, next) => {
  try {
    const history = await MoodLog.find({ user: req.user.id }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, count: history.length, history });
  } catch (error) {
    next(error);
  }
};
