import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NotificationCenter } from './NotificationCenter';
import { useTheme } from '../context/ThemeContext';
import { useAuth, api } from '../context/AuthContext';
import { Search, Moon, Sun, Settings, X } from 'lucide-react';

interface SearchResult {
  employees: any[];
  chats: any[];
  moods: any[];
  notifications: any[];
}

export const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get('/search', { params: { q } });
      if (res.data.success) {
        setSearchResults(res.data.results);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setSearching(false);
    }
  };

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const totalResults = searchResults
    ? (searchResults.employees?.length || 0) +
      (searchResults.chats?.length || 0) +
      (searchResults.moods?.length || 0) +
      (searchResults.notifications?.length || 0)
    : 0;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-dark-950 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between px-6 gap-4 flex-shrink-0 z-30">
          {/* Global Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search employees, chats, moods..."
              className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Search Dropdown */}
            {searchResults && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                {totalResults === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">No results found for "{searchQuery}"</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-dark-800">
                    {isAdmin && searchResults.employees?.length > 0 && (
                      <div className="p-3">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-2 pb-2">Employees</p>
                        {searchResults.employees.map((emp: any) => (
                          <button key={emp._id} onClick={() => { navigate('/admin/employees'); setSearchQuery(''); setSearchResults(null); }} className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition">
                            <p className="text-xs font-bold text-slate-800 dark:text-white">{emp.fullName}</p>
                            <p className="text-[10px] text-slate-400">{emp.email} · {emp.department}</p>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.chats?.length > 0 && (
                      <div className="p-3">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-2 pb-2">Chats</p>
                        {searchResults.chats.map((chat: any) => (
                          <button key={chat._id} onClick={() => { navigate('/chat'); setSearchQuery(''); setSearchResults(null); }} className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition">
                            <p className="text-xs font-bold text-slate-800 dark:text-white">Session — {chat.category} Stress</p>
                            <p className="text-[10px] text-slate-400">{chat.user?.fullName} · Score: {chat.stressScore}%</p>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.notifications?.length > 0 && (
                      <div className="p-3">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-2 pb-2">Notifications</p>
                        {searchResults.notifications.map((n: any) => (
                          <div key={n._id} className="p-2.5 rounded-xl">
                            <p className="text-xs font-bold text-slate-800 dark:text-white">{n.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right header actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 transition"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications */}
            <NotificationCenter />

            {/* Settings shortcut */}
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 transition"
              title="App settings"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default Layout;
