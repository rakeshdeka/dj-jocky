import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  Edit2,
  Loader2,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

import MainLayout from '../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/dashboard/ui/card';
import { Button } from '../../components/dashboard/ui/button';
import { Badge } from '../../components/dashboard/ui/badge';
import BriefFilesPanel from '../../components/dashboard/briefs/BriefFilesPanel';
import ClientDeliveryReviewPanel from '../../components/dashboard/briefs/ClientDeliveryReviewPanel';
import DesignerBriefActions from '../../components/dashboard/designer/DesignerBriefActions';
import DesignerFeedbackNotes from '../../components/dashboard/designer/DesignerFeedbackNotes';
import SubmitWorkSheet from '../../components/dashboard/designer/SubmitWorkSheet';
import SubmitFinalDeliverySheet from '../../components/dashboard/designer/SubmitFinalDeliverySheet';
import { RootState } from '../../store/store';
import {
  canEditBrief,
  canReviewBrief,
  fetchBrief,
  formatBriefPriority,
  formatBriefStatus,
  getClientStatusMessage,
  getDesignerFeedbackNotes,
  isAwaitingFinalDelivery,
  type Brief,
  type BriefStatus,
} from '../../lib/briefs-api';
import {
  countDeliverableFiles,
  fetchBriefFilesBundle,
  type BriefFilesBundle,
} from '../../lib/files-api';
import { fetchDesignerBrief, startDesignerWork } from '../../lib/designer-api';

const statusVariant = (status?: string) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'in_progress':
    case 'under_review':
    case 'awaiting_final_delivery':
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
      return 'border-[#C4FE01]/40 text-[#C4FE01] bg-[#C4FE01]/10';
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

const BriefDetail = () => {
  const { briefId } = useParams<{ briefId: string }>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const isClient = user?.role === 'client';
  const isDesigner = user?.role === 'designer';
  const isAdmin = user?.role === 'admin';
  const viewerRole = isDesigner ? 'designer' : isAdmin ? 'admin' : 'client';
  const listPath = isDesigner ? '/designer/briefs' : '/client/briefs';
  const progressPath = isDesigner ? '/designer/progress' : '/client/progress';
  const messagesPath = isDesigner
    ? `/designer/briefs/${briefId}/messages`
    : `/client/progress/${briefId}`;

  const [brief, setBrief] = useState<Brief | null>(null);
  const [filesBundle, setFilesBundle] = useState<BriefFilesBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [submitWorkOpen, setSubmitWorkOpen] = useState(false);
  const [submitFinalOpen, setSubmitFinalOpen] = useState(false);

  const loadBrief = useCallback(async () => {
    if (!token || !briefId) return;

    try {
      setIsLoading(true);
      setLoadError(null);

      let briefData: Brief;

      if (isDesigner) {
        briefData = (await fetchDesignerBrief(token, briefId)) as unknown as Brief;
      } else {
        briefData = await fetchBrief(token, briefId);
      }

      const files = await fetchBriefFilesBundle(token, briefId);
      setFilesBundle(files);
      setBrief({
        ...briefData,
        reference_files: files.reference_files,
        delivery_files: files.delivery_files,
        deliverables: files.deliverables,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load brief details';
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, briefId, isDesigner]);

  useEffect(() => {
    loadBrief();
  }, [loadBrief]);

  const handleStartWork = async () => {
    if (!token || !briefId) return;
    try {
      setIsUpdatingStatus(true);
      await startDesignerWork(token, briefId);
      toast.success('Work started');
      setBrief((prev) => (prev ? { ...prev, status: 'in_progress' } : prev));
      await loadBrief();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to start work');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusChange = (status: BriefStatus) => {
    setBrief((prev) => (prev ? { ...prev, status } : prev));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#C4FE01]" />
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
          <Button variant="outline" onClick={() => navigate(listPath)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Briefs
          </Button>
        </div>
      </MainLayout>
    );
  }

  const canReview = isClient && canReviewBrief(brief.status);
  const canEdit = isClient && canEditBrief(brief.status);
  const clientStatusMessage = isClient ? getClientStatusMessage(brief.status) : null;
  const isPreparingFinal = isClient && isAwaitingFinalDelivery(brief.status);
  const statusRole = viewerRole;
  const designerFeedbackNotes = isDesigner ? getDesignerFeedbackNotes(brief) : null;
  const deliverables = filesBundle?.deliverables ?? brief.deliverables ?? null;
  const previewFiles = deliverables?.preview.files ?? [];
  const deliverableCount = deliverables ? countDeliverableFiles(deliverables) : brief.delivery_files?.length ?? 0;
  const showFilesPanel =
    !canReview &&
    !isPreparingFinal &&
    (isDesigner || isAdmin || (isClient && brief.status === 'completed'));

  return (
    <MainLayout>
      <div className="mb-6">
        <Link
          to={listPath}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-[#C4FE01] transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Briefs
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4FE01] mb-1">
              {getServiceName(brief.service_id)}
            </p>
            <h1 className="text-xl font-bold tracking-tight truncate">{brief.title}</h1>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">ID: {brief._id}</p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`${progressPath}/${brief._id}`)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Progress
            </Button>

            {isDesigner && (
              <Button variant="outline" size="sm" onClick={() => navigate(messagesPath)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            )}

            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/client/edit-brief/${brief._id}`)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}

            {isDesigner && (
              <DesignerBriefActions
                status={brief.status || 'not_assigned'}
                isUpdating={isUpdatingStatus}
                onStartWork={handleStartWork}
                onSubmitWork={() => setSubmitWorkOpen(true)}
                onUploadFinal={() => setSubmitFinalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {designerFeedbackNotes && (
            <DesignerFeedbackNotes notes={designerFeedbackNotes} updatedAt={brief.updatedAt} />
          )}

          {clientStatusMessage && (
            <div className="rounded-lg border border-[#C4FE01]/30 bg-[#C4FE01]/10 px-4 py-3">
              <p className="text-sm font-semibold text-[#C4FE01]">{clientStatusMessage}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your designer is packaging the final deliverables. You&apos;ll be notified when they&apos;re ready to download.
              </p>
            </div>
          )}

          {canReview && (
            <ClientDeliveryReviewPanel
              briefId={brief._id}
              token={token}
              previewFiles={previewFiles}
              revisionCount={brief.revision_count}
              revisionLimit={brief.revision_limit}
              onSuccess={(newStatus) => {
                handleStatusChange(newStatus);
                loadBrief();
              }}
            />
          )}

          <Card className="bg-card/20 backdrop-blur-md border-border overflow-hidden">
            <div className="aspect-[21/9] bg-muted/30 overflow-hidden border-b border-border/40">
              {brief.thumbnail_url ? (
                <img
                  src={brief.thumbnail_url}
                  alt={brief.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C4FE01]/20 to-transparent">
                  <span className="text-6xl font-bold text-[#C4FE01]/40">
                    {brief.title?.charAt(0) || 'B'}
                  </span>
                </div>
              )}
            </div>

            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(brief.status)} className="capitalize text-[10px]">
                  {formatBriefStatus(brief.status, statusRole)}
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
                  <Calendar className="h-4 w-4 text-[#C4FE01] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      Delivery Date
                    </p>
                    <p className="text-sm font-medium">{formatDate(brief.delivery_date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-[#C4FE01] mt-0.5 shrink-0" />
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

          {showFilesPanel && (
            <Card className="bg-card/20 backdrop-blur-md border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold tracking-[0.15em] uppercase">
                  Project Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BriefFilesPanel
                  referenceFiles={brief.reference_files || []}
                  deliverables={deliverables}
                  viewerRole={viewerRole}
                  briefStatus={brief.status}
                />
                {isClient && brief.status === 'completed' && deliverableCount === 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Final deliverables will appear here once uploaded.
                  </p>
                )}
                {isClient && brief.status !== 'completed' && deliverableCount === 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Delivery files will appear here once your project is ready for review.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
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
                <span className="text-muted-foreground">Deliverables</span>
                <span className="font-medium">{deliverableCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isDesigner && (
        <>
          <SubmitWorkSheet
            open={submitWorkOpen}
            briefId={brief._id}
            briefTitle={brief.title}
            token={token}
            onClose={() => setSubmitWorkOpen(false)}
            onSuccess={async () => {
              await loadBrief();
            }}
          />
          <SubmitFinalDeliverySheet
            open={submitFinalOpen}
            briefId={brief._id}
            briefTitle={brief.title}
            token={token}
            onClose={() => setSubmitFinalOpen(false)}
            onSuccess={async () => {
              await loadBrief();
            }}
          />
        </>
      )}
    </MainLayout>
  );
};

export default BriefDetail;
