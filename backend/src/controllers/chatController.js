import { Chat } from '../models/Chat.js';
import { StressScore } from '../models/StressScore.js';
import { Notification } from '../models/Notification.js';
import { generateChatResponse, analyzeStressScore } from '../services/aiService.js';

// @desc    Start a new chat session
// @route   POST /api/chats
// @access  Private
export const startChat = async (req, res, next) => {
  try {
    const chat = await Chat.create({
      user: req.user.id,
      messages: []
    });

    res.status(201).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's chat sessions
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: chats.length, chats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific chat by ID
// @route   GET /api/chats/:id
// @access  Private
export const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat session not found' });
    }
    res.status(200).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message in a session and get AI response + stress analysis
// @route   POST /api/chats/:id/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Please enter a message' });
    }

    const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat session not found' });
    }

    // 1. Generate AI Response
    const aiText = await generateChatResponse(chat.messages, content);

    // 2. Analyze Stress Score of user message
    const analysis = await analyzeStressScore(content, aiText);

    // 3. Push Messages to Schema
    chat.messages.push({ sender: 'user', content, sentimentScore: (100 - analysis.score) / 50 - 1 });
    chat.messages.push({ sender: 'ai', content: aiText });

    // Update session stress score and notes
    chat.stressScore = analysis.score;
    chat.category = analysis.category;
    chat.aiNotes = analysis.explanation;
    await chat.save();

    // 4. Save to historical StressScores collection
    await StressScore.create({
      user: req.user.id,
      score: analysis.score,
      category: analysis.category,
      source: 'Chat'
    });

    // 5. Trigger System Notification if Stress is High or Critical
    if (analysis.category === 'Critical' || analysis.category === 'High') {
      await Notification.create({
        user: req.user.id,
        title: `${analysis.category} Stress Detected`,
        message: `Your chat session indicated high tension. Please check our breathing and meditation shortcuts.`,
        type: 'stress_alert'
      });
    }

    res.status(200).json({
      success: true,
      chat,
      analysis: {
        score: analysis.score,
        category: analysis.category,
        explanation: analysis.explanation
      }
    });
  } catch (error) {
    next(error);
  }
};
