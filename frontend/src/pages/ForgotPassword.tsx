import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { HeartPulse, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess(true);
        if (res.data.token) {
          setDevToken(res.data.token);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to dispatch password recovery request.');
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
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Recover Password</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">We will send a reset link to your work inbox</p>
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
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all duration-200 shadow-xl shadow-brand-500/25 disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Send Recovery Link'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              If the account exists, we have printed the recovery details to the backend console.
            </p>

            {devToken && (
              <div className="p-4 rounded-2xl border border-dashed border-brand-500/20 bg-brand-50/10 text-center space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Developer Quick Bypass</p>
                <Link
                  to={`/reset-password/${devToken}`}
                  className="inline-block px-4 py-2 rounded-xl bg-brand-500 text-white font-semibold text-xs hover:bg-brand-600 transition-all"
                >
                  Go to Reset Password
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
