import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types';
import { formatTime } from '@/lib/utils';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const loadNotifications = async () => {
    const list = await notificationService.getNotifications(user?.id);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener('tb_notifications_updated', handleUpdate);
    return () => window.removeEventListener('tb_notifications_updated', handleUpdate);
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(user?.id);
    loadNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered =
    filter === 'UNREAD' ? notifications.filter((n) => !n.isRead) : notifications;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ORDER_READY':
        return <CheckCircle2 className="w-5 h-5 text-secondary dark:text-emerald-400" />;
      case 'ORDER_PREPARING':
        return <Clock className="w-5 h-5 text-primary dark:text-[#f08344]" />;
      case 'SERVICE_TIMING':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'ITEM_UNAVAILABLE':
        return <AlertTriangle className="w-5 h-5 text-error" />;
      default:
        return <Bell className="w-5 h-5 text-tertiary" />;
    }
  };

  return (
    <div className="flex flex-col w-full pb-32 max-w-xl mx-auto px-gutter pt-space-sm gap-space-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white">
            Notifications
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-400">
            {unreadCount > 0 ? `${unreadCount} unread announcements` : 'All caught up'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-primary dark:text-[#f08344] hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-full font-label-sm text-xs transition-colors ${
            filter === 'ALL'
              ? 'bg-inverse-surface dark:bg-white text-inverse-on-surface dark:text-black font-bold'
              : 'bg-surface-container dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-full font-label-sm text-xs transition-colors ${
            filter === 'UNREAD'
              ? 'bg-inverse-surface dark:bg-white text-inverse-on-surface dark:text-black font-bold'
              : 'bg-surface-container dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl border border-surface-container-high/60 dark:border-white/5 flex flex-col items-center justify-center">
          <Bell className="w-12 h-12 text-tertiary mb-3 opacity-40" />
          <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
            No Notifications
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-400 mt-1">
            You will receive order status alerts and canteen schedule pings here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkAsRead(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                !item.isRead
                  ? 'bg-surface-container-lowest dark:bg-[#1A1A1A] border-primary/30 shadow-sm'
                  : 'bg-surface-container-low dark:bg-[#181818] border-surface-container-high/40 dark:border-white/5 opacity-80'
              }`}
            >
              <div className="p-2 rounded-xl bg-surface-container dark:bg-[#242424] shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-label-md font-bold text-on-surface dark:text-white text-sm">
                    {item.title}
                  </h4>
                  <span className="font-body-sm text-[11px] text-tertiary dark:text-neutral-400 whitespace-nowrap">
                    {formatTime(item.createdAt)}
                  </span>
                </div>

                <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-300 mt-0.5">
                  {item.message}
                </p>

                {item.actionUrl && (
                  <Link
                    to={item.actionUrl}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-[#f08344] hover:underline"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {!item.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

