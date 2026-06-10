import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings as SettingsIcon, Moon, Bell, EyeOff, 
  Languages, Sparkles, CheckCircle2, RefreshCw
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [shareStress, setShareStress] = useState(true);
  const [language, setLanguage] = useState('en');
  const [conversationStyle, setConversationStyle] = useState<'Supportive' | 'Direct' | 'Coach'>('Supportive');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.settings) {
          const s = res.data.settings;
          setNotificationsEnabled(s.notificationsEnabled);
          setShareStress(s.privacySettings?.shareStressWithAdmin ?? true);
          setLanguage(s.language || 'en');
          setConversationStyle(s.aiPreferences?.conversationStyle || 'Supportive');
        }
      } catch (err) {
        console.warn('Failed to load user settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/profile/settings', {
        darkMode: theme === 'dark',
        notificationsEnabled,
        shareStressWithAdmin: shareStress,
        language,
        conversationStyle
      });
      if (res.data.success) {
        setSuccess(true);
        refreshUser();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">App Preferences</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your privacy, dark mode, and AI coaching tones.</p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">Settings successfully saved.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Visual styles */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-dark-850">
            <Moon className="w-5 h-5 text-indigo-500" /> Interface & Theme
          </h3>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Dark Mode Theme</p>
              <p className="text-xs text-slate-450 dark:text-slate-400">Toggle dark-slate corporate backgrounds</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none flex items-center p-1 ${
                theme === 'dark' ? 'bg-brand-500 justify-end' : 'bg-slate-200 justify-start'
              }`}
            >
              <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-dark-850">
            <Bell className="w-5 h-5 text-brand-500" /> Notifications Feed
          </h3>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Enable Notifications</p>
              <p className="text-xs text-slate-450 dark:text-slate-400">Receive daily breathing checks and stress triggers alerts</p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none flex items-center p-1 ${
                notificationsEnabled ? 'bg-brand-500 justify-end' : 'bg-slate-200 justify-start'
              }`}
            >
              <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-dark-850">
            <EyeOff className="w-5 h-5 text-red-500" /> Data Privacy & Analytics
          </h3>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Share stress statistics with HR</p>
              <p className="text-xs text-slate-450 dark:text-slate-400">Allow HR department to see aggregated anonymous stress indexes</p>
            </div>
            <button
              type="button"
              onClick={() => setShareStress(!shareStress)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none flex items-center p-1 ${
                shareStress ? 'bg-brand-500 justify-end' : 'bg-slate-200 justify-start'
              }`}
            >
              <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* Language & AI Preferences */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-dark-850">
            <Sparkles className="w-5 h-5 text-indigo-500" /> AI Coach Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-450 uppercase block">Preferred Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-805 bg-slate-50/50 dark:bg-dark-950/50 text-slate-850 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="en">English (US)</option>
                <option value="es">Español (ES)</option>
                <option value="fr">Français (FR)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-450 uppercase block">AI Conversation Tone</label>
              <select
                value={conversationStyle}
                onChange={e => setConversationStyle(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-805 bg-slate-50/50 dark:bg-dark-950/50 text-slate-850 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Supportive">Supportive & Caring</option>
                <option value="Direct">Direct & Analytical</option>
                <option value="Coach">Mindfulness Coach</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold transition shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {loading ? 'Saving preferences...' : 'Save App Preferences'}
        </button>
      </form>
    </div>
  );
};
export default Settings;
