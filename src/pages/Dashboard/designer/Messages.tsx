import React from 'react';
import { toast } from 'sonner';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card } from '../../../components/dashboard/ui/card';
import { Input } from '../../../components/dashboard/ui/input';
import { Button } from '../../../components/dashboard/ui/button';
import { Badge } from '../../../components/dashboard/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/dashboard/ui/avatar';
import { Search, Send } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'client' | 'designer';
  }[];
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
}

const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    participants: [
      { id: 'client-001', name: 'Alice Johnson', role: 'client' },
      { id: 'designer-001', name: 'Designer User', role: 'designer' }
    ],
    lastMessage: {
      content: 'Can you share the logo preview?',
      timestamp: '2023-10-01T10:15:00',
      senderId: 'client-001'
    },
    unreadCount: 2
  },
  {
    id: 'conv-002',
    participants: [
      { id: 'client-002', name: 'Mark Lee', role: 'client' },
      { id: 'designer-001', name: 'Designer User', role: 'designer' }
    ],
    lastMessage: {
      content: 'Thanks! I’ll get back to you soon.',
      timestamp: '2023-10-01T09:45:00',
      senderId: 'designer-001'
    },
    unreadCount: 0
  }
];

const mockMessages: Message[] = [
  {
    id: 'msg-001',
    sender: 'Alice Johnson',
    senderId: 'client-001',
    content: 'Hey! Can you share the logo preview?',
    timestamp: '2023-10-01T10:15:00',
    read: false
  },
  {
    id: 'msg-002',
    sender: 'Designer User',
    senderId: 'designer-001',
    content: 'Sure! I’ll send it over in a few minutes.',
    timestamp: '2023-10-01T10:17:00',
    read: true
  }
];

const DesignerMessages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = React.useState<string | null>('conv-001');
  const [messageInput, setMessageInput] = React.useState('');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      toast.success('Message sent!');
      setMessageInput('');
    }
  };

  const getClientParticipant = (conversation: Conversation) =>
    conversation.participants.find(p => p.role === 'client') || conversation.participants[0];

  const getTimeString = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Chat with clients and manage your project discussions.</p>
      </div>

      <Card className="bg-secondary/30 border-border overflow-hidden font-sans">
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-border">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-8" />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(600px-65px)]">
              {mockConversations.map((conversation) => {
                const client = getClientParticipant(conversation);
                return (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 ${
                      selectedConversation === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={client.avatar} />
                        <AvatarFallback>{client.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-medium truncate">{client.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {getTimeString(conversation.lastMessage.timestamp)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="rounded-full px-1.5 py-0.5 text-xs min-w-[20px] text-center">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat window */}
          <div className="w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage />
                    <AvatarFallback>
                      {
                        getClientParticipant(
                          mockConversations.find(c => c.id === selectedConversation) || mockConversations[0]
                        ).name.slice(0, 2).toUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">
                    {
                      getClientParticipant(
                        mockConversations.find(c => c.id === selectedConversation) || mockConversations[0]
                      ).name
                    }
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {mockMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[70%] px-4 py-2 rounded-md ${
                        msg.senderId === 'designer-001'
                          ? 'bg-primary text-white self-end ml-auto'
                          : 'bg-muted text-foreground self-start'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className="text-xs text-muted-foreground text-right">
                        {getTimeString(msg.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-border flex items-center gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="px-3">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to view messages.
              </div>
            )}
          </div>
        </div>
      </Card>
    </MainLayout>
  );
};

export default DesignerMessages;
