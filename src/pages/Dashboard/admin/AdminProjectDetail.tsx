import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  Loader2,
  MessageSquare,
  UserPlus,
  Users,
} from 'lucide-react';

import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Button } from '../../../components/dashboard/ui/button';
import { Badge } from '../../../components/dashboard/ui/badge';
import BriefFilesPanel from '../../../components/dashboard/briefs/BriefFilesPanel';
import AssignProjectModal from '../../../components/dashboard/admin/modals/AssignProjectModal';
import { RootState } from '../../../store/store';
import {
  fetchBrief,
  formatBriefPriority,
  formatBriefStatus,
  type Brief,
} from '../../../lib/briefs-api';

const apiUrl = import.meta.env.VITE_API_URL;

const statusVariant = (status?: string) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'in_progress':
    case 'under_review':
      return 'secondary';
    case 'revision':
      return 'destructive';
    default:
      return 'outline';
  }
};

const priorityClass = (priority?: string) => {
  switch (priority) {
    case 'high':
      return 'border-red-500/40 text-red-400 bg-red-500/10';
    case 'low':
      return 'border-blue-500/40 text-blue-400 bg-blue-500/10';
    default:
      return 'border-[#c5fb00]/40 text-[#c5fb00] bg-[#c5fb00]/10';
  }
};

const getServiceName = (service?: Brief['service_id']) => {
  if (!service) return '—';
  if (typeof service === 'string') return service;
  return service.name || '—';
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  try {
    return format(new Date(value), 'MMM d, yyyy');
  } catch {
    return '—';
  }
};

const AdminProjectDetail = () => {
  const { briefId } = useParams<{ briefId: string }>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const [brief, setBrief] = useState<Brief | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const loadBrief = useCallback(async () => {
    if (!token || !briefId) return;

    try {
      setIsLoading(true);
      setLoadError(null);
      setBrief(await fetchBrief(token, briefId));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load brief details';
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, briefId]);

  useEffect(() => {
    loadBrief();
  }, [loadBrief]);

  const handleAssignProject = async (projectId: string, designerId: string) => {
    try {
      const response = await axios.patch(
        `${apiUrl}/admin/briefs/${projectId}/assign-designer`,
        { designer_id: designerId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        toast.success('Designer assigned successfully');
        setIsAssignModalOpen(false);
        await loadBrief();
      }
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Assignment failed';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#c5fb00]" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Loading brief details...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (loadError || !brief) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto py-24 text-center space-y-4">
          <p className="text-sm text-muted-foreground">{loadError || 'Brief not found'}</p>
          <Button variant="outline" onClick={() => navigate('/admin/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <Link
          to="/admin/projects"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-[#c5fb00] transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5fb00] mb-1">
              {getServiceName(brief.service_id)}
            </p>
            <h1 className="text-xl font-bold tracking-tight truncate">{brief.title}</h1>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">ID: {brief._id}</p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/projects/${brief._id}/messages`)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
            <Button
              size="sm"
              className="bg-[#c5fb00] hover:bg-[#b0e000] text-black font-bold"
              onClick={() => setIsAssignModalOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {brief.designer_id ? 'Change Designer' : 'Assign Designer'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="bg-card/20 backdrop-blur-md border-border overflow-hidden">
            <div className="aspect-[21/9] bg-muted/30 overflow-hidden border-b border-border/40">
              {brief.thumbnail_url ? (
                <img
                  src={brief.thumbnail_url}
                  alt={brief.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#c5fb00]/20 to-transparent">
                  <span className="text-6xl font-bold text-[#c5fb00]/40">
                    {brief.title?.charAt(0) || 'B'}
                  </span>
                </div>
              )}
            </div>

            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(brief.status)} className="capitalize text-[10px]">
                  {formatBriefStatus(brief.status)}
                </Badge>
                <Badge
                  variant="outline"
                  className={`capitalize text-[10px] ${priorityClass(brief.priority)}`}
                >
                  {formatBriefPriority(brief.priority)} priority
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Description
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {brief.description?.trim() || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-[#c5fb00] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      Delivery Date
                    </p>
                    <p className="text-sm font-medium">{formatDate(brief.delivery_date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-[#c5fb00] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      Created
                    </p>
                    <p className="text-sm font-medium">{formatDate(brief.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/20 backdrop-blur-md border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold tracking-[0.15em] uppercase">
                Project Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BriefFilesPanel
                referenceFiles={brief.reference_files || []}
                deliveryFiles={brief.delivery_files || []}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/20 backdrop-blur-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                <Users className="h-4 w-4 text-[#c5fb00]" />
                People
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg border border-border/60 bg-secondary/10">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                  Client
                </p>
                <p className="text-sm font-semibold">{brief.client_id?.name || 'Unassigned'}</p>
                {brief.client_id?.email && (
                  <p className="text-xs text-muted-foreground mt-0.5">{brief.client_id.email}</p>
                )}
              </div>

              <div className="p-3 rounded-lg border border-border/60 bg-secondary/10">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                  Designer
                </p>
                <p className="text-sm font-semibold">
                  {brief.designer_id?.name || (
                    <span className="text-muted-foreground italic">Not assigned</span>
                  )}
                </p>
                {brief.designer_id?.email && (
                  <p className="text-xs text-muted-foreground mt-0.5">{brief.designer_id.email}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/20 backdrop-blur-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold tracking-[0.2em] uppercase">
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Last updated</span>
                <span className="font-medium text-right">{formatDate(brief.updatedAt)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Reference files</span>
                <span className="font-medium">{brief.reference_files?.length ?? 0}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Delivery files</span>
                <span className="font-medium">{brief.delivery_files?.length ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AssignProjectModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        project={brief}
        onAssign={handleAssignProject}
      />
    </MainLayout>
  );
};

export default AdminProjectDetail;
