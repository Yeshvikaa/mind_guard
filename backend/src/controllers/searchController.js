import { User } from '../models/User.js';
import { Chat } from '../models/Chat.js';
import { MoodLog } from '../models/MoodLog.js';
import { Notification } from '../models/Notification.js';

// @desc    Perform a global search across models based on user role
// @route   GET /api/search
// @access  Private
export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Please enter a search query' });
    }

    const isAdmin = ['Admin', 'Super Admin'].includes(req.user.role);
    const userId = req.user.id;

    const results = {
      employees: [],
      chats: [],
      moods: [],
      notifications: []
    };

    // 1. Employee Search (Admin only)
    if (isAdmin) {
      results.employees = await User.find({
        role: 'Employee',
        $or: [
          { fullName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { department: { $regex: q, $options: 'i' } }
        ]
      }).limit(5);
    }

    // 2. Chat Search (Admins search all, Employees search own)
    const chatQuery = isAdmin ? {} : { user: userId };
    results.chats = await Chat.find({
      ...chatQuery,
      'messages.content': { $regex: q, $options: 'i' }
    })
      .populate('user', 'fullName email profilePhoto')
      .limit(5);

    // 3. Mood Search (Employees search own)
    const moodQuery = isAdmin ? {} : { user: userId };
    results.moods = await MoodLog.find({
      ...moodQuery,
      $or: [
        { mood: { $regex: q, $options: 'i' } },
        { note: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('user', 'fullName email')
      .limit(5);

    // 4. Notification Search (Admins search all, Employees search own)
    const notifQuery = isAdmin ? {} : { user: userId };
    results.notifications = await Notification.find({
      ...notifQuery,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } }
      ]
    }).limit(5);

    res.status(200).json({
      success: true,
      query: q,
      results
    });
  } catch (error) {
    next(error);
  }
};
