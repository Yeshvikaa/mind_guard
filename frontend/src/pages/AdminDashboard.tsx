import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { 
  Users, ShieldAlert, Sparkles, MessageSquare, 
  ArrowRight, Download, BarChart2, ShieldCheck,
  FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface OverviewData {
  totalEmployees: number;
  activeChatsCount: number;
  activeAlertsCount: number;
  departmentDistribution: Array<{ _id: string | null; count: number }>;
  stressDistribution: {
    Low: number;
    Medium: number;
    High: number;
    Critical: number;
  };
  recentAlerts: Array<{
    _id: string;
    triggeredByScore: number;
    createdAt: string;
    user: {
      fullName: string;
      email: string;
      department: string;
      profilePhoto: string;
    };
  }>;
  insights: string[];
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await api.get('/admin/overview');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Admin overview fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-dark-800 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-dark-800 rounded-3xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-dark-800 rounded-3xl" />
      </div>
    );
  }

  const stressColors = {
    Low: 'bg-emerald-500',
    Medium: 'bg-amber-500',
    High: 'bg-orange-500',
    Critical: 'bg-red-500'
  };

  const distributions = data?.stressDistribution || { Low: 0, Medium: 0, High: 0, Critical: 0 };
  const totalStressLogs = Object.values(distributions).reduce((a, b) => a + b, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-brand-500" /> Admin Command Center
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit employee strain levels, export logs, and configure company metadata.</p>
        </div>

        {/* Quick action buttons */}
        <div className="flex gap-3">
          <Link
            to="/admin/employees"
            className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-lg shadow-brand-500/15 flex items-center gap-2"
          >
            Manage Employees <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/admin/reports"
            className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-350 text-xs font-bold hover:bg-slate-50 dark:hover:bg-dark-800 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Audits
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Monitored Staff</span>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-4xl font-extrabold text-slate-800 dark:text-white mt-4">
            {data?.totalEmployees ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">Active accounts flagged in database</p>
        </div>

        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Therapy Logs</span>
            <MessageSquare className="w-5 h-5 text-brand-500" />
          </div>
          <p className="text-4xl font-extrabold text-slate-800 dark:text-white mt-4">
            {data?.activeChatsCount ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">Completed chatbot sessions</p>
        </div>

        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Alerts</span>
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-4xl font-extrabold text-slate-800 dark:text-white mt-4">
            {data?.activeAlertsCount ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">Emergency countdown completions logged</p>
        </div>
      </div>

      {/* Charts & Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stress Distribution */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm md:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-brand-500" /> Organizational Strain Distribution
          </h3>

          <div className="space-y-4">
            {(Object.keys(distributions) as Array<keyof typeof distributions>).map(cat => {
              const count = distributions[cat];
              const pct = totalStressLogs > 0 ? Math.round((count / totalStressLogs) * 100) : 0;
              return (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-350">{cat} Tension</span>
                    <span className="text-slate-400">{count} staff ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-dark-805 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stressColors[cat]} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Org Insights */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Org Health Insights
            </h3>
            <p className="text-xs text-slate-400 mt-1">AI suggestions compiled from company aggregates</p>
          </div>

          <div className="space-y-4 flex-1 pt-4">
            {data?.insights.map((insight, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-amber-50/35 dark:bg-amber-950/10 border border-amber-100/10 text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-350">
                {insight}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency dispatch logs & Audit Link */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alerts list */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm md:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" /> Recent Emergency Dispatches
          </h3>

          <div className="space-y-3">
            {data?.recentAlerts.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-10">All clear! No alerts triggered.</div>
            ) : (
              data?.recentAlerts.map(alert => (
                <div 
                  key={alert._id} 
                  className="p-4 rounded-2xl border border-slate-100 dark:border-dark-850 flex justify-between items-center gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://mind-guard-bcc4.onrender.com${alert.user.profilePhoto}`} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-100"
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://mind-guard-bcc4.onrender.com/uploads/default-avatar.png';
                      }}
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{alert.user.fullName}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        {alert.user.department} • {alert.user.email}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/20 font-black">
                      Score: {alert.triggeredByScore}%
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick panels */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" /> Transcript Audit
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open completed sessions to review client interaction scripts, recorded scores, and AI counseling annotations (read-only mode).
            </p>
          </div>
          <button 
            onClick={() => navigate('/admin/transcripts')}
            className="w-full text-center py-4.5 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-600 text-xs font-bold transition mt-6 dark:bg-brand-950/15 dark:text-brand-400"
          >
            Open Chat transcripts Reviewer
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
