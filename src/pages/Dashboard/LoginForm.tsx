
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../../components/dashboard/ui/button';
import { Input } from '../../components/dashboard/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/dashboard/ui/card';
import { Label } from '../../components/dashboard/ui/label';
import { Checkbox } from '../../components/dashboard/ui/checkbox';
import { Globe, Eye, EyeOff, ArrowLeft, ShieldCheck, Mail, Lock, Apple } from 'lucide-react';
import { toast } from 'sonner';

type UserRole = 'client' | 'designer' | 'admin';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = (location.state?.role as UserRole) || 'client';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(role === 'admin' || role === 'designer');
  
  useEffect(() => {
    // If no role was passed, redirect back to login selection
    if (!location.state?.role) {
      navigate('/login');
    }
  }, [location.state, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate authentication (replace with actual auth logic)
    setTimeout(() => {
      setIsLoading(false);
      
      if (twoFactorEnabled && !show2FA) {
        setShow2FA(true);
        toast.info('2FA verification required');
        return;
      }
      
      if (show2FA && !verificationCode) {
        toast.error('Please enter verification code');
        return;
      }
      
      if (show2FA && verificationCode !== '123456') { // Replace with actual verification
        toast.error('Invalid verification code');
        return;
      }
      
      // Store user role and auth state in localStorage (should use proper auth mechanism)
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', role);
      
      toast.success(`Logged in successfully as ${role}`);
      
      // Redirect based on role
      if (role === 'client') {
        navigate('/');
      } else if (role === 'designer') {
        navigate('/designer/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }, 1500);
  };
  
  const handleGoogleLogin = () => {
    toast.info('Google login integration will be implemented');
  };
  
  const handleAppleLogin = () => {
    toast.info('Apple login integration will be implemented');
  };
  
  const handleForgotPassword = () => {
    toast.info('Password recovery email will be sent');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#111] p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[#111]" />
        
        {/* Blue gradient blur */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#3457f1]/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#3457f1]/10 blur-[100px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
      
      <div className="z-10 w-full max-w-md">
        <Button 
          variant="ghost" 
          className="mb-6 text-white hover:text-white/80 hover:bg-white/5"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to selection
        </Button>
        
        <Card className="bg-[#1a1a1a]/80 backdrop-blur-xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-white">
              {role.charAt(0).toUpperCase() + role.slice(1)} Login
            </CardTitle>
            <CardDescription className="text-white/60">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {!show2FA ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-[#222] border-white/10 focus:border-[#3457f1] focus:ring-[#3457f1]/20 pl-10 text-white"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-white">Password</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="px-0 text-xs text-[#3457f1] hover:text-[#3457f1]/80"
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-[#222] border-white/10 focus:border-[#3457f1] focus:ring-[#3457f1]/20 pl-10 pr-10 text-white"
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
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe} 
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-white/20 data-[state=checked]:bg-[#3457f1] data-[state=checked]:border-[#3457f1]"
                    />
                    <Label htmlFor="remember" className="text-sm text-white/70">Remember me for 30 days</Label>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#3457f1]/20 flex items-center justify-center">
                      <ShieldCheck className="h-8 w-8 text-[#3457f1]" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-white/60 mt-1">
                      Enter the 6-digit code sent to your device
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verification" className="text-white">Verification Code</Label>
                    <Input
                      id="verification"
                      type="text"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      autoComplete="one-time-code"
                      className="bg-[#222] border-white/10 focus:border-[#3457f1] focus:ring-[#3457f1]/20 text-center text-lg tracking-widest text-white"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="w-full text-xs text-[#3457f1] hover:text-[#3457f1]/80"
                    onClick={() => setShow2FA(false)}
                  >
                    Back to login
                  </Button>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-[#3457f1] hover:bg-[#3457f1]/90 text-white font-medium h-11 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : show2FA ? "Verify" : "Log in"}
              </Button>
              
              {!show2FA && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#1a1a1a] px-2 text-white/40">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5 hover:border-white/20"
                      onClick={handleGoogleLogin}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" className="mr-2">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                          <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                          <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                          <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                          <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                        </g>
                      </svg>
                      <span>Google</span>
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5 hover:border-white/20"
                      onClick={handleAppleLogin}
                    >
                      <Apple className="mr-2 h-5 w-5" />
                      <span>Apple</span>
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
          
          {role === 'admin' && !show2FA && (
            <CardFooter className="flex justify-center border-t border-white/10 px-6 py-4">
              <p className="text-xs text-white/60">
                Admin login requires two-factor authentication
              </p>
            </CardFooter>
          )}
          
          {role === 'designer' && !show2FA && (
            <CardFooter className="flex justify-center border-t border-white/10 px-6 py-4">
              <p className="text-xs text-white/60">
                Designers can enable two-factor authentication in settings
              </p>
            </CardFooter>
          )}
        </Card>
        
        <div className="mt-6 text-center text-white/40 text-sm">
          <p>© 2023 DesignJockey. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
