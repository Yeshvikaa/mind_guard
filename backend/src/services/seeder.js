import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import { StressScore } from '../models/StressScore.js';
import { MoodLog } from '../models/MoodLog.js';
import { FocusSession } from '../models/FocusSession.js';
import { MeditationHistory } from '../models/Meditation.js';
import { Notification } from '../models/Notification.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping seeder.');
      return;
    }

    console.log('Database is empty. Seeding default data...');

    // 1. Create Default Users
    // Employee
    const employee = await User.create({
      fullName: 'John Doe',
      email: 'employee@mindguard.com',
      password: 'password123',
      role: 'Employee',
      age: 28,
      gender: 'Male',
      company: 'Acme Corp',
      employeeId: 'EMP-9082',
      department: 'Engineering',
      companyId: 'ACME-100',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+15550199',
        email: 'jane@emergency.com'
      },
      phone: '+15550100',
      profilePhoto: '/uploads/default-avatar.png',
      streak: 5,
      lastActive: new Date()
    });
    await Settings.create({ user: employee._id });

    // Admin
    const admin = await User.create({
      fullName: 'Alice Smith',
      email: 'admin@mindguard.com',
      password: 'password123',
      role: 'Admin',
      age: 35,
      gender: 'Female',
      company: 'Acme Corp',
      employeeId: 'ADM-1002',
      department: 'Human Resources',
      companyId: 'ACME-100',
      phone: '+15550200',
      profilePhoto: '/uploads/default-avatar.png',
      streak: 3,
      lastActive: new Date()
    });
    await Settings.create({ user: admin._id });

    // Super Admin
    const superAdmin = await User.create({
      fullName: 'Robert Johnson',
      email: 'superadmin@mindguard.com',
      password: 'password123',
      role: 'Super Admin',
      age: 42,
      gender: 'Male',
      company: 'Acme Corp',
      employeeId: 'SAD-0001',
      department: 'Executive',
      companyId: 'ACME-100',
      phone: '+15550300',
      profilePhoto: '/uploads/default-avatar.png',
      streak: 1,
      lastActive: new Date()
    });
    await Settings.create({ user: superAdmin._id });

    // 2. Seed Employee's Stress History (Last 7 days)
    const stressData = [
      { offset: 6, score: 25, category: 'Low', source: 'Chat' },
      { offset: 5, score: 35, category: 'Medium', source: 'Chat' },
      { offset: 4, score: 60, category: 'High', source: 'Chat' },
      { offset: 3, score: 78, category: 'Critical', source: 'Chat' },
      { offset: 2, score: 45, category: 'Medium', source: 'MoodLog' },
      { offset: 1, score: 30, category: 'Medium', source: 'Chat' },
      { offset: 0, score: 15, category: 'Low', source: 'Chat' }
    ];

    for (const data of stressData) {
      const date = new Date();
      date.setDate(date.getDate() - data.offset);
      await StressScore.create({
        user: employee._id,
        score: data.score,
        category: data.category,
        source: data.source,
        timestamp: date,
        createdAt: date
      });
    }

    // 3. Seed Employee's Mood logs (Last 5 days)
    const moodData = [
      { offset: 4, mood: 'Tired', note: 'Feeling stressed about deadlines.' },
      { offset: 3, mood: 'Anxious', note: 'Very high workload today.' },
      { offset: 2, mood: 'Calm', note: 'Had a team talk, resolved some stuff.' },
      { offset: 1, mood: 'Neutral', note: 'Regular workday.' },
      { offset: 0, mood: 'Happy', note: 'Feeling great, sprint completed!' }
    ];

    for (const data of moodData) {
      const date = new Date();
      date.setDate(date.getDate() - data.offset);
      await MoodLog.create({
        user: employee._id,
        mood: data.mood,
        note: data.note,
        timestamp: date,
        createdAt: date
      });
    }

    // 4. Seed Employee Activities (Focus Sessions & Meditation)
    const focusData = [
      { offset: 3, duration: 25, status: 'completed', task: 'Refactoring APIs' },
      { offset: 2, duration: 50, status: 'completed', task: 'Debugging schemas' },
      { offset: 1, duration: 25, status: 'stopped', task: 'Writing tests' }
    ];

    for (const data of focusData) {
      const date = new Date();
      date.setDate(date.getDate() - data.offset);
      await FocusSession.create({
        user: employee._id,
        durationMinutes: data.duration,
        status: data.status,
        taskName: data.task,
        timestamp: date,
        createdAt: date
      });
    }

    const medData = [
      { offset: 2, trackId: 'm1', title: 'Calm Breathing Practice', cat: 'Breathing', dur: 300 },
      { offset: 0, trackId: 'm2', title: 'Deep Sleep Relaxation', cat: 'Sleep', dur: 600 }
    ];

    for (const data of medData) {
      const date = new Date();
      date.setDate(date.getDate() - data.offset);
      await MeditationHistory.create({
        user: employee._id,
        trackId: data.trackId,
        trackTitle: data.title,
        category: data.cat,
        durationSeconds: data.dur,
        timestamp: date,
        createdAt: date
      });
    }

    // 5. Seed Welcome Notification
    await Notification.create({
      user: employee._id,
      title: 'Welcome to MindGuard!',
      message: 'Explore your wellness toolkit: check your stress dashboard, try guided breathing meditation, or chat with our AI wellness coach.',
      type: 'recommendation'
    });

    console.log('Seeding complete. Accounts ready:\n- John Doe (Employee): employee@mindguard.com / password123\n- Alice Smith (Admin): admin@mindguard.com / password123\n- Robert Johnson (Super Admin): superadmin@mindguard.com / password123');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
};
