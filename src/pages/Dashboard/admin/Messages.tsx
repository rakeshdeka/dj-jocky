
import React from 'react';
import { toast } from 'sonner';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Input } from '../../../components/dashboard/ui/input';
import { Button } from '../../../components/dashboard/ui/button';
import { Badge } from '../../../components/dashboard/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/dashboard/ui/avatar';
import { Search, Send, PaperclipIcon, Smile, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

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
      { id: 'user-001', name: 'John Davies', avatar: undefined, role: 'client' },
      { id: 'user-admin', name: 'Admin User', avatar: undefined, role: 'admin' }
    ],
    lastMessage: {
      content: 'I need help with my subscription',
      timestamp: '2023-09-30T14:30:00',
      senderId: 'user-001'
    },
    unreadCount: 3
  },
  {
    id: 'conv-002',
    participants: [
      { id: 'user-002', name: 'Sarah Lee', avatar: undefined, role: 'designer' },
      { id: 'user-admin', name: 'Admin User', avatar: undefined, role: 'admin' }
    ],
    lastMessage: {
      content: 'Can you review my designer application?',
      timestamp: '2023-09-30T12:15:00',
      senderId: 'user-002'
    },
    unreadCount: 1
  },
  {
    id: 'conv-003',
    participants: [
      { id: 'user-003', name: 'Emily Parker', avatar: undefined, role: 'designer' },
      { id: 'user-admin', name: 'Admin User', avatar: undefined, role: 'admin' }
    ],
    lastMessage: {
      content: 'Thanks for approving my account!',
      timestamp: '2023-09-29T16:45:00',
      senderId: 'user-003'
    },
    unreadCount: 0
  },
  {
    id: 'conv-004',
    participants: [
      { id: 'user-004', name: 'Michael Johnson', avatar: undefined, role: 'client' },
      { id: 'user-admin', name: 'Admin User', avatar: undefined, role: 'admin' }
    ],
    lastMessage: {
      content: 'I have a question about billing',
      timestamp: '2023-09-28T09:20:00',
      senderId: 'user-004'
    },
    unreadCount: 0
  }
];

const mockMessages: Message[] = [
  {
    id: 'msg-001',
    sender: 'John Davies',
    senderId: 'user-001',
    content: 'Hi there, I need help with my subscription plan.',
    timestamp: '2023-09-30T14:30:00',
    read: false
  },
  {
    id: 'msg-002',
    sender: 'Admin User',
    senderId: 'user-admin',
    content: 'Hello John, I\'d be happy to help with your subscription. What seems to be the issue?',
    timestamp: '2023-09-30T14:35:00',
    read: true
  },
  {
    id: 'msg-003',
    sender: 'John Davies',
    senderId: 'user-001',
    content: 'I want to upgrade from the Basic to the Business plan, but I\'m getting an error when I try to do it through the dashboard.',
    timestamp: '2023-09-30T14:40:00',
    read: false
  },
  {
    id: 'msg-004',
    sender: 'John Davies',
    senderId: 'user-001',
    content: 'It says "Payment method not supported" but I\'m using the same card that I used before.',
    timestamp: '2023-09-30T14:41:00',
    read: false
  }
];

const AdminMessages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = React.useState<string | null>('conv-001');
  const [messageInput, setMessageInput] = React.useState('');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      toast.success('Message sent!');
      setMessageInput('');
    }
  };

  const getParticipantExcludingAdmin = (conversation: Conversation) => {
    return conversation.participants.find(p => p.role !== 'admin') || conversation.participants[0];
  };

  const getTimeString = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDateString = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Message Center</h1>
        <p className="text-muted-foreground">
          Manage communications with clients and designers
        </p>
      </div>

      <Card className="bg-secondary/30 border-border overflow-hidden font-sans">
        <div className="flex h-[600px]">
          {/* Conversation List */}
          <div className="w-1/3 border-r border-border">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto h-[calc(600px-65px)]">
              {mockConversations.map((conversation) => {
                const participant = getParticipantExcludingAdmin(conversation);
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
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-medium truncate">{participant.name}</div>
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
          
          {/* Message View */}
          <div className="w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={
                        getParticipantExcludingAdmin(
                          mockConversations.find(c => c.id === selectedConversation) || mockConversations[0]
                        ).avatar
                      } />
                      <AvatarFallback>
                        {getParticipantExcludingAdmin(
                          mockConversations.find(c => c.id === selectedConversation) || mockConversations[0]
                        ).name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {getParticipantExcludingAdmin(
                          mockConversations.find(c => c.id === selectedConversation) || mockConversations[0]
                        ).name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getParticipantExcludingAdmin(
                          mockConversations.find(c => c.id === selectedConversation) || mockConversations[0]
                        ).role}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Button variant="ghost" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {mockMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === 'user-admin' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.senderId === 'user-admin'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'user-admin'
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground'
                        }`}>
                          {getTimeString(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <PaperclipIcon className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button 
                      onClick={handleSendMessage} 
                      size="icon"
                      disabled={!messageInput.trim()}
                      className="shrink-0"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </MainLayout>
  );
};

export default AdminMessages;
