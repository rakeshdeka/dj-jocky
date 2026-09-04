import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export type AppNotification = {
  _id: string;
  title: string;
  body: string;
  read_at: string | null;
  createdAt: string;
  type?: string;
  link?: string;
  metadata?: Record<string, unknown>;
};

const getAuthConfig = (token: string | null) => ({
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});

export const fetchNotifications = async (token: string | null): Promise<AppNotification[]> => {
  const res = await axios.get(`${apiUrl}/notifications`, getAuthConfig(token));
  return res.data.items || [];
};

export const markNotificationRead = async (token: string | null, id: string) => {
  const res = await axios.patch(
    `${apiUrl}/notifications/${id}/read`,
    {},
    getAuthConfig(token),
  );
  return res.data;
};

export const getUnreadCount = (notifications: AppNotification[]) =>
  notifications.filter((n) => n.read_at === null).length;
