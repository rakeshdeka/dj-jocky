import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export type AuthSession = {
  _id: string;
  device: string;
  platform?: string;
  location: string;
  ip: string;
  loginAt: string;
  lastActiveAt?: string;
  expiresAt?: string;
  isCurrent: boolean;
};

export type SessionsResponse = {
  success: boolean;
  currentSession?: AuthSession | null;
  sessions: AuthSession[];
};

const getAuthConfig = (token: string) => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  withCredentials: true,
});

export const fetchAuthSessions = async (token: string): Promise<AuthSession[]> => {
  const res = await axios.get<SessionsResponse>(`${apiUrl}/auth/sessions`, getAuthConfig(token));
  const data = res.data;

  if (!data.success) {
    throw new Error('Failed to load sessions');
  }

  const sessions = Array.isArray(data.sessions) ? data.sessions : [];

  if (data.currentSession && !sessions.some((s) => s._id === data.currentSession?._id)) {
    return [data.currentSession, ...sessions];
  }

  return sessions;
};

export const logoutAuthSession = async (token: string, sessionId: string) => {
  const res = await axios.delete(`${apiUrl}/auth/sessions/${sessionId}`, getAuthConfig(token));
  return res.data;
};

export const logoutAllAuthSessions = async (token: string) => {
  const res = await axios.post(`${apiUrl}/auth/logout-all`, {}, getAuthConfig(token));
  return res.data;
};

export const changeAuthPassword = async (
  token: string,
  oldPassword: string,
  newPassword: string,
) => {
  const payload = { currentPassword: oldPassword, newPassword };
  try {
    const res = await axios.post(`${apiUrl}/profile/change-password`, payload, getAuthConfig(token));
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const res = await axios.post(
        `${apiUrl}/auth/change-password`,
        { oldPassword, newPassword },
        getAuthConfig(token),
      );
      return res.data;
    }
    throw error;
  }
};

export const validateNewPassword = (
  oldPassword: string,
  newPassword: string,
  confirmPassword: string,
): string | null => {
  if (!oldPassword.trim()) return 'Enter your current password';
  if (!newPassword) return 'Enter a new password';
  if (newPassword.length < 8 || newPassword.length > 128) {
    return 'New password must be 8–128 characters';
  }
  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return 'New password must include at least one letter and one number';
  }
  if (newPassword === oldPassword) {
    return 'New password must be different from your current password';
  }
  if (newPassword !== confirmPassword) {
    return 'New passwords do not match';
  }
  return null;
};
