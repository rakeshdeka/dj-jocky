import type { UserRole } from '../redux/authSlice'

export function normalizeStoredRole(role: unknown): UserRole {
  const r = String(role ?? '')
    .toLowerCase()
    .trim()
  if (r.includes('admin')) return 'admin'
  if (r.includes('designer')) return 'designer'
  return 'client'
}

/** Same source of truth as login: `token` + JSON `user` in localStorage */
export function getStoredAuth(): {
  isAuthenticated: boolean
  role: UserRole | null
} {
  const token = localStorage.getItem('token')
  if (!token) return { isAuthenticated: false, role: null }
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return { isAuthenticated: false, role: null }
    const u = JSON.parse(raw) as { role?: unknown }
    return {
      isAuthenticated: true,
      role: normalizeStoredRole(u?.role),
    }
  } catch {
    return { isAuthenticated: false, role: null }
  }
}
