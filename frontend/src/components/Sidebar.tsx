import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Activity, 
  Smile, 
  Timer, 
  Gamepad2, 
  UserCircle, 
  Settings as SettingsIcon,
  ShieldCheck,
  LogOut,
  HeartPulse
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Therapy Chat', path: '/chat', icon: MessageSquare },
    { name: 'Mood Check', path: '/mood', icon: Smile },
    { name: 'Meditation Player', path: '/meditation', icon: Activity },
    { name: 'Focus Timer', path: '/focus', icon: Timer },
    { name: 'Wellness Games', path: '/games', icon: Gamepad2 },
    { name: 'Profile Settings', path: '/profile', icon: UserCircle },
  ];

  const adminItems = [
    { name: 'Admin Control', path: '/admin', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 flex flex-col h-screen sticky top-0">
      {/* Brand logo */}
      <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex items-center gap-3">
        <div className="bg-brand-500 text-white p-2 rounded-xl">
          <HeartPulse className="w-6 h-6 animate-pulse-slow" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-slate-800 dark:text-white tracking-wide">MindGuard</h1>
          <span className="text-xs text-brand-500 font-medium">Enterprise Wellness</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <span className="px-3 text-xs font-semibold text-slate-400 dark:text-dark-500 uppercase tracking-wider block mb-2">
          Toolkit
        </span>
        {menuItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}

        {isAdmin && (
          <div className="pt-6">
            <span className="px-3 text-xs font-semibold text-slate-400 dark:text-dark-500 uppercase tracking-wider block mb-2">
              Management
            </span>
            {adminItems.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom Profile summary */}
      <div className="p-4 border-t border-slate-200 dark:border-dark-800 space-y-3">
        <div className="flex items-center gap-3">
          <img 
            src={user?.profilePhoto ? `https://mind-guard-bcc4.onrender.com${user.profilePhoto}` : '/uploads/default-avatar.png'} 
            alt="Profile Avatar" 
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-dark-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://mind-guard-bcc4.onrender.com/uploads/default-avatar.png';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.role} • {user?.department || 'Staff'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-dark-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
