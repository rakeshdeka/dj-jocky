import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from '../../../components/dashboard/ui/button'
import { Input } from '../../../components/dashboard/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/dashboard/ui/card'
import { Label } from '../../../components/dashboard/ui/label'
import { Checkbox } from '../../../components/dashboard/ui/checkbox'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials } from '../../../redux/authSlice'
import { RootState } from '../../../store/store'

type UserRole = 'client' | 'designer' | 'admin'

const toMessageText = (value: unknown, fallback: string): string => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map((item) => toMessageText(item, '')).filter(Boolean).join(', ') || fallback
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (record.message !== undefined) {
      return toMessageText(record.message, fallback)
    }
    if (typeof record.error === 'string') return record.error
    if (record.error !== undefined) {
      return toMessageText(record.error, fallback)
    }
  }
  return fallback
}

const getApiSuccessMessage = (data: any, fallback: string) =>
  toMessageText(data?.message ?? data?.msg, fallback)

const getApiErrorMessage = (error: any, fallback: string) =>
  toMessageText(
    error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.response?.data ??
      error?.message,
    fallback,
  )

/* ✅ ROLE NORMALIZER */
const normalizeRole = (role: string): UserRole => {
  const r = role?.toLowerCase()?.trim()

  if (r?.includes('admin')) return 'admin'
  if (r?.includes('designer')) return 'designer'
  return 'client'
}

const AdminLogin = () => {
  const apiUrl = import.meta.env.VITE_API_URL

  const { token, user, isHydrated } = useSelector(
    (state: RootState) => state.auth
  )

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')

  /* ================= REDIRECT IF ALREADY LOGGED IN ================= */
  useEffect(() => {
    if (!isHydrated) return
    if (!token || user?.role !== 'admin') return

    navigate('/admin/dashboard', { replace: true })
  }, [token, user, isHydrated, navigate])

  /* ================= ADMIN LOGIN ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setAuthError('Please enter email and password')
      return
    }

    try {
      setIsLoading(true)
      setAuthError('')

      const res = await axios.post(
        `${apiUrl}/auth/login/admin`, // ✅ FIXED API
        { email, password },
        { withCredentials: true }
      )

      const data = res.data
      if (data?.success === false || !data?.token || !data?.user) {
        throw new Error(getApiSuccessMessage(data, 'Admin login failed'))
      }

      const normalizedUser = {
        ...data.user,
        role: normalizeRole(data.user.role),
      }

      dispatch(
        setCredentials({
          token: data.token,
          user: normalizedUser,
        })
      )

      navigate('/admin/dashboard', { replace: true })

    } catch (error: any) {
      setAuthError(getApiErrorMessage(error, 'Admin login failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    setAuthError('Admin password recovery not implemented yet.')
  }

  /* ================= LOADING ================= */
  if (!isHydrated) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#111]">
        Loading...
      </div>
    )
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[#111]" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#C4FE01]/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#C4FE01]/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="z-10 w-full max-w-md">
        <Card className="bg-[#1a1a1a]/80 backdrop-blur-xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-white text-2xl">
              Admin Login
            </CardTitle>
            <CardDescription className="text-white/50">
              Please enter your admin credentials to access the dashboard.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {authError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                  {authError}
                </p>
              )}

              {/* EMAIL */}
              <div className="space-y-2">
                <Label className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    className="pl-10 text-white bg-black/30 border-white/10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />

                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10 text-white bg-black/30 border-white/10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* REMEMBER */}
              <div className="flex items-center justify-between text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={() => setRememberMe(!rememberMe)}
                  />
                  <span>Remember me</span>
                </div>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="hover:underline"
                >
                  Forgot password?
                </button>
              </div>

            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-[#C4FE01]/80 hover:bg-[#C4FE01]/90"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login as Admin'}
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default AdminLogin