import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { Smile, Frown, Sparkles, Heart, Activity, CheckCircle2 } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MoodLogEntry {
  _id: string;
  mood: 'Happy' | 'Calm' | 'Neutral' | 'Tired' | 'Anxious' | 'Sad' | 'Angry';
  note: string;
  createdAt: string;
}

const moodChoices = [
  { mood: 'Happy', emoji: '😊', color: 'bg-emerald-500 text-white', hover: 'hover:bg-emerald-600', desc: 'Positive, energetic' },
  { mood: 'Calm', emoji: '😌', color: 'bg-teal-500 text-white', hover: 'hover:bg-teal-600', desc: 'At peace, relaxed' },
  { mood: 'Neutral', emoji: '😐', color: 'bg-slate-500 text-white', hover: 'hover:bg-slate-600', desc: 'Balanced, standard' },
  { mood: 'Tired', emoji: '😴', color: 'bg-sky-500 text-white', hover: 'hover:bg-sky-600', desc: 'Low energy, sleepy' },
  { mood: 'Anxious', emoji: '😰', color: 'bg-amber-500 text-white', hover: 'hover:bg-amber-600', desc: 'Overthinking, tense' },
  { mood: 'Sad', emoji: '😢', color: 'bg-indigo-500 text-white', hover: 'hover:bg-indigo-600', desc: 'Down, unhappy' },
  { mood: 'Angry', emoji: '😠', color: 'bg-red-500 text-white', hover: 'hover:bg-red-600', desc: 'Frustrated, irritated' }
];

export const MoodCheck: React.FC = () => {
  const [history, setHistory] = useState<MoodLogEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchMoods = async () => {
    try {
      const res = await api.get('/mood');
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (error) {
      console.warn('Failed to fetch mood history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoods();
  }, []);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.post('/mood', { mood: selectedMood, note });
      if (res.data.success) {
        setSuccess(true);
        setNote('');
        setSelectedMood(null);
        fetchMoods();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Compile doughnut chart data
  const moodCounts: Record<string, number> = {
    Happy: 0, Calm: 0, Neutral: 0, Tired: 0, Anxious: 0, Sad: 0, Angry: 0
  };
  history.forEach(h => {
    if (moodCounts[h.mood] !== undefined) moodCounts[h.mood]++;
  });

  const doughnutData = {
    labels: Object.keys(moodCounts),
    datasets: [
      {
        data: Object.values(moodCounts),
        backgroundColor: [
          '#10b981', // Happy - Emerald
          '#14b8a6', // Calm - Teal
          '#64748b', // Neutral - Slate
          '#0ea5e9', // Tired - Sky
          '#f59e0b', // Anxious - Amber
          '#6366f1', // Sad - Indigo
          '#ef4444'  // Angry - Red
        ],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Daily Mood Check</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Log how you feel right now to get personalized recommendations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Check-in Card */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" /> Log Today's Mood
          </h3>

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-semibold">Mood successfully logged! Wellness charts updated.</span>
            </div>
          )}

          <form onSubmit={handleLog} className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {moodChoices.map(choice => (
                <button
                  key={choice.mood}
                  type="button"
                  onClick={() => setSelectedMood(choice.mood)}
                  className={`p-4 rounded-2xl border text-center transition-all duration-200 ${
                    selectedMood === choice.mood
                      ? 'border-brand-500 ring-2 ring-brand-500/25 bg-brand-50/25 dark:bg-brand-950/10'
                      : 'border-slate-150 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800/50'
                  }`}
                >
                  <span className="text-4xl block mb-2">{choice.emoji}</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white block">
                    {choice.mood}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-dark-500 block mt-1 leading-snug">
                    {choice.desc}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Reflections & Notes (Optional)
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-dark-805 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="What triggered this mood? Any notes about your work day..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedMood}
              className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold transition shadow-xl shadow-brand-500/25"
            >
              {submitting ? 'Saving...' : 'Save Reflections'}
            </button>
          </form>
        </div>

        {/* Aggregate chart */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Mood Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-1">Aggregated logs across your check-ins</p>
          </div>

          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            {history.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-10">
                Log a mood to start tracking distributions.
              </div>
            ) : (
              <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            )}
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/20 text-center">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Total Logged Check-Ins: <span className="font-bold text-indigo-500">{history.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Historical List */}
      <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" /> Historical Check-In Logs
        </h3>

        {history.length === 0 ? (
          <div className="p-6 text-center text-slate-400">No logs recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {history.map(entry => {
              const matchingChoice = moodChoices.find(c => c.mood === entry.mood);
              return (
                <div 
                  key={entry._id} 
                  className="p-4 rounded-2xl border border-slate-100 dark:border-dark-850 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl p-1 bg-slate-50 dark:bg-dark-800 rounded-xl">
                      {matchingChoice?.emoji || '😐'}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                        {entry.mood}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {entry.note || 'No description notes provided.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-dark-500 font-semibold">
                    {new Date(entry.createdAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default MoodCheck;
