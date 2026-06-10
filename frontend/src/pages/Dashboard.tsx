import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Smile, Flame, Award, AlertCircle, Heart, ShieldAlert,
  Play, Timer, Sparkles, Brain, CheckSquare, Gamepad2, Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface DashboardData {
  welcomeMessage: string;
  currentStressScore: number;
  stressCategory: 'Low' | 'Medium' | 'High' | 'Critical';
  todayMood: string | null;
  streak: number;
  wellnessScore: number;
  activities: Array<{
    type: 'focus' | 'meditation' | 'game';
    title: string;
    detail: string;
    timestamp: string;
  }>;
  recommendations: {
    meditation: string;
    breathing: string;
    exercise: string;
    productivity: string;
    relaxation: string;
    sleep: string;
  };
  unreadNotifications: number;
  progressChart: Array<{
    score: number;
    source: string;
    date: string;
  }>;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.warn('Dashboard fetch failed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-dark-800 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-dark-800 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-96 bg-slate-200 dark:bg-dark-800 rounded-3xl md:col-span-2" />
          <div className="h-96 bg-slate-200 dark:bg-dark-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  const stressColorMap = {
    Low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25',
    Medium: 'text-amber-500 bg-amber-500/10 border-amber-500/25',
    High: 'text-orange-500 bg-orange-500/10 border-orange-500/25',
    Critical: 'text-red-500 bg-red-500/10 border-red-500/25 animate-pulse'
  };

  const currentStress = data?.currentStressScore ?? 0;
  const stressCategory = data?.stressCategory ?? 'Low';

  // Prepare chart details
  const chartLabels = data?.progressChart.map(item => 
    new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })
  ) || [];
  const chartData = data?.progressChart.map(item => item.score) || [];

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: 'Stress Index',
        data: chartData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointHoverRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { min: 0, max: 100, grid: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {data?.welcomeMessage}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is a summary of your mental metrics for today.</p>
        </div>
        
        {stressCategory === 'Critical' && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-4 rounded-2xl">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-bounce" />
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">High Strain Flagged</p>
              <button 
                onClick={() => navigate('/chat')}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline block mt-0.5"
              >
                Initiate emergency cooling guide &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top 4 Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stress score */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stress Score</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${stressColorMap[stressCategory]}`}>
              {stressCategory}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-800 dark:text-white">{currentStress}</span>
            <span className="text-slate-400 text-sm">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-dark-500 mt-2">Driven by your counseling updates</p>
        </div>

        {/* Streak */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Streak</span>
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-800 dark:text-white">{data?.streak ?? 0}</span>
            <span className="text-slate-400 text-sm">days</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-dark-500 mt-2">Log in daily to support habits</p>
        </div>

        {/* Today's Mood */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Mood</span>
            <Smile className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {data?.todayMood || 'Not Logged'}
            </span>
          </div>
          {data?.todayMood ? (
            <p className="text-xs text-brand-500 mt-3 font-semibold">Keep it up!</p>
          ) : (
            <Link to="/mood" className="text-xs text-brand-500 hover:underline font-semibold block mt-3">
              Log today's mood &rarr;
            </Link>
          )}
        </div>

        {/* Wellness Score */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wellness index</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-800 dark:text-white">{data?.wellnessScore ?? 50}</span>
            <span className="text-slate-400 text-sm">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-dark-500 mt-2">Active meditation & focus boost index</p>
        </div>
      </div>

      {/* Main charts and AI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-brand-500" /> Stress Tracker Analytics
            </h3>
            <span className="text-xs text-slate-400">Past 7 logs</span>
          </div>
          <div className="h-72">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                Start chatting with AI to view historical stress scorings.
              </div>
            ) : (
              <Line data={lineChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Shortcuts / Quick Actions */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Quick Meditations
            </h3>
            <p className="text-xs text-slate-400 mt-1">Recommended short breathing modules</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-800 flex items-center justify-between border border-slate-100 dark:border-dark-800">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Calm Morning Vibe</p>
                <p className="text-xs text-slate-400">5-minute audio meditation</p>
              </div>
              <button 
                onClick={() => navigate('/meditation')}
                className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-xl transition"
              >
                <Play className="w-4 h-4 fill-white" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-800 flex items-center justify-between border border-slate-100 dark:border-dark-800">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Focus Timer Loop</p>
                <p className="text-xs text-slate-400">25m work Pomodoro interval</p>
              </div>
              <button 
                onClick={() => navigate('/focus')}
                className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-xl transition"
              >
                <Timer className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Link 
            to="/chat"
            className="w-full text-center py-3 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 text-xs font-bold hover:bg-brand-100/50 transition"
          >
            Start Counseling Conversation
          </Link>
        </div>
      </div>

      {/* AI Recommendation Engine */}
      <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> AI-Generated Wellness Suggestions
          </h3>
          <p className="text-xs text-slate-400 mt-1">Personalized action points generated based on your score</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/30">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Brain className="w-4 h-4" /> Mind (Breathing & Meds)
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
              {data?.recommendations.breathing}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100/30">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Heart className="w-4 h-4" /> Body (Exercise & Sleep)
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
              {data?.recommendations.exercise}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/15 border border-amber-100/30">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <CheckSquare className="w-4 h-4" /> Focus & boundaries
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
              {data?.recommendations.productivity}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Log Grid */}
      <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-500" /> Recent Wellness Activities
        </h3>

        {data?.activities.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            No logged activities. Complete meditation cycles, Pomodoros, or play mini-games to build history logs.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.activities.map((act, index) => (
              <div 
                key={index} 
                className="p-4 rounded-2xl border border-slate-100 dark:border-dark-850 hover:bg-slate-50/50 dark:hover:bg-dark-800/30 flex items-center gap-4 transition"
              >
                <div className={`p-3 rounded-xl ${
                  act.type === 'focus' 
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' 
                    : act.type === 'meditation'
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                      : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                }`}>
                  {act.type === 'focus' && <Timer className="w-5 h-5" />}
                  {act.type === 'meditation' && <Brain className="w-5 h-5" />}
                  {act.type === 'game' && <Gamepad2 className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{act.title}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{act.detail}</p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-dark-500 flex-shrink-0">
                  {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
