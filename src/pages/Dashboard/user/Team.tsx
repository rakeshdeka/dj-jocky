import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Avatar, AvatarFallback } from '../../../components/dashboard/ui/avatar';
import { Button } from '../../../components/dashboard/ui/button';
import { Input } from '../../../components/dashboard/ui/input';
import { Label } from '../../../components/dashboard/ui/label';
import { Badge } from '../../../components/dashboard/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/dashboard/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/dashboard/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/dashboard/ui/table';
import type { RootState } from '../../../store/store';
import {
  acceptIncomingTeamInvite,
  cancelTeamInvite,
  declineIncomingTeamInvite,
  fetchIncomingTeamInvites,
  fetchTeam,
  getMemberDisplayName,
  getMemberInitials,
  getTeamErrorMessage,
  inviteTeamMember,
  isTeamOwner,
  leaveTeam,
  removeTeamMember,
  getMemberUserId,
  getTeamSeatsUsed,
  type IncomingTeamInvite,
  type TeamDetails,
  type TeamInvite,
  type TeamMember,
} from '../../../lib/team-api';

const formatDate = (value?: string) => {
  if (!value) return '—';
  try {
    return format(new Date(value), 'MMM d, yyyy');
  } catch {
    return '—';
  }
};

const Team = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [teamData, setTeamData] = useState<TeamDetails | null>(null);
  const [incomingInvites, setIncomingInvites] = useState<IncomingTeamInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actingInviteId, setActingInviteId] = useState<string | null>(null);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [inviteToCancel, setInviteToCancel] = useState<TeamInvite | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [isCancellingInvite, setIsCancellingInvite] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const loadPage = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setLoadError(null);

      const [teamResult, incomingResult] = await Promise.allSettled([
        fetchTeam(token),
        fetchIncomingTeamInvites(token),
      ]);

      if (teamResult.status === 'fulfilled') {
        setTeamData(teamResult.value);
      } else {
        setTeamData(null);
        if (incomingResult.status !== 'fulfilled' || incomingResult.value.length === 0) {
          setLoadError(getTeamErrorMessage(teamResult.reason, 'Failed to load team'));
        }
      }

      if (incomingResult.status === 'fulfilled') {
        setIncomingInvites(incomingResult.value);
      } else {
        setIncomingInvites([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleInvite = async () => {
    if (!token || !inviteEmail.trim()) return;

    try {
      setIsInviting(true);
      setInviteError(null);
      await inviteTeamMember(token, {
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
      });
      toast.success(`Invitation sent to ${inviteEmail.trim()}`);
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      setInviteError(null);
      await loadPage();
    } catch (error: unknown) {
      const message = getTeamErrorMessage(error, 'Failed to send invitation');
      setInviteError(message);
      toast.error(message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleInviteDialogChange = (open: boolean) => {
    setIsInviteOpen(open);
    if (!open) {
      setInviteError(null);
      setInviteEmail('');
      setInviteName('');
    }
  };

  const handleRemoveMember = async () => {
    if (!token || !memberToRemove) return;

    try {
      setIsRemovingMember(true);
      await removeTeamMember(token, memberToRemove._id);
      toast.success('Team member removed');
      setMemberToRemove(null);
      await loadPage();
    } catch (error: unknown) {
      toast.error(getTeamErrorMessage(error, 'Failed to remove member'));
    } finally {
      setIsRemovingMember(false);
    }
  };

  const handleCancelInvite = async () => {
    if (!token || !inviteToCancel) return;

    try {
      setIsCancellingInvite(true);
      await cancelTeamInvite(token, inviteToCancel._id);
      toast.success('Invitation cancelled');
      setInviteToCancel(null);
      await loadPage();
    } catch (error: unknown) {
      toast.error(getTeamErrorMessage(error, 'Failed to cancel invitation'));
    } finally {
      setIsCancellingInvite(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!token) return;

    try {
      setIsLeaving(true);
      await leaveTeam(token);
      toast.success('You left the team');
      setShowLeaveConfirm(false);
      await loadPage();
    } catch (error: unknown) {
      toast.error(getTeamErrorMessage(error, 'Failed to leave team'));
    } finally {
      setIsLeaving(false);
    }
  };

  const isOwner = teamData?.isOwner ?? false;
  const seatsUsed = teamData ? getTeamSeatsUsed(teamData) : 0;
  const maxMembers = teamData?.counts.maxMembers ?? 50;
  const canInvite = isOwner && seatsUsed < maxMembers;
  const currentUserMember = teamData?.members.find(
    (member) =>
      member.email?.toLowerCase() === user?.email?.toLowerCase() ||
      getMemberUserId(member) === user?.id,
  );
  const showLeaveAction = teamData?.isMember && !isOwner;

  const handleAcceptIncoming = async (invite: IncomingTeamInvite) => {
    if (!token) return;

    try {
      setActingInviteId(invite._id);
      const updatedTeam = await acceptIncomingTeamInvite(token, invite._id);
      setTeamData(updatedTeam);
      setIncomingInvites((prev) => prev.filter((item) => item._id !== invite._id));
      toast.success(`You joined ${invite.team_name}`);
      await loadPage();
    } catch (error: unknown) {
      toast.error(getTeamErrorMessage(error, 'Failed to accept invitation'));
    } finally {
      setActingInviteId(null);
    }
  };

  const handleDeclineIncoming = async (invite: IncomingTeamInvite) => {
    if (!token) return;

    try {
      setActingInviteId(invite._id);
      await declineIncomingTeamInvite(token, invite._id);
      setIncomingInvites((prev) => prev.filter((item) => item._id !== invite._id));
      toast.success('Invitation declined');
    } catch (error: unknown) {
      toast.error(getTeamErrorMessage(error, 'Failed to decline invitation'));
    } finally {
      setActingInviteId(null);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#C4FE01]" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Loading team...
          </p>
        </div>
      </MainLayout>
    );
  }

  if ((loadError || !teamData) && incomingInvites.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto py-24 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-sm text-muted-foreground">{loadError || 'Team not found'}</p>
          <Button variant="outline" onClick={loadPage}>Try again</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {incomingInvites.length > 0 && (
        <Card className="mb-6 border-[#C4FE01]/30 bg-[#C4FE01]/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold tracking-[0.15em] uppercase flex items-center gap-2">
              <Inbox className="h-4 w-4 text-[#C4FE01]" />
              Team invitations
            </CardTitle>
            <CardDescription>
              You have {incomingInvites.length} pending invitation
              {incomingInvites.length === 1 ? '' : 's'} to join a team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomingInvites.map((invite) => {
              const isActing = actingInviteId === invite._id;
              return (
                <div
                  key={invite._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 p-4"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-sm">{invite.team_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited by {invite.invited_by || invite.invited_by_email || 'team owner'}
                      {invite.invited_by_email && invite.invited_by
                        ? ` (${invite.invited_by_email})`
                        : ''}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Sent {formatDate(invite.created_at)}
                      {invite.expires_at ? ` · Expires ${formatDate(invite.expires_at)}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isActing}
                      onClick={() => handleDeclineIncoming(invite)}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      disabled={isActing}
                      onClick={() => handleAcceptIncoming(invite)}
                      className="bg-[#C4FE01] hover:bg-[#b2e600] text-black"
                    >
                      {isActing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Accept
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {!teamData ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Accept an invitation above to join a team and access shared briefs.
        </div>
      ) : (
      <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">TEAM</h1>
          <p className="text-muted-foreground text-sm">
            {isOwner
              ? 'Invite teammates to collaborate on briefs using your subscription.'
              : 'You have shared access to this account owner briefs and meetings.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isOwner && (
            <Button
              onClick={() => setIsInviteOpen(true)}
              disabled={!canInvite}
              className="bg-[#C4FE01] hover:bg-[#b2e600] text-black font-bold"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite member
            </Button>
          )}
          {showLeaveAction && (
            <Button variant="outline" onClick={() => setShowLeaveConfirm(true)}>
              <LogOut className="h-4 w-4 mr-2" />
              Leave team
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 bg-card/20 backdrop-blur-md border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold tracking-[0.15em] uppercase">
                  Members
                </CardTitle>
                <CardDescription>
                  {seatsUsed} of {maxMembers} member seats used
                  {teamData.counts.pendingInvites > 0
                    ? ` (${teamData.counts.pendingInvites} pending)`
                    : ''}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {teamData.team.name || 'Your team'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  {isOwner && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamData.members.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarFallback className="bg-[#C4FE01]/15 text-[#C4FE01] text-xs font-bold">
                            {getMemberInitials(member)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{getMemberDisplayName(member)}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {isTeamOwner(member) ? (
                        <Badge className="text-[10px] bg-[#C4FE01]/15 text-[#C4FE01] border-none">
                          <Crown className="h-3 w-3 mr-1" />
                          Owner
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Member</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {formatDate(member.joined_at || member.createdAt)}
                    </TableCell>
                    {isOwner && (
                      <TableCell className="text-right">
                        {!isTeamOwner(member) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setMemberToRemove(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/20 backdrop-blur-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold tracking-[0.2em] uppercase">
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>One team per account owner. Billing stays on the owner plan.</p>
              <p>Members can create briefs, review deliveries, chat, and book meetings.</p>
              <p>Invite links expire after 7 days by default.</p>
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="bg-card/20 backdrop-blur-md border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#C4FE01]" />
                  Pending invites
                </CardTitle>
                <CardDescription>
                  {teamData.counts.pendingInvites === 0
                    ? 'No outstanding invitations'
                    : `${teamData.counts.pendingInvites} waiting to accept`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {teamData.pendingInvites.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Invite a teammate by email to get started.</p>
                ) : (
                  teamData.pendingInvites.map((invite) => (
                    <div
                      key={invite._id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/10 p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{invite.email}</p>
                        {invite.name && (
                          <p className="text-xs text-muted-foreground">{invite.name}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Sent {formatDate(invite.invited_at || invite.createdAt)}
                          {invite.expires_at ? ` · Expires ${formatDate(invite.expires_at)}` : ''}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setInviteToCancel(invite)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {!isOwner && teamData.owner && (
            <Card className="bg-card/20 backdrop-blur-md border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#C4FE01]" />
                  Team owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-sm">{teamData.owner.name || 'Account owner'}</p>
                <p className="text-xs text-muted-foreground">{teamData.owner.email}</p>
                {currentUserMember && (
                  <p className="text-xs text-muted-foreground mt-3">
                    You joined {formatDate(currentUserMember.joined_at || currentUserMember.createdAt)}.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </>
      )}

      <Dialog open={isInviteOpen} onOpenChange={handleInviteDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>
              They will receive an email with a link to join as a client on your subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {inviteError && (
              <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{inviteError}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (inviteError) setInviteError(null);
                }}
                className={inviteError ? 'border-destructive/50' : undefined}
              />
              <p className="text-[11px] text-muted-foreground">
                The invitee must register or sign in as a client account with this email.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-name">Name (optional)</Label>
              <Input
                id="invite-name"
                placeholder="Alex Johnson"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)} disabled={isInviting}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail.trim()}
              className="bg-[#C4FE01] hover:bg-[#b2e600] text-black"
            >
              {isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(memberToRemove)} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove team member?</DialogTitle>
            <DialogDescription>
              {memberToRemove
                ? `${getMemberDisplayName(memberToRemove)} will lose access to shared briefs and meetings.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToRemove(null)} disabled={isRemovingMember}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isRemovingMember}>
              {isRemovingMember && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remove member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(inviteToCancel)} onOpenChange={(open) => !open && setInviteToCancel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel invitation?</DialogTitle>
            <DialogDescription>
              {inviteToCancel ? `The invite for ${inviteToCancel.email} will no longer work.` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteToCancel(null)} disabled={isCancellingInvite}>
              Keep invite
            </Button>
            <Button variant="destructive" onClick={handleCancelInvite} disabled={isCancellingInvite}>
              {isCancellingInvite && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cancel invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave this team?</DialogTitle>
            <DialogDescription>
              You will lose access to shared briefs, files, and meetings until invited again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveConfirm(false)} disabled={isLeaving}>
              Stay on team
            </Button>
            <Button variant="destructive" onClick={handleLeaveTeam} disabled={isLeaving}>
              {isLeaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Leave team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Team;
