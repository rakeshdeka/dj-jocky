import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Button } from '../../../components/dashboard/ui/button';
import { toast } from 'sonner';
import ProjectList, { type Project, type ProjectStatus } from '../../../components/dashboard/designer/ProjectList';
import DesignerStats from '../../../components/dashboard/designer/DesignerStats';
import { Calendar, Clock, ArrowUpRight, Loader2 } from 'lucide-react';
import type { RootState } from '../../../store/store';
import {
  fetchDesignerDashboard,
  type DesignerBrief,
  type DesignerBriefStatus,
  type DesignerMeeting,
} from '../../../lib/designer-api';

const mapStatus = (status: DesignerBriefStatus): ProjectStatus => {
  switch (status) {
    case 'in_progress':
    case 'pending_admin_review':
      return 'in-progress';
    case 'under_review':
    case 'revision':
      return 'review';
    case 'completed':
      return 'completed';
    default:
      return 'pending';
  }
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatMeetingDateTime = (date: string, time: string) => {
  const meetingDate = new Date(`${date}T${time}`);
  if (Number.isNaN(meetingDate.getTime())) {
    return `${date} at ${time}`;
  }
  return meetingDate.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const mapProject = (item: DesignerBrief): Project => ({
  id: item._id,
  name: item.title,
  client: item.client_id?.name || 'Unknown client',
  clientId: item.client_id?._id || '',
  status: mapStatus(item.status),
  deadline: item.delivery_date || item.updatedAt || '',
  progress: 0,
  type: item.service_id?.name || 'Design',
  priority: item.priority,
  unreadMessages: 0,
  lastUpdate: item.updatedAt ? formatRelativeTime(item.updatedAt) : '',
  thumbnail: '',
  tasks: [],
});

const DesignerDashboard = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<DesignerMeeting[]>([]);
  const [counts, setCounts] = useState({
    assigned: 0,
    in_progress: 0,
    pending_admin_review: 0,
    under_review: 0,
    revision: 0,
    completed: 0,
    active: 0,
    total: 0,
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await fetchDesignerDashboard(token);
      setCounts(data.counts);
      setProjects((data.new_projects || []).map(mapProject));
      setMeetings(data.new_meetings || []);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    navigate('/designer/briefs');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6 space-y-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">DASHBOARD</h1>
            <p className="text-muted-foreground text-sm">
              Brief counts, recent projects, and upcoming meetings
            </p>
          </div>
        </div>
      </div>

      <DesignerStats
        inProgressCount={counts.in_progress}
        reviewCount={counts.pending_admin_review + counts.under_review}
        completedCount={counts.completed}
        unreadMessagesCount={counts.active}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        {[
          { label: 'Assigned', value: counts.assigned },
          { label: 'Admin Review', value: counts.pending_admin_review },
          { label: 'Client Review', value: counts.under_review },
          { label: 'Revision', value: counts.revision },
          { label: 'Active', value: counts.active },
          { label: 'Total', value: counts.total },
        ].map((item) => (
          <Card key={item.label} className="bg-secondary/20 border-border">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 font-sans">
        <div className="lg:col-span-1 space-y-6">
          <ProjectList
            projects={projects}
            onSelectProject={handleProjectSelect}
            selectedProjectId={selectedProject?.id}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Meetings</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/designer/meetings')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
              <CardDescription>Latest 5 meetings from your dashboard feed</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-4">
                {meetings.length > 0 ? (
                  meetings.map((meeting) => (
                    <div
                      key={meeting._id}
                      className="p-3 rounded-md border border-border bg-background/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 text-blue-500 h-10 w-10 rounded-full flex items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {meeting.agenda || `${meeting.meeting_type} meeting`}
                            {meeting.client_id?.name ? ` — ${meeting.client_id.name}` : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatMeetingDateTime(meeting.date, meeting.time)}
                          </p>
                        </div>
                        <Button
                          className="ml-auto shrink-0"
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/designer/meetings')}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-md border border-border bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted text-muted-foreground h-10 w-10 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">No upcoming meetings</p>
                        <p className="text-sm text-muted-foreground">Your schedule is clear for now</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DesignerDashboard;
