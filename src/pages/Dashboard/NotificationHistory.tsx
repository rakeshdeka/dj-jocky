import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { Bell, CheckCheck, Inbox, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/dashboard/layout/MainLayout';
import { Badge } from '../../components/dashboard/ui/badge';
import { Button } from '../../components/dashboard/ui/button';
import { Card, CardContent } from '../../components/dashboard/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/dashboard/ui/select';
import { RootState } from '../../store/store';
import {
  fetchNotifications,
  getUnreadCount,
  markNotificationRead,
  type AppNotification,
} from '../../lib/notifications-api';

type FilterValue = 'all' | 'unread' | 'read';

const NotificationHistory = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setNotifications(await fetchNotifications(token));
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(() => getUnreadCount(notifications), [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => n.read_at === null);
    if (filter === 'read') return notifications.filter((n) => n.read_at !== null);
    return notifications;
  }, [notifications, filter]);

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    try {
      setMarkingId(id);
      await markNotificationRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read_at: new Date().toISOString() } : n)),
      );
    } catch {
      toast.error('Failed to mark notification as read');
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => n.read_at === null);
    if (!token || unread.length === 0) return;

    try {
      setIsMarkingAll(true);
      await Promise.all(unread.map((n) => markNotificationRead(token, n._id)));
      setNotifications((prev) =>
        prev.map((n) =>
          n.read_at === null ? { ...n, read_at: new Date().toISOString() } : n,
        ),
      );
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">NOTIFICATIONS</h1>
          <p className="text-sm text-muted-foreground">View your full notification history</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filter} onValueChange={(value: FilterValue) => setFilter(value)}>
            <SelectTrigger className="w-[140px] h-9 text-xs bg-secondary/20">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              )}
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Badge variant="secondary" className="bg-[#C4FE01] text-black hover:bg-[#C4FE01]">
          {unreadCount} unread
        </Badge>
        <Badge variant="outline">{notifications.length} total</Badge>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01]" />
          <p className="text-xs">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="bg-card/20 border-border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">No notifications here</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === 'all' ? "You're all caught up." : `No ${filter} notifications.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const isUnread = notification.read_at === null;

            return (
              <Card
                key={notification._id}
                className={`bg-card/30 border-border overflow-hidden transition-colors ${
                  isUnread ? 'border-[#C4FE01]/30 bg-[#C4FE01]/5' : ''
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                        isUnread ? 'bg-[#C4FE01] text-black' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <h3
                            className={`text-sm font-semibold truncate ${
                              isUnread ? 'text-[#C4FE01]' : ''
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {isUnread && (
                            <Badge variant="secondary" className="text-[9px] h-5">
                              New
                            </Badge>
                          )}
                          {notification.type && (
                            <Badge variant="outline" className="text-[9px] h-5 capitalize">
                              {notification.type.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {format(new Date(notification.createdAt), 'MMM d, yyyy · h:mm a')}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {notification.body}
                      </p>

                      {notification.link && (
                        <a
                          href={notification.link}
                          className="inline-block text-xs text-[#C4FE01] hover:underline mt-2"
                        >
                          View details
                        </a>
                      )}

                      {isUnread && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleMarkRead(notification._id)}
                            disabled={markingId === notification._id}
                          >
                            {markingId === notification._id ? (
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            Mark as read
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
};

export default NotificationHistory;
