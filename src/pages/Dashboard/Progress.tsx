"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import MainLayout from '../../components/dashboard/layout/MainLayout';
import ConversationView, {
  type BriefDetails,
  type StatusProgress,
} from '../../components/dashboard/messaging/ConversationView';
import { Badge } from '../../components/dashboard/ui/badge';
import { Button } from '../../components/dashboard/ui/button';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '../../components/dashboard/ui/dialog';
import { toast } from 'sonner';
import MeetingRequestForm from '../../components/dashboard/meetings/MeetingRequestForm';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';

export interface Message {
  _id: string;
  brief_id: string;
  sender_id: {
    _id: string;
    role: string;
    name: string;
    email: string;
  };
  message: string;
  attachments?: Array<string | Record<string, string>>;
  file?: string | Record<string, string>;
  files?: Array<string | Record<string, string>>;
  createdAt: string;
}

export interface Brief {
  _id: string;
  title: string;
  status: string;
  priority: string;
  service_id?: {
    name: string;
  };
  client_id?: {
    name: string;
  };
}

const Progress: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token, user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [briefDetails, setBriefDetails] = useState<BriefDetails | null>(null);
  const [statusProgress, setStatusProgress] = useState<StatusProgress | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingBriefs, setIsLoadingBriefs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileViewOpen, setMobileViewOpen] = useState(false);
  const [showMeetingRequestDialog, setShowMeetingRequestDialog] = useState(false);

  const isClient = user?.role === 'client';

  const fetchBriefs = useCallback(async () => {
    try {
      setIsLoadingBriefs(true);
      const endpoint =
        user?.role === 'designer'
          ? `${apiUrl}/designer/briefs`
          : `${apiUrl}/briefs/me`;
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBriefs(res.data.items || []);
    } catch {
      toast.error("Failed to load your briefs");
    } finally {
      setIsLoadingBriefs(false);
    }
  }, [apiUrl, token, user?.role]);

  useEffect(() => {
    if (token) fetchBriefs();
  }, [fetchBriefs, token]);

  const fetchMessages = async (briefId: string) => {
    try {
      setIsLoadingMessages(true);
      const res = await axios.get(`${apiUrl}/chat/brief-groups/${briefId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data;
      setMessages(data.items || []);
      setBriefDetails(data.brief || null);
      setStatusProgress(data.status_progress || null);

      if (data.brief) {
        setSelectedBrief((prev) =>
          prev?._id === briefId
            ? {
                ...prev,
                title: data.brief.title,
                status: data.brief.status,
                priority: data.brief.priority,
              }
            : prev
        );
      }

      console.log('[Progress] Chat loaded:', {
        brief: data.brief,
        status_progress: data.status_progress,
        messageCount: data.items?.length ?? 0,
      });
    } catch {
      toast.error("Could not load chat history");
      setBriefDetails(null);
      setStatusProgress(null);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSelectBrief = async (brief: Brief) => {
    setSelectedBrief(brief);
    setMobileViewOpen(true);
    await fetchMessages(brief._id);
  };

  const handleSendMessage = async (briefId: string, content: string, files?: File[]) => {
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

      if (content.trim()) {
        formData.append('message', content.trim());
      }

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
        }
      );

      if (res.data.success) {
        fetchMessages(briefId);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleBackToList = () => setMobileViewOpen(false);

  const filteredBriefs = briefs.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (createdAt: string) =>
    new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getMessageAttachments = (message: Message) => {
    const items = [
      ...(message.attachments || []),
      ...(message.file ? [message.file] : []),
      ...(message.files || []),
    ];
    return items;
  };

  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">PROGRESS</h1>
            <p className="text-sm text-muted-foreground">
              {isClient
                ? 'Track the progress of your projects'
                : 'View and chat on your assigned briefs'}
            </p>
          </div>

          <Badge variant="secondary" className="bg-[#c5fb00] text-black hover:bg-[#c5fb00] shrink-0">
            {briefs.length} Projects
          </Badge>
        </div>
        {isClient && (
          <Button
            className="bg-[#c5fb00] text-black hover:bg-[#b0e000] font-bold shrink-0"
            onClick={() => navigate('/client/create-brief')}
          >
            <Plus className="mr-2 h-4 w-4" /> New Brief
          </Button>
        )}
      </div>

      <div className="flex flex-col h-[calc(100vh-280px)] md:flex-row gap-6 overflow-hidden">
        <div className={`w-full md:w-1/3 lg:w-1/4 flex flex-col gap-3 transition-all border-r border-border pr-2 ${mobileViewOpen ? 'hidden md:flex' : 'flex'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-muted/30 border border-border focus:outline-none focus:ring-1 focus:ring-[#c5fb00]/40"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingBriefs ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p className="text-xs">Loading projects...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBriefs.map((brief) => (
                  <div
                    key={brief._id}
                    onClick={() => handleSelectBrief(brief)}
                    className={`p-4 rounded-md cursor-pointer transition-all border ${
                      selectedBrief?._id === brief._id
                        ? 'bg-secondary/50 border-[#c5fb00]'
                        : 'bg-card/40 border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3 className="font-bold text-sm truncate flex-1">{brief.title}</h3>
                      <Badge className="text-[9px] uppercase h-4 px-1 shrink-0 capitalize">
                        {brief.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {brief.service_id?.name || 'General Project'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 capitalize">
                      {brief.priority} priority
                    </p>
                  </div>
                ))}
                {filteredBriefs.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-10">No projects found.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`flex-1 h-full flex flex-col bg-card/20 rounded-md border border-border overflow-hidden ${mobileViewOpen ? 'block' : 'hidden md:block'}`}>
          {selectedBrief ? (
            <ConversationView
              conversation={{
                id: selectedBrief._id,
                projectName: selectedBrief.title,
                messages: messages.map((m) => ({
                  id: m._id,
                  senderId: m.sender_id._id,
                  senderName: m.sender_id.name,
                  content: m.message,
                  attachments: getMessageAttachments(m),
                  timestamp: formatMessageTime(m.createdAt),
                  isMe: m.sender_id._id === user?.id,
                  read: true,
                })),
              }}
              briefDetails={briefDetails}
              statusProgress={statusProgress}
              isLoading={isLoadingMessages}
              isSending={isSendingMessage}
              showProgressBar={isClient}
              showScheduleMeet={isClient}
              canCompose={isClient}
              onSendMessage={(id: string, content: string, files?: File[]) => handleSendMessage(id, content, files)}
              onBack={handleBackToList}
              onRequestMeeting={isClient ? () => setShowMeetingRequestDialog(true) : undefined}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-lg font-medium">No Project Selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-2">
                Select a project from the left to view progress, status, and chat with the team.
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showMeetingRequestDialog} onOpenChange={setShowMeetingRequestDialog}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border">
          {selectedBrief && (
            <MeetingRequestForm
              conversation={{ projectName: selectedBrief.title }}
              onCancel={() => setShowMeetingRequestDialog(false)}
              onRequestMeeting={() => {
                toast.success("Meeting request sent!");
                setShowMeetingRequestDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Progress;
