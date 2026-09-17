import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../components/dashboard/ui/button';
import { Input } from '../../components/dashboard/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../../components/dashboard/ui/card';
import { Label } from '../../components/dashboard/ui/label';
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/authSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  consumePendingTeamInvite,
  storePendingTeamInvite,
} from './user/TeamJoin';
import { previewTeamInvite } from '../../lib/team-api';

type UserRole = 'client' | 'designer' | 'admin';

const toMessageText = (value: unknown, fallback: string): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map((item) => toMessageText(item, '')).filter(Boolean).join(', ') || fallback;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (record.message !== undefined) {
      return toMessageText(record.message, fallback);
    }
    if (typeof record.error === 'string') return record.error;
    if (record.error !== undefined) {
      return toMessageText(record.error, fallback);
    }
  }
  return fallback;
};

const getApiSuccessMessage = (data: any, fallback: string) =>
  toMessageText(data?.message ?? data?.msg, fallback);

const getApiErrorMessage = (error: any, fallback: string) =>
  toMessageText(
    error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.response?.data ??
      error?.message,
    fallback,
  );

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token, user, isHydrated } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamInviteParam = searchParams.get('teamInvite')?.trim() || '';
  const wantsSignup = searchParams.get('signup') === '1';

  // common
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // signup only
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // 🔥 NEW STATES (no UI change)
  const [otp, setOtp] = useState('');
  const [isVerifyStep, setIsVerifyStep] = useState(false);
  const [authError, setAuthError] = useState('');

  const getPostAuthPath = (role: UserRole) => {
    const pendingInvite = consumePendingTeamInvite() || teamInviteParam;
    if (role === 'client' && pendingInvite) {
      return `/team/join?token=${encodeURIComponent(pendingInvite)}`;
    }

    const redirectMap: Record<UserRole, string> = {
      client: '/client/briefs',
      designer: '/designer/dashboard',
      admin: '/admin/dashboard',
    };

    return redirectMap[role];
  };

  useEffect(() => {
    if (teamInviteParam) {
      storePendingTeamInvite(teamInviteParam);
      if (wantsSignup) setIsSignUp(true);
    }
  }, [teamInviteParam, wantsSignup]);

  useEffect(() => {
    if (!teamInviteParam) return;

    previewTeamInvite(teamInviteParam)
      .then((preview) => {
        if (preview.email) setEmail(preview.email);
        if (preview.name) {
          const [first, ...rest] = preview.name.trim().split(/\s+/);
          setFirstName(first || '');
          setLastName(rest.join(' '));
        }
      })
      .catch(() => {
        // Preview is optional on the login screen.
      });
  }, [teamInviteParam]);

  /* ================= REGISTER ================= */
  useEffect(() => {
    if (!isHydrated || !token || !user?.role) return;
    navigate(getPostAuthPath(user.role), { replace: true });
  }, [isHydrated, token, user, navigate, teamInviteParam])

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      setAuthError('');

      const formData = new FormData();

      formData.append('email', email);
      formData.append('password', password);
      formData.append('name', `${firstName} ${lastName}`);

      // ✅ EMPTY REQUIRED FIELDS
      formData.append('bio', '');
      formData.append('company', '');
      formData.append('phone', '');
      formData.append('portfolioUrl', '');
      formData.append('inviteToken', '');
      formData.append('profilePicture', '');

      const res = await axios.post(`${apiUrl}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      const data = res.data;
      if (data?.success === false) {
        throw new Error(getApiSuccessMessage(data, 'Registration failed'));
      }

      setIsVerifyStep(true);

    } catch (error: any) {
      setAuthError(getApiErrorMessage(error, 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async () => {
    try {
      setIsLoading(true);
      setAuthError('');

      const res = await axios.post(`${apiUrl}/auth/verify-email`, {
        email,
        otp
      });

      const data = res.data;
      if (data?.success === false) {
        throw new Error(getApiSuccessMessage(data, 'Invalid OTP'));
      }

      setIsVerifyStep(false);
      setIsSignUp(false);

    } catch (error: any) {
      setAuthError(getApiErrorMessage(error, 'Invalid OTP'));
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const handleResendOtp = async () => {
    try {
      setAuthError('');
      const res = await axios.post(`${apiUrl}/auth/resend-otp`, { email });
      const data = res.data;
      if (data?.success === false) {
        throw new Error(getApiSuccessMessage(data, 'Failed to resend OTP'));
      }
    } catch (error: any) {
      setAuthError(getApiErrorMessage(error, 'Try again after 10 minutes'));
    }
  };

  /* ================= LOGIN ================= */
  const normalizeRole = (role: string): UserRole => {
    const r = role.toLowerCase().trim()

    if (r.includes('admin')) return 'admin'
    if (r.includes('designer')) return 'designer'
    return 'client'
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setAuthError('')

      const res = await axios.post(
        `${apiUrl}/auth/login`,
        { email, password },
        { withCredentials: true }
      )

      const data = res.data;
      if (data?.success === false || !data?.token || !data?.user) {
        throw new Error(getApiSuccessMessage(data, 'Login failed'));
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

      navigate(getPostAuthPath(normalizedUser.role), { replace: true })
    } catch (error: any) {
      setAuthError(getApiErrorMessage(error, 'Login failed'))
    } finally {
      setIsLoading(false)
    }
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setAuthError('Please enter email and password');
      return;
    }

    setAuthError('');

    if (isVerifyStep) {
      await handleVerifyOtp();
      return;
    }

    if (isSignUp) {
      if (!firstName || !lastName) {
        setAuthError('Please enter first and last name');
        return;
      }
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  const handleGoogleLogin = () => {
    setAuthError('Google login integration will be implemented');
  };

  const handleForgotPassword = () => {
    setAuthError('Password recovery email will be sent');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[#111]" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#C4FE01]/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#C4FE01]/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="z-10 w-full max-w-6xl flex flex-col md:flex-row items-center gap-8 lg:gap-16">
        {/* LEFT */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Design<span className="text-[#C4FE01]">Jockey</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 mb-8">
            Your creative design platform and collaboration hub
          </p>
        </div>

        {/* CARD */}
        <div className="w-full md:w-1/2 max-w-md">
          <Card className="bg-[#1a1a1a]/80 backdrop-blur-xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold text-white">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-white/60">
                {teamInviteParam
                  ? 'Sign in with the invited email to join your team'
                  : isSignUp
                    ? 'Sign up to start creating amazing designs'
                    : 'Sign in to access your dashboard'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {authError && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                    {authError}
                  </p>
                )}

                {/* OTP UI (minimal addition) */}
                {isVerifyStep && (
                  <div className="space-y-2">
                    <Label className="text-white">Enter OTP</Label>
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="bg-[#222] border-white/10 text-white"
                    />
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-xs text-[#C4FE01]"
                      onClick={handleResendOtp}
                    >
                      Resend OTP
                    </Button>
                  </div>
                )}

                {/* 🔹 signup names */}
                {isSignUp && !isVerifyStep && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-white">First Name</Label>
                      <div className="relative">
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-[#222] border-white/10 pl-10 text-white"
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Last Name</Label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-[#222] border-white/10 text-white"
                      />
                    </div>
                  </>
                )}

                {/* EMAIL */}
                {!isVerifyStep && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-[#222] border-white/10 pl-10 text-white"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    </div>
                  </div>
                )}

                {/* PASSWORD */}
                {!isVerifyStep && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-white">
                        Password
                      </Label>
                      {!isSignUp && (
                        <Button
                          type="button"
                          variant="link"
                          className="px-0 text-xs text-[#C4FE01]"
                          onClick={handleForgotPassword}
                        >
                          Forgot password?
                        </Button>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={
                          isSignUp ? 'Create a strong password' : '••••••••'
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-[#222] border-white/10 pl-10 pr-10 text-white"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full aspect-square text-white/40 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* SUBMIT */}
                <Button
                  type="submit"
                  className="w-full bg-[#C4FE01] hover:bg-[#C4FE01]/90 text-white font-medium h-11 rounded-lg group"
                  disabled={isLoading}
                >
                  <span>
                    {isLoading
                      ? 'Processing...'
                      : isVerifyStep
                        ? 'Verify OTP'
                        : isSignUp
                          ? 'Create Account'
                          : 'Sign In'}
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>

              </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-white/10 px-6 py-4">
              <p className="text-sm text-white/60">
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 text-[#C4FE01]"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Sign in' : 'Create account'}
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;