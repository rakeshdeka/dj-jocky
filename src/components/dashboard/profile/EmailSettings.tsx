import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Mail, AlertCircle, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

const EmailSettings = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isGoogleManaged] = useState(false); // ✅ ALWAYS FALSE NOW
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  /* ================= GET PROFILE ================= */
  useEffect(() => {
    const fetchEmail = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`${apiUrl}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const user = res.data.user;
        setEmail(user.email || '');

      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load email');
      }
    };

    fetchEmail();
  }, [token, apiUrl]);

  /* ================= CHANGE EMAIL ================= */
  const handleEmailChange = () => {
    if (!newEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    setIsDialogOpen(true);
  };

  /* ================= VERIFY EMAIL ================= */
  const handleVerification = () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsVerifying(true);

    // 👉 replace with real API later
    setTimeout(() => {
      setIsVerifying(false);
      setIsDialogOpen(false);
      setEmail(newEmail);
      setNewEmail('');
      toast.success('Email updated successfully');
    }, 1500);
  };

  return (
    <div>
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold border-b border-border pb-4">
          Email Settings
        </h2>

        <Card className="bg-secondary/30 border-border overflow-hidden">
          <CardContent className="p-6 space-y-6">

            {/* CURRENT EMAIL */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#C4FE01]/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#C4FE01]/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-[#C4FE01]" />
                </div>
                <div>
                  <p className="font-medium">{email}</p>
                  <p className="text-sm text-muted-foreground">
                    Current Email Address
                  </p>
                </div>
              </div>

              {/* ✅ VERIFIED BADGE */}
              <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Verified</span>
              </div>
            </div>

            {/* ✅ EMAIL CHANGE UI ENABLED */}
            {/* <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">New Email Address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  className="bg-background/50"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleEmailChange} disabled={!newEmail}>
                  Update Email
                </Button>
              </div>
            </div> */}

            {/* ❌ GOOGLE WARNING REMOVED */}

          </CardContent>
        </Card>
      </div>

      {/* VERIFY DIALOG */}
      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify New Email</DialogTitle>
            <DialogDescription>
              We've sent a verification code to {newEmail}. Please enter the code below to confirm your new email address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerification} disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default EmailSettings;