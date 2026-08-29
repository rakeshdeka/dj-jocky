
import React from 'react';
import { Button } from '../ui/button';

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  submittedAt: string;
}

interface SupportTicketsProps {
  tickets: Ticket[];
}

const SupportTickets: React.FC<SupportTicketsProps> = ({ tickets }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-500/10 text-blue-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'high':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const ticketTime = new Date(timestamp);
    const diffMs = now.getTime() - ticketTime.getTime();
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="p-3 rounded-lg bg-background/50 border border-border">
          <div className="flex justify-between items-start mb-1">
            <p className="font-medium">{ticket.title}</p>
            <span className={`${getPriorityColor(ticket.priority)} text-xs font-medium px-2 py-0.5 rounded`}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Submitted {getTimeAgo(ticket.submittedAt)}</span>
            <Button size="sm" variant="outline">View</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupportTickets;
