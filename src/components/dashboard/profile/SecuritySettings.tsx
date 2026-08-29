
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Eye, EyeOff, Lock, CheckSquare, Laptop, Smartphone, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import type { RootState } from '../../../store/store';
import {
  changeAuthPassword,
  fetchAuthSessions,
  logoutAllAuthSessions,
  logoutAuthSession,
  validateNewPassword,
  type AuthSession,
} from '../../../lib/auth-security-api';

const formatSessionTime = (value?: string) => {
  if (!value) return 'Unknown';
  const parsed = parseISO(value);
  if (isValid(parsed)) {
    return formatDistanceToNow(parsed, { addSuffix: true });
  }
  const fallback = new Date(value);
  return isValid(fallback) ? formatDistanceToNow(fallback, { addSuffix: true }) : value;
};

const SecuritySettings = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isLogoutAllDevices, setIsLogoutAllDevices] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [loggingOutSessionId, setLoggingOutSessionId] = useState<string | null>(null);

  const [loginSessions, setLoginSessions] = useState<AuthSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  const loadSessions = useCallback(async () => {
    if (!token) {
      setLoginSessions([]);
      setIsLoadingSessions(false);
      return;
    }

    try {
      setIsLoadingSessions(true);
      setLoginSessions(await fetchAuthSessions(token));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to load sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  }, [token]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    if (!token) return toast.error('Login required');

    const validationError = validateNewPassword(
      passwordData.currentPassword,
      passwordData.newPassword,
      passwordData.confirmPassword,
    );
    if (validationError) return toast.error(validationError);

    try {
      setIsSavingPassword(true);
      const data = await changeAuthPassword(
        token,
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      toast.success(data?.message || 'Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Failed to change password',
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const logoutDevice = async (sessionId: string) => {
    if (!token) return;

    try {
      setLoggingOutSessionId(sessionId);
      const data = await logoutAuthSession(token, sessionId);
      toast.success(data?.message || 'Device logged out successfully');
      await loadSessions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to log out device');
    } finally {
      setLoggingOutSessionId(null);
    }
  };

  const logoutAllDevices = async () => {
    if (!token) return;

    try {
      setIsLoggingOutAll(true);
      const data = await logoutAllAuthSessions(token);
      toast.success(data?.message || 'Logged out from all other devices');
      setIsLogoutAllDevices(false);
      await loadSessions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to log out devices');
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const otherSessionsCount = loginSessions.filter((session) => !session.isCurrent).length;

  return (
    <div>
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold border-b border-border pb-4">Security Settings</h2>

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-secondary/30 border-border">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#C4FE01]/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-[#C4FE01]" />
                </div>
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setIsChangingPassword(true)}>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-secondary/30 border-border">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="font-medium text-lg">Active Sessions</h3>
              <Button
                variant="outline"
                onClick={() => setIsLogoutAllDevices(true)}
                disabled={isLoadingSessions || otherSessionsCount === 0 || isLoggingOutAll}
              >
                {isLoggingOutAll ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Logout All Other Devices
              </Button>
            </div>

            {isLoadingSessions ? (
              <div className="py-8 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[#C4FE01]" />
              </div>
            ) : loginSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No active sessions found.</p>
            ) : (
              <div className="space-y-4">
                {loginSessions.map((session) => {
                  const isMobile =
                    /iphone|android|mobile|ios/i.test(session.device) ||
                    /iphone|android|mobile|ios/i.test(session.platform || '');

                  return (
                    <div
                      key={session._id}
                      className={`p-4 rounded-lg flex items-center justify-between border gap-4 ${
                        session.isCurrent
                          ? 'bg-[#C4FE01]/10 border-[#C4FE01]/30'
                          : 'bg-background/50 border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          {isMobile ? (
                            <Smartphone className="h-5 w-5" />
                          ) : (
                            <Laptop className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{session.device}</p>
                            {session.platform && (
                              <span className="text-xs text-muted-foreground">({session.platform})</span>
                            )}
                            {session.isCurrent && (
                              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <p className="text-xs text-muted-foreground">{session.location}</p>
                            <p className="text-xs text-muted-foreground">IP: {session.ip}</p>
                            <p className="text-xs text-muted-foreground">
                              Active {formatSessionTime(session.lastActiveAt || session.loginAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => logoutDevice(session._id)}
                          disabled={loggingOutSessionId === session._id}
                          className="shrink-0"
                        >
                          {loggingOutSessionId === session._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <LogOut className="h-4 w-4 mr-2" />
                              Logout
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={handleInputChange}
                  disabled={isSavingPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                disabled={isSavingPassword}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                disabled={isSavingPassword}
              />
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium">Password Requirements:</p>
              <ul className="space-y-1">
                <li className="text-xs flex items-center gap-2 text-muted-foreground">
                  <CheckSquare className="h-3 w-3 text-green-500" />
                  8–128 characters
                </li>
                <li className="text-xs flex items-center gap-2 text-muted-foreground">
                  <CheckSquare className="h-3 w-3 text-green-500" />
                  At least one letter and one number
                </li>
                <li className="text-xs flex items-center gap-2 text-muted-foreground">
                  <CheckSquare className="h-3 w-3 text-green-500" />
                  Must be different from your current password
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangingPassword(false)} disabled={isSavingPassword}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isSavingPassword}>
              {isSavingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLogoutAllDevices} onOpenChange={setIsLogoutAllDevices}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout From All Other Devices</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>
              Are you sure you want to log out from all other devices? You will remain logged in on your current device.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutAllDevices(false)} disabled={isLoggingOutAll}>
              Cancel
            </Button>
            <Button variant="default" onClick={logoutAllDevices} disabled={isLoggingOutAll}>
              {isLoggingOutAll && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Log Out All Devices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecuritySettings;
