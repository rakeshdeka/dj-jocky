import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import MainLayout from '../../components/dashboard/layout/MainLayout';
import { type StatusProgress } from '../../components/dashboard/messaging/ConversationView';
import { RootState } from '../../store/store';
import {
  fetchDesignerBrief,
  startDesignerWork,
} from '../../lib/designer-api';
import { fetchBrief, getDesignerFeedbackNotes, type Brief, type BriefStatus } from '../../lib/briefs-api';
import {
  fetchBriefFilesBundle,
  type BriefDeliverables,
  type BriefFile,
} from '../../lib/files-api';
import ProgressDeliveryPanel, {
  type ProgressMessage,
} from '../../components/dashboard/progress/ProgressDeliveryPanel';
import SubmitWorkSheet from '../../components/dashboard/designer/SubmitWorkSheet';
import SubmitFinalDeliverySheet from '../../components/dashboard/designer/SubmitFinalDeliverySheet';

const POLL_INTERVAL_MS = 45_000;

const ProgressDetail = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { briefId } = useParams<{ briefId: string }>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const isClient = user?.role === 'client';
  const isDesigner = user?.role === 'designer';
  const basePath = isDesigner ? '/designer/progress' : '/client/progress';

  const [brief, setBrief] = useState<Brief | null>(null);
  const [statusProgress, setStatusProgress] = useState<StatusProgress | null>(null);
  const [deliveryFiles, setDeliveryFiles] = useState<BriefFile[]>([]);
  const [deliverables, setDeliverables] = useState<BriefDeliverables | null>(null);
  const [messages, setMessages] = useState<ProgressMessage[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [submitWorkOpen, setSubmitWorkOpen] = useState(false);
  const [submitFinalOpen, setSubmitFinalOpen] = useState(false);

  const isSendingRef = useRef(false);

  const fetchMessages = useCallback(
    async (id: string) => {
      const res = await axios.get(`${apiUrl}/chat/brief-groups/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      const rawItems = data.items || data.messages || [];
      const items: ProgressMessage[] = rawItems.map((item: Record<string, unknown>) => {
        const sender = item.sender_id as Record<string, string> | string | undefined;
        const senderObj = typeof sender === 'object' && sender ? sender : null;

        return {
          _id: String(item._id || item.id),
          message: String(item.message || ''),
          createdAt: String(item.createdAt || new Date().toISOString()),
          attachments: item.attachments as ProgressMessage['attachments'],
          file: item.file as ProgressMessage['file'],
          files: item.files as ProgressMessage['files'],
          sender_id: {
            _id: String(senderObj?._id || sender || ''),
            name: String(senderObj?.name || 'Unknown'),
            role: senderObj?.role,
          },
        };
      });

      setMessages(items);
      setStatusProgress(data.status_progress || null);

      const chatBrief = data.brief as { revision_count?: number; revision_limit?: number | null } | undefined;
      if (chatBrief) {
        setBrief((prev) =>
          prev
            ? {
                ...prev,
                revision_count: chatBrief.revision_count ?? prev.revision_count,
                revision_limit: chatBrief.revision_limit ?? prev.revision_limit,
              }
            : prev,
        );
      }

      return data;
    },
    [apiUrl, token],
  );

  const loadDetail = useCallback(
    async (options: { showLoader?: boolean } = {}) => {
      if (!token || !briefId) return;

      const { showLoader = true } = options;

      try {
        if (showLoader) setIsLoading(true);

        let briefData: Brief;
        if (isDesigner) {
          const designerBrief = await fetchDesignerBrief(token, briefId);
          briefData = designerBrief as unknown as Brief;
          if (designerBrief.status_progress) {
            setStatusProgress(designerBrief.status_progress as StatusProgress);
          }
        } else {
          briefData = await fetchBrief(token, briefId);
        }

        setBrief(briefData);

        const [files] = await Promise.all([
          fetchBriefFilesBundle(token, briefId),
          fetchMessages(briefId),
        ]);
        setDeliveryFiles(files.delivery_files);
        setDeliverables(files.deliverables);
      } catch {
        if (showLoader) {
          toast.error('Could not load project');
          navigate(basePath);
        }
      } finally {
        if (showLoader) setIsLoading(false);
      }
    },
    [token, briefId, isDesigner, navigate, basePath, fetchMessages],
  );

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (!briefId || !token) return;

    const intervalId = window.setInterval(() => {
      if (isSendingRef.current) return;
      loadDetail({ showLoader: false });
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [briefId, token, loadDetail]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!token || !briefId) return;
    if (!content.trim() && (!files || files.length === 0)) return;

    if (content.length > 2000) {
      toast.error('Message cannot exceed 2000 characters');
      return;
    }

    if (files && files.length > 10) {
      toast.error('You can attach up to 10 files');
      return;
    }

    try {
      isSendingRef.current = true;
      setIsSendingMessage(true);
      const formData = new FormData();
      if (content.trim()) formData.append('message', content.trim());
      if (files?.length === 1) {
        formData.append('file', files[0]);
      } else if (files && files.length > 1) {
        files.forEach((file) => formData.append('files', file));
      }

      const res = await axios.post(
        `${apiUrl}/chat/brief-groups/${briefId}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        await loadDetail({ showLoader: false });
      }
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || 'Failed to send message');
    } finally {
      isSendingRef.current = false;
      setIsSendingMessage(false);
    }
  };

  const handleStartWork = async () => {
    if (!token || !briefId) return;
    try {
      setIsUpdatingStatus(true);
      await startDesignerWork(token, briefId);
      toast.success('Work started');
      setBrief((prev) => (prev ? { ...prev, status: 'in_progress' } : prev));
      await loadDetail({ showLoader: false });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to start work');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusChange = (status: BriefStatus) => {
    setBrief((prev) => (prev ? { ...prev, status } : prev));
  };

  return (
    <MainLayout>
      <div className="border border-border/60 rounded-lg overflow-hidden bg-card/10 h-[calc(100vh-180px)]">
        {briefId && (
          <ProgressDeliveryPanel
            briefId={briefId}
            briefTitle={brief?.title || 'Project'}
            briefStatus={brief?.status || 'not_assigned'}
            token={token}
            currentUserId={user?.id}
            isClient={isClient}
            isDesigner={isDesigner}
            deliveryFiles={deliveryFiles}
            deliverables={deliverables}
            messages={messages}
            statusProgress={statusProgress}
            isLoading={isLoading}
            isSendingMessage={isSendingMessage}
            isUpdatingStatus={isUpdatingStatus}
            onBack={() => navigate(basePath)}
            onRefresh={() => loadDetail({ showLoader: false })}
            onSendMessage={handleSendMessage}
            onStartWork={handleStartWork}
            onSubmitWork={() => setSubmitWorkOpen(true)}
            onUploadFinal={() => setSubmitFinalOpen(true)}
            onStatusChange={handleStatusChange}
            designerFeedbackNotes={isDesigner ? getDesignerFeedbackNotes(brief) : null}
            briefUpdatedAt={brief?.updatedAt}
            revisionCount={brief?.revision_count}
            revisionLimit={brief?.revision_limit}
          />
        )}
      </div>

      <SubmitWorkSheet
        open={submitWorkOpen}
        briefId={briefId ?? null}
        briefTitle={brief?.title}
        token={token}
        onClose={() => setSubmitWorkOpen(false)}
        onSuccess={async () => {
          await loadDetail({ showLoader: false });
        }}
      />

      <SubmitFinalDeliverySheet
        open={submitFinalOpen}
        briefId={briefId ?? null}
        briefTitle={brief?.title}
        token={token}
        onClose={() => setSubmitFinalOpen(false)}
        onSuccess={async () => {
          setBrief((prev) => (prev ? { ...prev, status: 'completed' } : prev));
          await loadDetail({ showLoader: false });
        }}
      />
    </MainLayout>
  );
};

export default ProgressDetail;
