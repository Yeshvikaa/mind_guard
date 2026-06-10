import { GameScore } from '../models/GameScore.js';

// @desc    Save game score
// @route   POST /api/games
// @access  Private
export const saveGameScore = async (req, res, next) => {
  try {
    const { gameName, score } = req.body;

    if (!gameName || score === undefined) {
      return res.status(400).json({ success: false, error: 'Please specify game name and score value' });
    }

    const gameLog = await GameScore.create({
      user: req.user.id,
      gameName,
      score: Number(score)
    });

    res.status(201).json({ success: true, gameLog });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard rankings
// @route   GET /api/games/leaderboard
// @access  Private
export const getLeaderboard = async (req, res, next) => {
  try {
    const { gameName } = req.query;

    const query = gameName ? { gameName } : {};

    // Get top scores grouped by user to show highest score per user
    const leaderboard = await GameScore.aggregate([
      { $match: query },
      { $sort: { score: -1 } },
      {
        $group: {
          _id: '$user',
          highestScore: { $first: '$score' },
          gameName: { $first: '$gameName' },
          timestamp: { $first: '$timestamp' }
        }
      },
      { $sort: { highestScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          highestScore: 1,
          gameName: 1,
          timestamp: 1,
          'userDetails.fullName': 1,
          'userDetails.email': 1,
          'userDetails.profilePhoto': 1,
          'userDetails.department': 1
        }
      }
    ]);

    res.status(200).json({ success: true, count: leaderboard.length, leaderboard });
  } catch (error) {
    next(error);
  }
};
