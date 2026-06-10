import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-dark-950">
      <div className="w-full max-w-md bg-white dark:bg-dark-900 rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-dark-800 glass-card">
        {/* Brand */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex bg-brand-500 text-white p-3 rounded-2xl shadow-lg shadow-brand-500/30">
            <HeartPulse className="w-8 h-8 animate-pulse-slow" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Welcome to MindGuard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Protecting your focus and wellness at work</p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3 border border-red-100 dark:border-red-900/30 animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
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
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                placeholder="you@company.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember me & submit */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
            />
            <label htmlFor="remember" className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Remember me on this device
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all duration-200 shadow-xl shadow-brand-500/25 hover:shadow-brand-500/35 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          New employee at MindGuard?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
