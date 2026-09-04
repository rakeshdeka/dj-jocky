import { useCallback, useEffect, useState } from 'react';
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
import { fetchBriefDeliveryFiles, type BriefFile } from '../../lib/files-api';
import ProgressDeliveryPanel, {
  type ProgressMessage,
} from '../../components/dashboard/progress/ProgressDeliveryPanel';
import SubmitWorkSheet from '../../components/dashboard/designer/SubmitWorkSheet';

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
  const [messages, setMessages] = useState<ProgressMessage[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [submitWorkOpen, setSubmitWorkOpen] = useState(false);

  const fetchMessages = async (id: string) => {
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
    return data;
  };

  const loadDetail = useCallback(async () => {
    if (!token || !briefId) return;

    try {
      setIsLoading(true);

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
        fetchBriefDeliveryFiles(token, briefId),
        fetchMessages(briefId),
      ]);
      setDeliveryFiles(files);
    } catch {
      toast.error('Could not load project');
      navigate(basePath);
    } finally {
      setIsLoading(false);
    }
  }, [token, briefId, isDesigner, apiUrl, navigate, basePath]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

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
        await fetchMessages(briefId);
      }
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || 'Failed to send message');
    } finally {
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
      await loadDetail();
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
            messages={messages}
            statusProgress={statusProgress}
            isLoading={isLoading}
            isSendingMessage={isSendingMessage}
            isUpdatingStatus={isUpdatingStatus}
            onBack={() => navigate(basePath)}
            onRefresh={loadDetail}
            onSendMessage={handleSendMessage}
            onStartWork={handleStartWork}
            onSubmitWork={() => setSubmitWorkOpen(true)}
            onStatusChange={handleStatusChange}
            designerFeedbackNotes={isDesigner ? getDesignerFeedbackNotes(brief) : null}
            briefUpdatedAt={brief?.updatedAt}
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
          await loadDetail();
        }}
      />
    </MainLayout>
  );
};

export default ProgressDetail;
