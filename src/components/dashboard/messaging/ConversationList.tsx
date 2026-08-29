"use client"

import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle2, Clock, MessageSquareText } from 'lucide-react';

interface ConversationListProps {
  conversations: any[]; // These are your "Briefs"
  onSelectConversation: (brief: any) => void;
  selectedId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  onSelectConversation,
  selectedId
}) => {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-border rounded-2xl opacity-60">
        <MessageSquareText className="h-8 w-8 mb-3 text-muted-foreground" />
        <p className="text-sm font-medium tracking-tight">No active projects</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Ready when you are</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((brief) => {
        const isActive = selectedId === brief._id;
        
        return (
          <div
            key={brief._id}
            onClick={() => onSelectConversation(brief)}
            className={`group relative p-4 rounded-2xl cursor-pointer transition-all border ${
              isActive 
                ? 'bg-secondary/80 border-[#c5fb00] shadow-lg shadow-[#c5fb00]/5' 
                : 'bg-card/40 border-border hover:border-muted-foreground/40 hover:bg-card/60'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col gap-0.5">
                <h3 className={`font-bold text-sm tracking-tight transition-colors ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-white'}`}>
                  {brief.title}
                </h3>
                <span className="text-[10px] font-bold text-[#c5fb00] uppercase tracking-widest opacity-80">
                  {brief.service_id?.name || 'Project'}
                </span>
              </div>
              <Badge 
                variant="outline" 
                className={`text-[9px] h-5 uppercase px-1.5 border-none font-black ${
                  brief.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-400'
                }`}
              >
                {brief.status === 'assigned' ? <Clock className="h-2.5 w-2.5 mr-1" /> : <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                {brief.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex -space-x-2">
                 <div className="h-5 w-5 rounded-full border border-background bg-muted flex items-center justify-center text-[8px] font-bold">
                   {brief.client_id?.name?.charAt(0) || 'C'}
                 </div>
                 <div className="h-5 w-5 rounded-full border border-background bg-[#c5fb00] flex items-center justify-center text-[8px] font-bold text-black">
                   D
                 </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                {brief.priority === 'high' ? '⚡ High' : 'Standard'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;