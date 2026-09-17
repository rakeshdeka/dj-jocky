import axios from 'axios';
import { toMessageText } from './admin-settings-shared';

export const apiBaseUrl = import.meta.env.VITE_API_URL;

export type AdminCreateUserRole = 'Client' | 'Designer';

export type CreateAdminUserPayload = {
  email: string;
  password: string;
  name: string;
  role: AdminCreateUserRole;
  bio?: string;
  company?: string;
  phone?: string;
  portfolioUrl?: string;
  emailVerified?: boolean;
};

export type CreatedAdminUser = {
  _id?: string;
  id?: string;
  email?: string;
  name?: string;
  role?: string;
};

const getAuthConfig = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const readNestedMessage = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.trim()) return record.message.trim();
  if (record.error !== undefined) return readNestedMessage(record.error);
  return null;
};

const getResponseErrorMessage = (data: unknown, fallback: string): string => {
  const nested = readNestedMessage(data);
  if (nested) return nested;
  return toMessageText(data, fallback);
};

const isGenericHttpError = (message: string) =>
  /^Request failed with status code \d+$/i.test(message) ||
  /^Network Error$/i.test(message);

export const toAdminUserErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;
    const apiMessage = data ? getResponseErrorMessage(data, '') : '';
    if (apiMessage) return apiMessage;
  }

  if (error instanceof Error && error.message && !isGenericHttpError(error.message)) {
    return error.message;
  }

  return fallback;
};

export const validateAdminUserPassword = (password: string): string | null => {
  const value = password.trim();
  if (value.length < 8 || value.length > 128) {
    return 'Password must be 8–128 characters';
  }
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Password must include at least one letter and one number';
  }
  return null;
};

export const toAdminCreateUserRole = (role: 'client' | 'designer'): AdminCreateUserRole =>
  role === 'designer' ? 'Designer' : 'Client';

export async function createAdminUser(
  token: string,
  payload: CreateAdminUserPayload,
): Promise<{ message: string; user?: CreatedAdminUser }> {
  const body: CreateAdminUserPayload = {
    email: payload.email.trim(),
    password: payload.password,
    name: payload.name.trim(),
    role: payload.role,
  };

  const bio = payload.bio?.trim();
  const company = payload.company?.trim();
  const phone = payload.phone?.trim();
  const portfolioUrl = payload.portfolioUrl?.trim();

  if (bio) body.bio = bio;
  if (company) body.company = company;
  if (phone) body.phone = phone;
  if (portfolioUrl) body.portfolioUrl = portfolioUrl;
  if (payload.emailVerified === false) body.emailVerified = false;

  const res = await axios.post(`${apiBaseUrl}/admin/users`, body, getAuthConfig(token));
  const data = res.data;

  if (data?.success === false) {
    throw new Error(getResponseErrorMessage(data, 'Failed to create user'));
  }

  return {
    message: getResponseErrorMessage(data, 'User created successfully'),
    user: data?.user as CreatedAdminUser | undefined,
  };
}
