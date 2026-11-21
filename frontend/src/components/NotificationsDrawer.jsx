import React, { useState, useEffect } from 'react';
import { X, Bell, Check, Clock } from 'lucide-react';
import { notificationAPI } from '../services/api';

const NotificationsDrawer = ({ isOpen, onClose, onRefreshCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data.notifications || []);
      if (onRefreshCount) onRefreshCount(res.data.unread_count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col text-left animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Notifications</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="text-xs text-brand-600 hover:underline font-semibold"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  n.is_read ? 'bg-white border-slate-100 text-slate-600' : 'bg-brand-50/50 border-brand-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              No notifications at this time.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationsDrawer;
