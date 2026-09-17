import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, Users, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/dashboard/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/dashboard/ui/card';
import { Badge } from '../../../components/dashboard/ui/badge';
import type { RootState } from '../../../store/store';
import {
  acceptTeamInvite,
  getTeamErrorMessage,
  previewTeamInvite,
  type TeamInvitePreview,
} from '../../../lib/team-api';

const PENDING_INVITE_KEY = 'pendingTeamInvite';

export const storePendingTeamInvite = (token: string) => {
  sessionStorage.setItem(PENDING_INVITE_KEY, token);
};

export const consumePendingTeamInvite = () => {
  const token = sessionStorage.getItem(PENDING_INVITE_KEY);
  if (token) sessionStorage.removeItem(PENDING_INVITE_KEY);
  return token;
};

const TeamJoin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token')?.trim() || '';

  const { token, user, isHydrated } = useSelector((state: RootState) => state.auth);
  const isClient = user?.role === 'client';

  const [preview, setPreview] = useState<TeamInvitePreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (inviteToken) storePendingTeamInvite(inviteToken);
  }, [inviteToken]);

  const loadPreview = useCallback(async () => {
    if (!inviteToken) {
      setPreviewError('This invite link is missing a token.');
      setIsLoadingPreview(false);
      return;
    }

    try {
      setIsLoadingPreview(true);
      setPreviewError(null);
      setPreview(await previewTeamInvite(inviteToken));
    } catch (error: unknown) {
      setPreviewError(getTeamErrorMessage(error, 'This invite link is invalid or has expired.'));
      setPreview(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [inviteToken]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const handleAccept = async () => {
    if (!token || !inviteToken) return;

    try {
      setIsAccepting(true);
      await acceptTeamInvite(token, inviteToken);
      consumePendingTeamInvite();
      setAccepted(true);
      toast.success('You joined the team');
      window.setTimeout(() => navigate('/client/briefs', { replace: true }), 1200);
    } catch (error: unknown) {
      toast.error(getTeamErrorMessage(error, 'Failed to accept invite'));
    } finally {
      setIsAccepting(false);
    }
  };

  const loginHref = `/login?teamInvite=${encodeURIComponent(inviteToken)}`;
  const registerHref = `/login?teamInvite=${encodeURIComponent(inviteToken)}&signup=1`;

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4FE01]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#C4FE01]/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#C4FE01]/10 blur-[100px]" />
      </div>

      <Card className="relative z-10 w-full max-w-lg bg-[#1a1a1a]/90 backdrop-blur-xl border-white/10">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#C4FE01]/15 flex items-center justify-center">
            {accepted ? (
              <CheckCircle2 className="h-6 w-6 text-[#C4FE01]" />
            ) : (
              <Users className="h-6 w-6 text-[#C4FE01]" />
            )}
          </div>
          <CardTitle className="text-2xl text-white">
            {accepted ? 'Welcome to the team' : 'Team invitation'}
          </CardTitle>
          <CardDescription className="text-white/60">
            {accepted
              ? 'Redirecting you to shared briefs and projects...'
              : 'Accept to collaborate on briefs using the account owner subscription.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {isLoadingPreview ? (
            <div className="flex flex-col items-center gap-3 py-8 text-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01]" />
              <p className="text-sm">Loading invite details...</p>
            </div>
          ) : previewError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {previewError}
            </div>
          ) : preview ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
              {preview.teamName && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Team</p>
                  <p className="text-white font-medium">{preview.teamName}</p>
                </div>
              )}
              {(preview.ownerName || preview.ownerEmail) && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Invited by</p>
                  <p className="text-white font-medium">{preview.ownerName || preview.ownerEmail}</p>
                  {preview.ownerEmail && preview.ownerName && (
                    <p className="text-sm text-white/60">{preview.ownerEmail}</p>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Mail className="h-4 w-4 text-[#C4FE01]" />
                <span>{preview.email}</span>
              </div>
              {preview.expiresAt && (
                <Badge variant="outline" className="text-[10px] border-white/20 text-white/70">
                  Expires {format(new Date(preview.expiresAt), 'MMM d, yyyy')}
                </Badge>
              )}
            </div>
          ) : null}

          {!accepted && !previewError && preview && (
            <>
              {!token ? (
                <div className="space-y-3">
                  <p className="text-sm text-white/70 text-center">
                    Sign in or create a client account with{' '}
                    <span className="text-white font-medium">{preview.email}</span> to join.
                  </p>
                  <Button asChild className="w-full bg-[#C4FE01] hover:bg-[#b2e600] text-black font-bold">
                    <Link to={loginHref}>
                      Sign in to accept
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    <Link to={registerHref}>Create client account</Link>
                  </Button>
                </div>
              ) : !isClient ? (
                <p className="text-sm text-amber-300 text-center">
                  Team invites are for client accounts. Please sign in with a client profile.
                </p>
              ) : user.email.toLowerCase() !== preview.email.toLowerCase() ? (
                <div className="space-y-3 text-center">
                  <p className="text-sm text-amber-300">
                    This invite was sent to <strong>{preview.email}</strong>, but you are signed in as{' '}
                    <strong>{user.email}</strong>.
                  </p>
                  <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Link to={loginHref}>Switch account</Link>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="w-full bg-[#C4FE01] hover:bg-[#b2e600] text-black font-bold"
                >
                  {isAccepting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Accept invitation
                </Button>
              )}
            </>
          )}

          {accepted && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#C4FE01]" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamJoin;
