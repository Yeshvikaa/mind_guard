import React, { useEffect, useState } from 'react';
import { Bell, Check, MailOpen } from 'lucide-react';
import { api } from '../context/AuthContext';

interface NotificationType {
  _id: string;
  title: string;
  message: string;
  type: 'reminder' | 'meditation' | 'mood' | 'stress_alert' | 'recommendation';
  isRead: boolean;
  createdAt: string;
}

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
      
      const unreadRes = await api.get('/notifications/unread-count');
      if (unreadRes.data.success) {
        setUnreadCount(unreadRes.data.count);
      }
    } catch (error) {
      console.warn('Failed to load notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live updates
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.warn(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-2xl shadow-2xl z-50 overflow-hidden glass-card">
            <div className="p-4 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center bg-slate-50/50 dark:bg-dark-950/20">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-500" /> Notifications
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-800">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-dark-500">
                  <MailOpen className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-dark-600" />
                  <p className="text-sm">All clear! No notifications.</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif._id} 
                    className={`p-4 transition-all duration-200 ${notif.isRead ? 'opacity-75' : 'bg-brand-50/20 dark:bg-brand-950/10'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`text-sm font-semibold truncate ${notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <button 
                          onClick={() => markAsRead(notif._id)}
                          className="p-1 rounded-full text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-dark-800"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-dark-500 mt-2 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default NotificationCenter;
