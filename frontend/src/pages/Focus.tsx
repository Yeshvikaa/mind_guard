import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { 
  Play, Pause, RotateCcw, Timer, Award, 
  CheckCircle2, Sparkles, BookOpen, AlertCircle
} from 'lucide-react';

interface FocusSession {
  _id: string;
  durationMinutes: number;
  status: 'completed' | 'paused' | 'stopped';
  taskName: string;
  createdAt: string;
}

export const Focus: React.FC = () => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [taskName, setTaskName] = useState('');
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(25 * 60);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/focus');
      if (res.data.success) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.warn('Failed to load focus sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Timer loop
  useEffect(() => {
    let interval: any = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleSessionComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Adjust timers based on mode selections
  const changeMode = (newMode: 'work' | 'short' | 'long') => {
    setIsActive(false);
    setMode(newMode);
    
    let time = 25 * 60;
    if (newMode === 'short') time = 5 * 60;
    if (newMode === 'long') time = 15 * 60;

    setTimeLeft(time);
    setInitialTime(time);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  // Submit complete log
  const handleSessionComplete = async () => {
    try {
      const duration = Math.round(initialTime / 60);
      await api.post('/focus', {
        durationMinutes: duration,
        status: 'completed',
        taskName: taskName.trim() || 'General Focus'
      });
      setSuccess(true);
      setTaskName('');
      fetchSessions();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleStopEarly = async () => {
    if (!isActive && timeLeft === initialTime) return;
    setIsActive(false);
    try {
      const elapsedMins = Math.round((initialTime - timeLeft) / 60);
      if (elapsedMins > 0) {
        await api.post('/focus', {
          durationMinutes: elapsedMins,
          status: 'stopped',
          taskName: taskName.trim() || 'Aborted Focus Block'
        });
        fetchSessions();
      }
    } catch (err) {
      console.warn(err);
    }
    setTimeLeft(initialTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // SVG circular boundary parameters
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / initialTime) * circumference;

  // Aggregate completion ratios
  const totalCompleted = sessions.filter(s => s.status === 'completed').length;
  const totalMins = sessions.reduce((acc, curr) => curr.status === 'completed' ? acc + curr.durationMinutes : acc, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Focus Pomodoro Timer</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Boost productivity and manage cognitive burnout using structured Pomodoro loops.</p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2 max-w-3xl">
          <CheckCircle2 className="w-5 h-5 animate-bounce" />
          <span className="text-sm font-semibold">Great job! Focus session saved to history logs. Take a short break now!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Timer display */}
        <div className="lg:col-span-2 p-8 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm flex flex-col items-center justify-center space-y-8">
          {/* Mode triggers */}
          <div className="flex bg-slate-100 dark:bg-dark-800 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => changeMode('work')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'work' ? 'bg-brand-500 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Work Block
            </button>
            <button
              onClick={() => changeMode('short')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'short' ? 'bg-brand-500 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => changeMode('long')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'long' ? 'bg-brand-500 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Long Break
            </button>
          </div>

          {/* Circle Ring Visualizer */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r={radius}
                className="stroke-slate-100 dark:stroke-dark-800 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="112"
                cy="112"
                r={radius}
                className="stroke-brand-500 fill-none transition-all duration-300"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-800 dark:text-white tracking-wide">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                {mode === 'work' ? 'Focusing' : 'Resting'}
              </span>
            </div>
          </div>

          {/* Form Task Input */}
          <div className="w-full max-w-sm space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              What are you focusing on?
            </label>
            <input
              type="text"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-805 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="Writing presentation, Coding API, reading..."
            />
          </div>

          {/* Timer controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleStopEarly}
              className="p-3.5 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition"
              title="Stop and record early exit"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold transition shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 hover:scale-[1.02] flex items-center gap-2"
            >
              {isActive ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              {isActive ? 'Pause Timer' : 'Start Focus'}
            </button>

            <button 
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-slate-50 text-slate-600 dark:bg-dark-800 dark:text-slate-350 border border-slate-100 dark:border-dark-750 hover:bg-slate-100 transition"
              title="Reset current segment"
            >
              <Timer className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Analytics stats */}
        <div className="p-8 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Focus Analytics
            </h3>
            <p className="text-xs text-slate-400 mt-1">Aggregated focus sessions completions</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-950/50 border border-slate-100 dark:border-dark-850 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
              <span className="text-3xl font-black text-slate-850 dark:text-white mt-1 block">
                {totalCompleted}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-950/50 border border-slate-100 dark:border-dark-850 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Focus Hours</span>
              <span className="text-3xl font-black text-slate-850 dark:text-white mt-1 block">
                {Math.round(totalMins / 60)} hrs
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-dark-800 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historical Focus Blocks</h4>
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-10">No focus sessions logged.</div>
              ) : (
                sessions.map(s => (
                  <div 
                    key={s._id} 
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-dark-850 flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{s.taskName}</p>
                      <span className="text-[10px] text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold ${
                      s.status === 'completed' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' 
                        : 'bg-red-50 text-red-600 dark:bg-red-950/20'
                    }`}>
                      {s.durationMinutes}m {s.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Focus;
