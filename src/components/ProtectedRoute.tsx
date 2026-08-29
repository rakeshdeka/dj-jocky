import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { PuffLoader } from 'react-spinners'

type UserRole = 'client' | 'designer' | 'admin'

interface ProtectedRouteProps {
  requiredRole?: UserRole
  children: ReactNode
}

const roleRedirectMap: Record<UserRole, string> = {
  client: '/client/briefs',
  designer: '/designer/dashboard',
  admin: '/admin/dashboard',
}

export default function ProtectedRoute({
  requiredRole,
  children,
}: ProtectedRouteProps) {
  const { token, user, isHydrated } = useSelector(
    (state: RootState) => state.auth
  )

  const location = useLocation()

  // ✅ wait for hydration
  if (!isHydrated) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#111]">
        <PuffLoader color="#C4FE01" />
      </div>
    )
  }

  // 🔒 not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 🔒 wrong role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={roleRedirectMap[user.role]} replace />
  }

  return <>{children}</>
}