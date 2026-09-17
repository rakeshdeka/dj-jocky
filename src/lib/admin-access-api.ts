import axios from 'axios';
import { toMessageText } from './admin-settings-shared';

export const apiBaseUrl = import.meta.env.VITE_API_URL;

export type AdminSettingsPermissions = {
  categories?: boolean;
  services?: boolean;
  plans?: boolean;
  countries?: boolean;
  currencies?: boolean;
};

export type AdminPermissions = {
  dashboard?: boolean;
  users?: boolean;
  projects?: boolean;
  portfolio?: boolean;
  meetings?: boolean;
  payments?: boolean;
  settings?: AdminSettingsPermissions;
};

export type AdminMenuAccess = AdminPermissions;

export type AdminAccessPayload = {
  is_super_admin?: boolean;
  isSuperAdmin?: boolean;
  menu?: AdminMenuAccess;
  permissions?: AdminPermissions;
};

export type SubAdminUser = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
  admin_permissions?: AdminPermissions;
  createdAt?: string;
};

export type CreateSubAdminPayload = {
  email: string;
  password: string;
  name: string;
  admin_permissions: AdminPermissions;
};

export type UpdateSubAdminPayload = {
  name?: string;
  email?: string;
  password?: string;
  admin_permissions?: AdminPermissions;
};

const getAuthConfig = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const readNestedMessage = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.trim()) return record.message.trim();
  if (record.error !== undefined) return readNestedMessage(record.error);
  return null;
};

export const toAdminAccessErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;
    const msg = data ? readNestedMessage(data) || toMessageText(data, '') : '';
    if (msg) return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const EMPTY_ADMIN_PERMISSIONS: AdminPermissions = {
  dashboard: false,
  users: false,
  projects: false,
  portfolio: false,
  meetings: false,
  payments: false,
  settings: {
    categories: false,
    services: false,
    plans: false,
    countries: false,
    currencies: false,
  },
};

export const FULL_ADMIN_PERMISSIONS: AdminPermissions = {
  dashboard: true,
  users: true,
  projects: true,
  portfolio: true,
  meetings: true,
  payments: true,
  settings: {
    categories: true,
    services: true,
    plans: true,
    countries: true,
    currencies: true,
  },
};

export const normalizePermissions = (raw?: AdminPermissions | null): AdminPermissions => {
  const base = { ...EMPTY_ADMIN_PERMISSIONS, settings: { ...EMPTY_ADMIN_PERMISSIONS.settings } };
  if (!raw) return base;
  return {
    dashboard: Boolean(raw.dashboard),
    users: Boolean(raw.users),
    projects: Boolean(raw.projects),
    portfolio: Boolean(raw.portfolio),
    meetings: Boolean(raw.meetings),
    payments: Boolean(raw.payments),
    settings: {
      categories: Boolean(raw.settings?.categories),
      services: Boolean(raw.settings?.services),
      plans: Boolean(raw.settings?.plans),
      countries: Boolean(raw.settings?.countries),
      currencies: Boolean(raw.settings?.currencies),
    },
  };
};

const parseAccessEnvelope = (data: unknown): AdminAccessPayload => {
  const record = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const access =
    (record.access && typeof record.access === 'object' ? record.access : record) as Record<
      string,
      unknown
    >;

  const menu =
    (access.menu && typeof access.menu === 'object' ? access.menu : access.permissions) as
      | AdminPermissions
      | undefined;

  return {
    is_super_admin: Boolean(access.is_super_admin ?? access.isSuperAdmin ?? record.is_super_admin),
    menu: normalizePermissions(menu),
    permissions: normalizePermissions(
      (access.permissions as AdminPermissions | undefined) ?? menu,
    ),
  };
};

export const mergeLoginAccess = (
  loginAccess: unknown,
  fetched?: AdminAccessPayload,
): AdminAccessPayload => {
  const fromLogin = parseAccessEnvelope({ access: loginAccess });
  if (fetched?.menu) {
    return {
      is_super_admin: Boolean(fetched.is_super_admin ?? fromLogin.is_super_admin),
      menu: fetched.menu,
      permissions: fetched.permissions ?? fetched.menu,
    };
  }
  return fromLogin;
};

export async function fetchAdminAccess(token: string): Promise<AdminAccessPayload> {
  const res = await axios.get(`${apiBaseUrl}/admin/me/access`, getAuthConfig(token));
  const data = res.data;
  if (data?.success === false) {
    throw new Error(readNestedMessage(data) || 'Failed to load admin access');
  }
  return parseAccessEnvelope(data);
}

export async function fetchSubAdmins(token: string): Promise<SubAdminUser[]> {
  const res = await axios.get(`${apiBaseUrl}/admin/sub-admins`, getAuthConfig(token));
  const data = res.data;
  if (data?.success === false) {
    throw new Error(readNestedMessage(data) || 'Failed to load sub-admins');
  }
  const list = data.items ?? data.sub_admins ?? data.users ?? data.data ?? [];
  return (Array.isArray(list) ? list : []).map((item: SubAdminUser) => ({
    ...item,
    _id: String(item._id || item.id),
  }));
}

export async function createSubAdmin(token: string, payload: CreateSubAdminPayload) {
  const res = await axios.post(`${apiBaseUrl}/admin/sub-admins`, payload, getAuthConfig(token));
  const data = res.data;
  if (data?.success === false) {
    throw new Error(readNestedMessage(data) || 'Failed to create sub-admin');
  }
  return data;
}

export async function updateSubAdmin(
  token: string,
  id: string,
  payload: UpdateSubAdminPayload,
) {
  const res = await axios.patch(`${apiBaseUrl}/admin/sub-admins/${id}`, payload, getAuthConfig(token));
  const data = res.data;
  if (data?.success === false) {
    throw new Error(readNestedMessage(data) || 'Failed to update sub-admin');
  }
  return data;
}

export async function deleteSubAdmin(token: string, id: string) {
  const res = await axios.delete(`${apiBaseUrl}/admin/sub-admins/${id}`, getAuthConfig(token));
  const data = res.data;
  if (data?.success === false) {
    throw new Error(readNestedMessage(data) || 'Failed to delete sub-admin');
  }
  return data;
}

/** Map admin URL to permission key (matches backend enforceAdminRoutePermission). */
export const getAdminPathPermissionKey = (pathname: string): string | null => {
  const path = pathname.split('?')[0].replace(/\/$/, '') || '/';

  if (path === '/admin' || path === '/admin/dashboard') return 'dashboard';
  if (path.startsWith('/admin/users')) return 'users';
  if (path.startsWith('/admin/projects')) return 'projects';
  if (path.startsWith('/admin/portfolio')) return 'portfolio';
  if (path.startsWith('/admin/meetings')) return 'meetings';
  if (path.startsWith('/admin/payments')) return 'payments';
  if (path.startsWith('/admin/sub-admins')) return null; // super-admin only (handled separately)
  if (path.startsWith('/admin/notifications')) return 'dashboard';
  if (path.startsWith('/admin/cms')) return null;

  if (path.startsWith('/admin/settings/categories')) return 'settings.categories';
  if (path.startsWith('/admin/settings/services')) return 'settings.services';
  if (path.startsWith('/admin/settings/plans')) return 'settings.plans';
  if (path.startsWith('/admin/settings/countries')) return 'settings.countries';
  if (path.startsWith('/admin/settings/currencies')) return 'settings.currencies';
  if (path.startsWith('/admin/settings')) return 'settings.categories';

  return null;
};

export const isPermissionGranted = (
  menu: AdminMenuAccess | null | undefined,
  key: string,
  isSuperAdmin?: boolean,
): boolean => {
  if (isSuperAdmin) return true;
  if (!menu) return false;

  if (key.startsWith('settings.')) {
    const sub = key.split('.')[1] as keyof AdminSettingsPermissions;
    return Boolean(menu.settings?.[sub]);
  }

  return Boolean((menu as Record<string, unknown>)[key]);
};

export const canAccessAdminPath = (
  pathname: string,
  menu: AdminMenuAccess | null | undefined,
  isSuperAdmin?: boolean,
): boolean => {
  if (isSuperAdmin) return true;
  if (pathname.startsWith('/admin/sub-admins')) return false;

  const key = getAdminPathPermissionKey(pathname);
  if (!key) return true;
  return isPermissionGranted(menu, key, false);
};

const MENU_ENTRIES: { key: string; path: string }[] = [
  { key: 'dashboard', path: '/admin/dashboard' },
  { key: 'users', path: '/admin/users' },
  { key: 'projects', path: '/admin/projects' },
  { key: 'portfolio', path: '/admin/portfolio' },
  { key: 'meetings', path: '/admin/meetings' },
  { key: 'payments', path: '/admin/payments' },
  { key: 'settings.categories', path: '/admin/settings/categories' },
];

export const getDefaultAdminLandingPath = (
  menu: AdminMenuAccess | null | undefined,
  isSuperAdmin?: boolean,
): string => {
  if (isSuperAdmin) return '/admin/dashboard';
  for (const entry of MENU_ENTRIES) {
    if (isPermissionGranted(menu, entry.key, false)) return entry.path;
  }
  return '/admin/dashboard';
};

export const hasAnySettingsPermission = (
  menu: AdminMenuAccess | null | undefined,
  isSuperAdmin?: boolean,
): boolean => {
  if (isSuperAdmin) return true;
  if (!menu?.settings) return false;
  return Object.values(menu.settings).some(Boolean);
};

export const countGrantedPermissions = (permissions: AdminPermissions): number => {
  let count = 0;
  if (permissions.dashboard) count += 1;
  if (permissions.users) count += 1;
  if (permissions.projects) count += 1;
  if (permissions.portfolio) count += 1;
  if (permissions.meetings) count += 1;
  if (permissions.payments) count += 1;
  const s = permissions.settings;
  if (s?.categories) count += 1;
  if (s?.services) count += 1;
  if (s?.plans) count += 1;
  if (s?.countries) count += 1;
  if (s?.currencies) count += 1;
  return count;
};
