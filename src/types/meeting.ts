
export type MeetingStatus = 'pending' | 'approved' | 'declined' | 'rescheduled' | 'upcoming' | 'completed';

export interface Meeting {
  id: string;
  projectId?: string;
  projectName?: string;
  projectType?: string;
  title?: string;
  description?: string;
  requestedBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants?: string[];
  date: Date;
  time?: string;
  startTime?: string;
  endTime?: string;
  agenda?: string;
  status: MeetingStatus;
  meetingLink?: string;
  declineReason?: string;
  createdAt?: string;
}
