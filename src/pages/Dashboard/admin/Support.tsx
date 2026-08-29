
import React from 'react';
import { toast } from 'sonner';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Button } from '../../../components/dashboard/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/dashboard/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/dashboard/ui/select';
import { Input } from '../../../components/dashboard/ui/input';
import { Badge } from '../../../components/dashboard/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/dashboard/ui/avatar';
import { 
  CheckCircle2, 
  Clock, 
  Filter, 
  MessageSquare, 
  MoreHorizontal, 
  RefreshCcw, 
  Search, 
  Send, 
  UserCog 
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  submittedBy: {
    name: string;
    email: string;
    avatar?: string;
    role: 'client' | 'designer' | 'admin';
  };
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  lastUpdated: string;
  assignedTo?: string;
  messages: {
    id: string;
    sender: string;
    senderRole: 'client' | 'designer' | 'admin' | 'system';
    content: string;
    timestamp: string;
  }[];
}

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'Payment processing issue',
    description: 'I am unable to update my credit card details on the subscription page.',
    submittedBy: {
      name: 'John Davies',
      email: 'john@example.com',
      role: 'client'
    },
    status: 'open',
    priority: 'high',
    category: 'Billing',
    createdAt: '2023-09-29T15:30:00',
    lastUpdated: '2023-09-29T15:30:00',
    messages: [
      {
        id: 'msg-001',
        sender: 'John Davies',
        senderRole: 'client',
        content: 'I am trying to update my credit card details for the Business Pro subscription, but I keep getting an error message saying "Invalid card details" even though the card works fine on other sites.',
        timestamp: '2023-09-29T15:30:00'
      },
      {
        id: 'msg-002',
        sender: 'System',
        senderRole: 'system',
        content: 'Ticket created and assigned to Support Team',
        timestamp: '2023-09-29T15:30:00'
      }
    ]
  },
  {
    id: 'TKT-002',
    subject: 'Designer account access',
    description: 'I need to reset my 2FA for my designer account',
    submittedBy: {
      name: 'Sarah Lee',
      email: 'sarah@example.com',
      role: 'designer'
    },
    status: 'in_progress',
    priority: 'medium',
    category: 'Account',
    createdAt: '2023-09-29T12:15:00',
    lastUpdated: '2023-09-29T13:45:00',
    assignedTo: 'Robert Johnson',
    messages: [
      {
        id: 'msg-003',
        sender: 'Sarah Lee',
        senderRole: 'designer',
        content: 'I got a new phone and lost access to my authenticator app. I need to reset my 2FA to regain access to my designer account.',
        timestamp: '2023-09-29T12:15:00'
      },
      {
        id: 'msg-004',
        sender: 'Robert Johnson',
        senderRole: 'admin',
        content: 'I\'ll help you with that. Can you please verify your identity by confirming the email address associated with your account and the last project you worked on?',
        timestamp: '2023-09-29T13:45:00'
      }
    ]
  },
  {
    id: 'TKT-003',
    subject: 'Feature request',
    description: 'Add Figma integration to design pipeline',
    submittedBy: {
      name: 'Emily Parker',
      email: 'emily@example.com',
      role: 'designer'
    },
    status: 'resolved',
    priority: 'low',
    category: 'Feature Request',
    createdAt: '2023-09-27T10:20:00',
    lastUpdated: '2023-09-28T16:30:00',
    assignedTo: 'Robert Johnson',
    messages: [
      {
        id: 'msg-005',
        sender: 'Emily Parker',
        senderRole: 'designer',
        content: 'It would be great if we could integrate Figma directly into the design workflow. This would streamline our process significantly.',
        timestamp: '2023-09-27T10:20:00'
      },
      {
        id: 'msg-006',
        sender: 'Robert Johnson',
        senderRole: 'admin',
        content: 'Thanks for the suggestion! We\'re actually planning to implement Figma integration in our next update. I\'ll add your request to our product roadmap.',
        timestamp: '2023-09-27T14:10:00'
      },
      {
        id: 'msg-007',
        sender: 'Emily Parker',
        senderRole: 'designer',
        content: 'That\'s great news! Looking forward to the update.',
        timestamp: '2023-09-28T09:15:00'
      },
      {
        id: 'msg-008',
        sender: 'Robert Johnson',
        senderRole: 'admin',
        content: 'I\'ve added you to our beta testers list. You\'ll be among the first to try out the new feature when it\'s ready.',
        timestamp: '2023-09-28T16:30:00'
      }
    ]
  }
];

const AdminSupport: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = React.useState<string | null>('TKT-001');
  const [messageInput, setMessageInput] = React.useState('');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      toast.success('Response sent!');
      setMessageInput('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500 hover:bg-blue-600 font-sans">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500">High</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const ticketTime = new Date(timestamp);
    const diffMs = now.getTime() - ticketTime.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
        <p className="text-muted-foreground">
          Manage and respond to customer support requests
        </p>
      </div>

      <div className="flex justify-between items-center mb-6 font-sans">
        <div className="flex items-center gap-4">
          <Tabs defaultValue="all" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select defaultValue="newest font-sans">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tickets..." className="pl-8" />
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCcw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <Card className="bg-secondary/30 border-border overflow-hidden font-sans">
        <div className="flex h-[700px]">
          <div className="w-1/3 border-r border-border overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1">
              {mockTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 ${
                    selectedTicket === ticket.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket.id)}
                >
                  <div className="mb-2 flex justify-between items-start">
                    <p className="font-medium truncate">{ticket.subject}</p>
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-muted-foreground truncate">
                      ID: {ticket.id} • {ticket.category}
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div>From: {ticket.submittedBy.name}</div>
                    <div>{getTimeAgo(ticket.lastUpdated)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedTicket ? (
            <div className="w-2/3 flex flex-col">
              {(() => {
                const ticket = mockTickets.find(t => t.id === selectedTicket);
                if (!ticket) return null;
                
                return (
                  <>
                    <div className="p-4 border-b border-border flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium mb-1">{ticket.subject}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Ticket {ticket.id}</span>
                          <span>•</span>
                          <span>Submitted {getTimeAgo(ticket.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select defaultValue={ticket.status}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className='font-sans'>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border-b border-border bg-muted/30">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={ticket.submittedBy.avatar} />
                            <AvatarFallback>{ticket.submittedBy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{ticket.submittedBy.name}</p>
                            <p className="text-xs text-muted-foreground">{ticket.submittedBy.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(ticket.priority)}
                          <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
                        </div>
                      </div>
                      <p className="text-sm">{ticket.description}</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {ticket.messages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <div className="flex-shrink-0">
                            {message.senderRole === 'system' ? (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ) : (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{message.sender.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <div className={`flex-1 p-3 rounded-lg ${
                            message.senderRole === 'admin' 
                              ? 'bg-primary text-primary-foreground' 
                              : message.senderRole === 'system'
                                ? 'bg-muted/50'
                                : 'bg-muted'
                          }`}>
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-medium">{message.sender}</p>
                              <p className="text-xs">
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 border-t border-border">
                      <div className="flex items-end gap-3">
                        <div className="flex-grow">
                          <Input
                            placeholder="Type your response..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSendMessage();
                              }
                            }}
                            className="min-h-[80px]"
                          />
                        </div>
                        <div className="flex-shrink-0 flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Internal Note
                          </Button>
                          <Button 
                            onClick={handleSendMessage} 
                            size="sm"
                            disabled={!messageInput.trim()}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Reply
                          </Button>
                        </div>
                      </div>
                      {ticket.assignedTo ? (
                        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                          <UserCog className="h-3 w-3" />
                          <span>Assigned to {ticket.assignedTo}</span>
                        </div>
                      ) : (
                        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            <UserCog className="h-3 w-3 mr-1" />
                            Assign ticket
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="w-2/3 flex items-center justify-center">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No ticket selected</h3>
                <p className="text-muted-foreground">Select a ticket from the list to view details and respond</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </MainLayout>
  );
};

export default AdminSupport;
