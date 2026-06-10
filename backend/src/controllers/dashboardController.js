import { StressScore } from '../models/StressScore.js';
import { MoodLog } from '../models/MoodLog.js';
import { Notification } from '../models/Notification.js';
import { MeditationHistory } from '../models/Meditation.js';
import { FocusSession } from '../models/FocusSession.js';
import { GameScore } from '../models/GameScore.js';
import { generateAIRecommendations } from '../services/aiService.js';

// @desc    Get user dashboard overview
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch latest stress score
    const latestStress = await StressScore.findOne({ user: userId }).sort({ createdAt: -1 });
    const currentScore = latestStress ? latestStress.score : 20;
    const currentCategory = latestStress ? latestStress.category : 'Low';

    // 2. Fetch today's mood
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayMood = await MoodLog.findOne({ 
      user: userId, 
      createdAt: { $gte: startOfToday } 
    }).sort({ createdAt: -1 });

    // 3. Generate AI recommendations based on stress
    const recommendations = await generateAIRecommendations(currentScore, currentCategory);

    // 4. Fetch recent activity (join of meditation, focus, games, and mood logs)
    const recentFocus = await FocusSession.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
    const recentMeditation = await MeditationHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
    const recentGames = await GameScore.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
    
    // Combine and sort activities
    const activities = [
      ...recentFocus.map(f => ({ 
        type: 'focus', 
        title: `Completed ${f.durationMinutes}m Pomodoro`, 
        detail: f.taskName, 
        timestamp: f.createdAt 
      })),
      ...recentMeditation.map(m => ({ 
        type: 'meditation', 
        title: `Meditated: ${m.trackTitle}`, 
        detail: `${Math.round(m.durationSeconds / 60)}m session`, 
        timestamp: m.createdAt 
      })),
      ...recentGames.map(g => ({ 
        type: 'game', 
        title: `Played ${g.gameName}`, 
        detail: `Score: ${g.score}`, 
        timestamp: g.createdAt 
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6);

    // 5. Fetch notification count
    const unreadNotifications = await Notification.countDocuments({ user: userId, isRead: false });

    // 6. Calculate aggregate wellness score (0-100)
    // Formula: (Streak * 5) + (MeditationCount * 10) + (FocusCount * 5) + (LowStressBonus)
    const totalMed = await MeditationHistory.countDocuments({ user: userId });
    const totalFocus = await FocusSession.countDocuments({ user: userId, status: 'completed' });
    const streakBonus = Math.min(req.user.streak * 5, 25);
    const activityBonus = Math.min((totalMed * 10) + (totalFocus * 5), 45);
    const stressDeduction = Math.round(currentScore * 0.3); // High stress reduces wellness score
    const wellnessScore = Math.max(10, Math.min(100, 50 + streakBonus + activityBonus - stressDeduction));

    // 7. Get progress chart data (last 7 stress entries)
    const stressLogs = await StressScore.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(7);
    const progressChart = stressLogs.map(log => ({
      score: log.score,
      source: log.source,
      date: log.createdAt
    })).reverse();

    res.status(200).json({
      success: true,
      data: {
        welcomeMessage: `Welcome back, ${req.user.fullName}!`,
        currentStressScore: currentScore,
        stressCategory: currentCategory,
        todayMood: todayMood ? todayMood.mood : null,
        streak: req.user.streak,
        wellnessScore,
        activities,
        recommendations,
        unreadNotifications,
        progressChart
      }
    });
  } catch (error) {
    next(error);
  }
};
