
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Calendar, Clock, Users, MessageSquare } from 'lucide-react';
import { Meeting } from '../../../types/meeting';

interface MeetingCardProps {
  meeting: Meeting;
  onClick: () => void;
  expanded?: boolean;
  isSelected?: boolean;
}

const statusVariants = {
  pending: { variant: 'warning' as const, label: 'Pending Approval' },
  approved: { variant: 'success' as const, label: 'Approved' },
  declined: { variant: 'destructive' as const, label: 'Declined' },
  rescheduled: { variant: 'info' as const, label: 'Rescheduled' },
  upcoming: { variant: 'info' as const, label: 'Upcoming' },
  completed: { variant: 'secondary' as const, label: 'Completed' }
};

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onClick, expanded = false, isSelected = false }) => {
  const getStatusInfo = () => {
    if (meeting.status in statusVariants) {
      return statusVariants[meeting.status as keyof typeof statusVariants];
    }
    return { variant: 'secondary' as const, label: 'Unknown' };
  };
  
  const { variant, label } = getStatusInfo();
  
  return (
    <Card 
      className={`p-3 cursor-pointer hover:border-primary transition-all ${isSelected ? 'border-primary' : ''} ${expanded ? 'h-full' : ''}`} 
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium">{meeting.projectName || meeting.title}</h4>
            <p className="text-sm text-muted-foreground">{meeting.projectType || 'Meeting'}</p>
          </div>
          <Badge variant={variant}>{label}</Badge>
        </div>
        
        <div className="space-y-2 mt-2 flex-grow">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 opacity-70" />
            <span>{format(new Date(meeting.date), 'MMMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 opacity-70" />
            <span>{meeting.startTime || meeting.time || 'TBD'}{meeting.endTime ? ` - ${meeting.endTime}` : ''}</span>
          </div>
          
          {expanded && (
            <>
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 opacity-70" />
                <span>
                  {meeting.requestedBy ? `Requested by ${meeting.requestedBy.name}` : 
                   meeting.participants ? `Participants: ${meeting.participants.join(', ')}` : 'No participants'}
                </span>
              </div>
              
              {(meeting.agenda || meeting.description) && (
                <div className="flex items-start text-sm">
                  <MessageSquare className="h-4 w-4 mr-2 opacity-70 mt-0.5" />
                  <p className="line-clamp-2">{meeting.agenda || meeting.description}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MeetingCard;
