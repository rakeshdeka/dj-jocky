import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  MessageSquare,
  Check,
  X,
  CalendarClock,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { useToast } from '../../../hooks/use-toast';

import { Meeting, MeetingStatus } from '../../../types/meeting';

interface MeetingDetailViewProps {
  meeting: Meeting;
  onStatusChange?: (meetingId: string, status: MeetingStatus, reason?: string) => void;
  onClose: () => void;
  onApprove?: (meetingId: string) => void;
  onDecline?: (meetingId: string) => void;
  onReschedule?: (meetingId: string) => void;
  onJoin?: (meetingId: string) => void;
}

const statusBadgeVariants = {
  pending: { variant: 'warning' as const, label: 'Pending Approval' },
  approved: { variant: 'success' as const, label: 'Approved' },
  declined: { variant: 'destructive' as const, label: 'Declined' },
  rescheduled: { variant: 'info' as const, label: 'Rescheduled' },
  upcoming: { variant: 'info' as const, label: 'Upcoming' },
  completed: { variant: 'secondary' as const, label: 'Completed' },
};

const MeetingDetailView: React.FC<MeetingDetailViewProps> = ({
  meeting,
  onStatusChange,
  onClose,
  onApprove,
  onDecline,
  onReschedule,
  onJoin,
}) => {
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState(meeting.declineReason || '');
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);

  const { toast } = useToast();

  const handleApprove = () => {
    if (onStatusChange) {
      onStatusChange(meeting.id, 'approved');
    } else if (onApprove) {
      onApprove(meeting.id);
    }
  };

  const handleDecline = () => {
    if (declineReason.trim()) {
      if (onStatusChange) {
        onStatusChange(meeting.id, 'declined', declineReason);
      } else if (onDecline) {
        onDecline(meeting.id);
      }
      setShowDeclineDialog(false);
    } else {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for declining the meeting',
        variant: 'destructive',
      });
    }
  };

  const handleJoinDiscord = () => {
    if (meeting.discordLink) {
      window.open(meeting.discordLink, '_blank');
      toast({
        title: 'Joining Meeting',
        description: 'Opening Discord link in a new tab',
      });
    } else if (onJoin) {
      onJoin(meeting.id);
    }
  };

  const getStatusInfo = () => {
    if (meeting.status in statusBadgeVariants) {
      return statusBadgeVariants[meeting.status as keyof typeof statusBadgeVariants];
    }
    return { variant: 'secondary' as const, label: 'Unknown' };
  };

  const { variant, label } = getStatusInfo();
  const getMeetingTitle = () => meeting.projectName || meeting.title || 'Meeting';
  const getMeetingType = () => meeting.projectType || 'Project';

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader className="pb-2">
            <div className="flex justify-between items-center">
              <DialogTitle>{getMeetingTitle()}</DialogTitle>
              <Badge variant={variant} className="ml-2">
                {label}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">{getMeetingType()}</div>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Date</div>
                  <div>{format(new Date(meeting.date), 'MMMM d, yyyy')}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Time</div>
                  <div>
                    {meeting.startTime || meeting.time || 'TBD'}
                    {meeting.endTime ? ` - ${meeting.endTime}` : ''}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {(meeting.requestedBy || meeting.participants) && (
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">
                    {meeting.requestedBy ? 'Requested By' : 'Participants'}
                  </div>
                  <div>
                    {meeting.requestedBy
                      ? meeting.requestedBy.name
                      : meeting.participants?.join(', ') ?? 'No participants'}
                  </div>
                </div>
              </div>
            )}

            {(meeting.agenda || meeting.description) && (
              <div className="flex items-start">
                <MessageSquare className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Agenda</div>
                  <div className="mt-1">{meeting.agenda || meeting.description}</div>
                </div>
              </div>
            )}

            {meeting.status === 'declined' && meeting.declineReason && (
              <div className="bg-destructive/10 p-3 rounded-md">
                <div className="text-sm font-medium">Decline Reason</div>
                <div className="mt-1">{meeting.declineReason}</div>
              </div>
            )}

            {meeting.status === 'approved' && meeting.discordLink && (
              <div className="bg-primary/10 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Discord Meeting Link
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Click the button to join the meeting
                    </div>
                  </div>
                  <Button size="sm" onClick={handleJoinDiscord}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                </div>
              </div>
            )}
          </div>

          {meeting.status === 'pending' && (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                className="sm:flex-1"
                onClick={() => setShowRescheduleDialog(true)}
              >
                <CalendarClock className="h-4 w-4 mr-2" />
                Request Reschedule
              </Button>
              <Button
                variant="destructive"
                className="sm:flex-1"
                onClick={() => setShowDeclineDialog(true)}
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button className="sm:flex-1" onClick={handleApprove}>
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decline Reason Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Meeting</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Provide a reason for declining
            </label>
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Unavailable at this time..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDecline}>
              Decline Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Placeholder */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Reschedule</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <CalendarClock className="h-16 w-16 mx-auto mb-3 text-muted-foreground/50" />
            <p>The reschedule feature will be implemented in the next update.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowRescheduleDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MeetingDetailView;
