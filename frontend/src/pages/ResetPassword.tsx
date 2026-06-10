import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { HeartPulse, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password. Link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-dark-950">
      <div className="w-full max-w-md bg-white dark:bg-dark-900 rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-dark-800 glass-card">
        {/* Brand */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex bg-brand-500 text-white p-3 rounded-2xl shadow-lg">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">New Password</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure new login credentials</p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all duration-200 shadow-xl shadow-brand-500/25 disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save & Continue'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
              Password updated successfully!
            </p>
            <Link
              to="/login"
              className="w-full inline-block py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all shadow-xl shadow-brand-500/25"
            >
              Log In Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default ResetPassword;
