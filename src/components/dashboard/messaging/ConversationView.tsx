"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { ArrowLeft, Paperclip, Send, Loader2, CalendarDays, Ghost, FileText, X, Eye, Download, Image as ImageIcon, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { hasRevisionLimit } from '../../../lib/briefs-api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_FILES = 10;
const apiUrl = import.meta.env.VITE_API_URL;
const imageKitEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;
const apiOrigin = apiUrl?.replace(/\/api\/?$/, '') || '';

export interface WorkflowStep {
  status: string;
  label: string;
  completed: boolean;
  current: boolean;
  revision_active: boolean;
}

export interface StatusItem {
  status: string;
  label: string;
}

export interface StatusProgress {
  current_status: string;
  current_status_label: string;
  all_statuses?: StatusItem[];
  workflow_steps: WorkflowStep[];
  progress_percent: number;
  is_revision: boolean;
  current_step_index: number;
  total_steps: number;
}

export interface BriefDetails {
  _id?: string;
  title: string;
  status: string;
  priority: string;
  revision_count?: number;
  revision_limit?: number | null;
}

export interface ChatAttachment {
  name: string;
  url?: string;
  mimeType?: string;
  isImage?: boolean;
  isPdf?: boolean;
}

interface ConversationViewProps {
  conversation: {
    id: string;
    projectName: string;
    messages: any[];
  };
  briefDetails?: BriefDetails | null;
  statusProgress?: StatusProgress | null;
  isLoading?: boolean;
  isSending?: boolean;
  showProgressBar?: boolean;
  showScheduleMeet?: boolean;
  canCompose?: boolean;
  onSendMessage: (conversationId: string, content: string, files?: File[]) => void | Promise<void>;
  onBack: () => void;
  onRequestMeeting?: () => void;
}

const priorityStyles: Record<string, string> = {
  low: 'bg-slate-500/10 text-slate-400',
  medium: 'bg-yellow-500/10 text-yellow-500',
  high: 'bg-red-500/10 text-red-400',
};

const StatusProgressBar: React.FC<{ statusProgress: StatusProgress }> = ({ statusProgress }) => {
  const steps = statusProgress.workflow_steps;


  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-lg border border-border/60 bg-muted/10 px-3 py-3 sm:px-4">

        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <div className="flex items-start min-w-max">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              const isCompleted = step.completed && !step.current;
              const isCurrent = step.current;
              const connectorFilled = step.completed;

              return (
                <div key={step.status} className="flex items-start">
                  <div className="flex flex-col items-center w-[76px] sm:w-[92px]">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-semibold transition-all',
                            isCompleted && 'border-[#c5fb00] bg-[#c5fb00] text-black',
                            isCurrent && 'border-[#c5fb00] bg-background text-[#c5fb00] shadow-[0_0_0_4px_rgba(197,251,0,0.15)]',
                            !isCompleted && !isCurrent && !step.revision_active &&
                              'border-muted-foreground/25 bg-background text-muted-foreground',
                            step.revision_active &&
                              'border-orange-500 bg-orange-500/10 text-orange-500'
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        {step.label}
                      </TooltipContent>
                    </Tooltip>

                    <p
                      className={cn(
                        'mt-2 text-[10px] text-center leading-tight px-1 line-clamp-2',
                        isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </p>
                  </div>

                  {!isLast && (
                    <div
                      className={cn(
                        'h-0.5 w-5 sm:w-8 mt-3.5 shrink-0 rounded-full transition-colors',
                        connectorFilled ? 'bg-[#c5fb00]' : 'bg-muted-foreground/20'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

const getFileType = (name: string, mimeType?: string) => {
  const lower = name.toLowerCase();
  const isImage =
    mimeType?.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(lower);
  const isPdf = mimeType === 'application/pdf' || lower.endsWith('.pdf');
  return { isImage, isPdf };
};

const resolveAttachmentUrl = (raw?: string) => {
  if (!raw) return undefined;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  if (imageKitEndpoint && !raw.startsWith('/')) {
    return `${imageKitEndpoint.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
  }
  if (apiOrigin) {
    return `${apiOrigin}${raw.startsWith('/') ? raw : `/${raw}`}`;
  }
  return raw;
};

const normalizeAttachment = (attachment: unknown): ChatAttachment => {
  if (typeof attachment === 'string') {
    const name = attachment.split('/').pop() || attachment;
    const url = resolveAttachmentUrl(attachment);
    return { name, url, ...getFileType(name) };
  }

  if (attachment && typeof attachment === 'object') {
    const item = attachment as {
      url?: string;
      file_url?: string;
      path?: string;
      name?: string;
      filename?: string;
      originalName?: string;
      original_name?: string;
      file_type?: string;
      mimetype?: string;
      mimeType?: string;
    };
    const name =
      item.original_name ||
      item.originalName ||
      item.name ||
      item.filename ||
      'Attachment';
    const url = resolveAttachmentUrl(item.file_url || item.url || item.path);
    const mimeType = item.file_type || item.mimetype || item.mimeType;
    return { name, url, mimeType, ...getFileType(name, mimeType) };
  }

  return { name: 'Attachment' };
};

const MessageAttachment: React.FC<{
  file: ChatAttachment;
  isMe: boolean;
  onPreview: (file: ChatAttachment) => void;
}> = ({ file, isMe, onPreview }) => {
  const chipClass = isMe
    ? 'bg-black/10 hover:bg-black/15 text-black'
    : 'bg-background/40 hover:bg-background/60 text-white';

  if (file.isImage && file.url) {
    return (
      <button
        type="button"
        onClick={() => onPreview(file)}
        className="block rounded-lg overflow-hidden border border-black/10 max-w-[220px]"
      >
        <img
          src={file.url}
          alt={file.name}
          className="w-full max-h-40 object-cover"
          loading="lazy"
        />
        <div className={`flex items-center gap-2 text-xs px-2 py-1.5 ${chipClass}`}>
          <ImageIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{file.name}</span>
        </div>
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-xs rounded-md px-2 py-1.5 ${chipClass}`}>
      <FileText className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate flex-1">{file.name}</span>
      {file.url ? (
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onPreview(file)}
            className="p-1 rounded hover:bg-black/10"
            aria-label="View attachment"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            download={file.name}
            className="p-1 rounded hover:bg-black/10"
            aria-label="Download attachment"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}
    </div>
  );
};

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  briefDetails,
  statusProgress,
  isLoading,
  isSending = false,
  showProgressBar = true,
  showScheduleMeet = true,
  canCompose = true,
  onSendMessage,
  onBack,
  onRequestMeeting
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<ChatAttachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleSend = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    if (newMessage.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }
    onSendMessage(conversation.id, newMessage.trim(), selectedFiles);
    setNewMessage('');
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setSelectedFiles((prev) => {
      const incoming = Array.from(files);
      const combined = [...prev, ...incoming];
      if (combined.length > MAX_FILES) {
        toast.error(`You can attach up to ${MAX_FILES} files`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend =
    (newMessage.trim().length > 0 || selectedFiles.length > 0) &&
    newMessage.length <= MAX_MESSAGE_LENGTH &&
    !isSending;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentLabel = statusProgress?.current_status_label || briefDetails?.status?.replace(/_/g, ' ');

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="p-4 border-b border-border bg-background/50 space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 shrink-0" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h2 className="font-bold text-sm tracking-tight truncate">
                {briefDetails?.title || conversation.projectName}
              </h2>
              <p className="text-[10px] text-[#c5fb00] font-bold uppercase tracking-widest">Live Group Chat</p>
            </div>
          </div>
          {showScheduleMeet && onRequestMeeting && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestMeeting}
              className="h-8 text-[10px] font-bold uppercase border-border hover:bg-[#c5fb00] hover:text-black transition-all shrink-0"
            >
              <CalendarDays className="h-3 w-3 mr-2" />
              Schedule Meet
            </Button>
          )}
        </div>

        {briefDetails && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase capitalize border-border">
              {currentLabel}
            </Badge>
            <Badge className={`text-[10px] uppercase border-none ${priorityStyles[briefDetails.priority] || 'bg-muted text-muted-foreground'}`}>
              {briefDetails.priority} priority
            </Badge>
            {hasRevisionLimit(briefDetails.revision_limit) && (
              <Badge variant="secondary" className="text-[10px] uppercase">
                Revisions {briefDetails.revision_count ?? 0}/{briefDetails.revision_limit}
              </Badge>
            )}
            {statusProgress?.is_revision && (
              <Badge className="text-[10px] uppercase bg-orange-500/10 text-orange-400 border-none">
                Revision active
              </Badge>
            )}
          </div>
        )}

        {showProgressBar && statusProgress && (
          <StatusProgressBar statusProgress={statusProgress} />
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#c5fb00]" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Syncing messages...</p>
          </div>
        ) : conversation.messages.length > 0 ? (
          <ScrollArea className="h-full w-full p-4">
            <div className="space-y-6">
              {conversation.messages.map((msg, idx) => {
                const isMe = msg.isMe;
                const attachments: ChatAttachment[] = (msg.attachments || []).map(normalizeAttachment);
                return (
                  <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        {!isMe && <span className="text-[10px] font-bold text-[#c5fb00] uppercase tracking-tighter">{msg.senderName}</span>}
                        <span className="text-[9px] text-muted-foreground/60">{msg.timestamp}</span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm space-y-2 ${
                        isMe
                          ? 'bg-[#c5fb00] text-black rounded-tr-none font-medium'
                          : 'bg-secondary border border-border rounded-tl-none text-white'
                      }`}>
                        {msg.content && <p>{msg.content}</p>}
                        {attachments.length > 0 && (
                          <div className="space-y-1.5">
                            {attachments.map((file, fileIdx) => (
                              <MessageAttachment
                                key={`${msg.id}-file-${fileIdx}`}
                                file={file}
                                isMe={isMe}
                                onPreview={setPreviewFile}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-center p-6">
            <Ghost className="h-10 w-10 mb-3" />
            <h3 className="text-xs font-bold uppercase tracking-widest">No history here</h3>
            <p className="text-[10px] max-w-[180px] mt-1 leading-relaxed">
              Break the ice! Send the first message to the team.
            </p>
          </div>
        )}
      </div>

      {canCompose ? (
      <div className="p-4 bg-background/50 border-t border-border space-y-2">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-1.5 text-xs bg-secondary/50 border border-border rounded-md px-2 py-1 max-w-[200px]"
              >
                <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeSelectedFile(index)}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-secondary/30 p-2 rounded-xl border border-border focus-within:border-[#c5fb00]/40 transition-all">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            disabled={isSending}
            maxLength={MAX_MESSAGE_LENGTH}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 resize-none min-h-[42px] max-h-[150px] disabled:opacity-50"
            rows={1}
          />
          <div className="flex flex-col items-end gap-1 pb-1 pr-1">
            <span className="text-[10px] text-muted-foreground tabular-nums px-1">
              {newMessage.length}/{MAX_MESSAGE_LENGTH}
            </span>
            <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isSending || selectedFiles.length >= MAX_FILES}
              className="h-8 w-8 text-muted-foreground hover:text-white"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!canSend}
              className="h-8 w-8 bg-[#c5fb00] text-black hover:bg-[#b0e000] disabled:opacity-20 rounded-lg shadow-lg shadow-[#c5fb00]/10"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="p-4 bg-background/50 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            Messaging is view-only for your role.
          </p>
        </div>
      )}

      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="sm:max-w-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm truncate pr-6">{previewFile?.name}</DialogTitle>
          </DialogHeader>

          {previewFile?.url ? (
            <div className="space-y-4">
              {previewFile.isImage ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="w-full max-h-[70vh] object-contain rounded-lg bg-muted/20"
                />
              ) : previewFile.isPdf ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  className="w-full h-[70vh] rounded-lg border border-border bg-white"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-lg">
                  <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">Preview not available for this file type</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={previewFile.url} target="_blank" rel="noopener noreferrer">
                    Open in new tab
                  </a>
                </Button>
                <Button size="sm" className="bg-[#c5fb00] text-black hover:bg-[#b0e000]" asChild>
                  <a href={previewFile.url} download={previewFile.name}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Attachment URL not available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversationView;
