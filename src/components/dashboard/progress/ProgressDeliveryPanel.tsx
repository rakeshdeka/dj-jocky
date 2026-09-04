import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  acceptBrief,
  canReviewBrief,
  canClientSeeDeliveryFiles,
  requestBriefRevision,
  formatBriefStatus,
  type BriefStatus,
  type BriefStatusRole,
  type DesignerFeedbackNotes as DesignerFeedbackNotesData,
} from '../../../lib/briefs-api';
import { getBriefFileName, type BriefFile } from '../../../lib/files-api';
import type { StatusProgress } from '../messaging/ConversationView';
import DesignerBriefActions from '../designer/DesignerBriefActions';
import DesignerFeedbackNotes from '../designer/DesignerFeedbackNotes';
import ProgressMessageComposer from './ProgressMessageComposer';

export type ProgressMessage = {
  _id: string;
  message: string;
  createdAt: string;
  sender_id: {
    _id: string;
    name: string;
    role?: string;
  };
  attachments?: Array<string | Record<string, string>>;
  file?: string | Record<string, string>;
  files?: Array<string | Record<string, string>>;
};

type ProgressDeliveryPanelProps = {
  briefId: string;
  briefTitle: string;
  briefStatus: string;
  token: string | null;
  currentUserId?: string;
  isClient: boolean;
  isDesigner: boolean;
  deliveryFiles: BriefFile[];
  messages: ProgressMessage[];
  statusProgress?: StatusProgress | null;
  isLoading: boolean;
  isSendingMessage?: boolean;
  isUpdatingStatus?: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onSendMessage: (content: string, files?: File[]) => void;
  onStartWork?: () => void;
  onSubmitWork?: () => void;
  onStatusChange?: (status: BriefStatus) => void;
  designerFeedbackNotes?: DesignerFeedbackNotesData | null;
  briefUpdatedAt?: string;
};

const getMessageAttachments = (message: ProgressMessage) => {
  const items = [
    ...(message.attachments || []),
    ...(message.file ? [message.file] : []),
    ...(message.files || []),
  ];
  return items.map((item) => {
    if (typeof item === 'string') return { name: 'Attachment', url: item };
    return {
      name: item.name || item.original_name || item.filename || 'Attachment',
      url: item.url || item.file_url || item.path,
    };
  });
};

const getSenderInitials = (name?: string) =>
  name
    ?.split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

const getRoleLabel = (role?: string) => {
  if (!role) return 'Team';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getAvatarClass = (role?: string) => {
  switch (role) {
    case 'admin':
      return 'bg-orange-500 text-white';
    case 'designer':
      return 'bg-purple-500 text-white';
    case 'client':
      return 'bg-[#C4FE01] text-black';
    default:
      return 'bg-secondary text-foreground';
  }
};

const ProgressDeliveryPanel = ({
  briefId,
  briefTitle,
  briefStatus,
  token,
  currentUserId,
  isClient,
  isDesigner,
  deliveryFiles,
  messages,
  statusProgress,
  isLoading,
  isSendingMessage = false,
  isUpdatingStatus = false,
  onBack,
  onRefresh,
  onSendMessage,
  onStartWork,
  onSubmitWork,
  onStatusChange,
  designerFeedbackNotes,
  briefUpdatedAt,
}: ProgressDeliveryPanelProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  const canReview = isClient && canReviewBrief(briefStatus as BriefStatus);
  const statusRole: BriefStatusRole = isDesigner ? 'designer' : isClient ? 'client' : 'admin';
  const visibleDeliveryFiles =
    isClient && !canClientSeeDeliveryFiles(briefStatus as BriefStatus) ? [] : deliveryFiles;
  const latestVersion = visibleDeliveryFiles.reduce((max, file) => Math.max(max, file.version ?? 0), 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDownloadAll = () => {
    if (visibleDeliveryFiles.length === 0) return;
    visibleDeliveryFiles.forEach((file) => window.open(file.file_url, '_blank', 'noopener,noreferrer'));
    toast.success(`Opening ${visibleDeliveryFiles.length} file${visibleDeliveryFiles.length > 1 ? 's' : ''}`);
  };

  const handleAccept = async () => {
    if (!token) return;
    try {
      setIsAccepting(true);
      await acceptBrief(token, briefId);
      toast.success('Delivery approved');
      onStatusChange?.('completed');
      onRefresh();
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || 'Failed to approve delivery');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!token || !revisionNote.trim()) {
      toast.error('Please add a revision note');
      return;
    }
    try {
      setIsSubmittingRevision(true);
      await requestBriefRevision(token, briefId, revisionNote);
      toast.success('Revision request sent');
      setRevisionNote('');
      setShowRevisionForm(false);
      onStatusChange?.('revision');
      onRefresh();
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || 'Failed to send revision request');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01]" />
        <p className="text-xs">Loading project thread...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-border/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-base font-semibold truncate">{briefTitle}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] capitalize">
                {formatBriefStatus(briefStatus, statusRole)}
              </Badge>
              {statusProgress?.is_revision && (
                <Badge variant="secondary" className="text-[10px]">
                  Revision
                </Badge>
              )}
              {latestVersion > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  v{latestVersion}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {isDesigner && (
          <DesignerBriefActions
            status={briefStatus}
            isUpdating={isUpdatingStatus}
            onStartWork={onStartWork}
            onSubmitWork={onSubmitWork}
          />
        )}
      </div>

      {isDesigner && designerFeedbackNotes && (
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-border/60 bg-background/80">
          <DesignerFeedbackNotes notes={designerFeedbackNotes} updatedAt={briefUpdatedAt} />
        </div>
      )}

      {(visibleDeliveryFiles.length > 0 || isDesigner || canReview) && (
      <div className="shrink-0 sticky top-0 z-10 border-b border-border/60 bg-card/95 backdrop-blur-md px-4 sm:px-6 py-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Delivery Files
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={handleDownloadAll}
              disabled={visibleDeliveryFiles.length === 0}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download all
            </Button>
            {canReview && (
              <>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-[#C4FE01] hover:bg-[#b2e600] text-black"
                  onClick={handleAccept}
                  disabled={isAccepting || visibleDeliveryFiles.length === 0}
                >
                  {isAccepting ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowRevisionForm((prev) => !prev)}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Request changes
                </Button>
              </>
            )}
          </div>
        </div>

        {visibleDeliveryFiles.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {visibleDeliveryFiles.map((file) => (
              <div
                key={file._id || file.id}
                className="flex items-center gap-3 min-w-[220px] max-w-[280px] border border-border/60 rounded-lg bg-background/60 px-3 py-2.5 shrink-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{getBriefFileName(file)}</p>
                  {/* {(file.version ?? 0) > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">v{file.version}</p>
                  )} */}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md hover:bg-[#C4FE01]/20 transition-colors"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <a
                    href={file.file_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md hover:bg-[#C4FE01]/20 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {isClient && !canClientSeeDeliveryFiles(briefStatus as BriefStatus)
              ? 'Delivery files will appear here once your project is ready for review.'
              : 'No delivery files uploaded yet.'}
          </p>
        )}

        {canReview && showRevisionForm && (
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
            <Textarea
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="Describe what needs to be changed..."
              rows={3}
              disabled={isSubmittingRevision}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setShowRevisionForm(false);
                  setRevisionNote('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleRequestRevision}
                disabled={isSubmittingRevision || !revisionNote.trim()}
              >
                {isSubmittingRevision && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Send revision
              </Button>
            </div>
          </div>
        )}
      </div>
      )}

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 sm:px-6 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground">No messages yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Start the conversation below.</p>
            </div>
          ) : (
            messages
              .filter(
                (msg) =>
                  Boolean(msg.message?.trim()) || getMessageAttachments(msg).length > 0,
              )
              .map((msg) => {
              const isMe = msg.sender_id._id === currentUserId;
              const attachments = getMessageAttachments(msg);
              const role = msg.sender_id.role;

              return (
                <div key={msg._id} className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${getAvatarClass(role)}`}
                  >
                    {getSenderInitials(msg.sender_id.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <p className="text-sm font-semibold">{msg.sender_id.name || 'Unknown'}</p>
                      <Badge variant="outline" className="text-[9px] h-5 capitalize">
                        {getRoleLabel(role)}
                      </Badge>
                      {isMe && (
                        <Badge variant="secondary" className="text-[9px] h-5">
                          You
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(msg.createdAt), 'MMM d, yyyy · h:mm a')}
                      </span>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm space-y-2">
                      {msg.message?.trim() && (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      )}
                      {attachments.length > 0 && (
                        <div className="space-y-1.5">
                          {attachments.map((file, index) => (
                            <a
                              key={`${msg._id}-att-${index}`}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 text-xs rounded-md px-2 py-1.5 bg-background/40 hover:bg-background/60 transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate flex-1">{file.name}</span>
                              <Download className="h-3.5 w-3.5 shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="shrink-0">
        <ProgressMessageComposer
          isSending={isSendingMessage}
          placeholder={isClient ? 'Reply to the team...' : 'Message the client...'}
          onSend={onSendMessage}
        />
      </div>
    </div>
  );
};

export default ProgressDeliveryPanel;
