
import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Conversation } from '../../../pages/Dashboard/Progress';
import { Brain, Calendar, CheckCircle, Clock, Flag, ThumbsUp, X } from 'lucide-react';

interface ConversationSummaryProps {
  conversation: Conversation;
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({
  conversation
}) => {
  const [expanded, setExpanded] = useState(true);
  
  // Calculate insights from conversation data
  const pendingApprovals = conversation.messages
    .filter(msg => msg.status === 'Awaiting Feedback')
    .length;
  
  const revisionNeeded = conversation.messages
    .filter(msg => msg.status === 'Revision Needed')
    .length;
  
  const hasAttachments = conversation.messages
    .some(msg => msg.attachments && msg.attachments.length > 0);

  // Generate a mock deadline - in a real app this would be from the project data
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  const formattedDeadline = deadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Generate mock summarized text - in a real app this would use AI
  const generateSummary = () => {
    const lastStatus = conversation.lastMessage.status || 'In Progress';
    
    let summary = `This ${conversation.projectType} project is currently ${lastStatus.toLowerCase()}. `;
    
    if (pendingApprovals > 0) {
      summary += `There are ${pendingApprovals} items awaiting feedback. `;
    }
    
    if (revisionNeeded > 0) {
      summary += `${revisionNeeded} items need revision. `;
    }
    
    if (hasAttachments) {
      summary += `The latest designs have been uploaded and are ready for review. `;
    }
    
    summary += `Project deadline is ${formattedDeadline}.`;
    
    return summary;
  };

  return (
    <div className={`bg-muted/30 rounded-md border p-3 mb-4 transition-all ${expanded ? '' : 'max-h-12 overflow-hidden'}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">AI Summary</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <X className="h-3 w-3" /> : <Brain className="h-3 w-3" />}
        </Button>
      </div>
      
      {expanded && (
        <>
          <p className="mt-2 text-sm">{generateSummary()}</p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {pendingApprovals > 0 && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
                <ThumbsUp className="h-3 w-3 mr-1" /> {pendingApprovals} Pending Approvals
              </Badge>
            )}
            
            {revisionNeeded > 0 && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500">
                <Flag className="h-3 w-3 mr-1" /> {revisionNeeded} Need Revision
              </Badge>
            )}
            
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" /> Due {formattedDeadline}
            </Badge>
            
            <Badge variant="outline" className={
              conversation.lastMessage.status === 'Finalized'
                ? 'bg-green-500/10 text-green-500 border-green-500'
                : ''
            }>
              <CheckCircle className="h-3 w-3 mr-1" /> 
              Status: {conversation.lastMessage.status || 'In Progress'}
            </Badge>
          </div>
          
          <Accordion type="single" collapsible className="mt-2">
            <AccordionItem value="timeline" className="border-none">
              <AccordionTrigger className="py-1 text-xs font-normal text-muted-foreground hover:no-underline">
                View Project Timeline
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-2 border-l-2 border-muted">
                  {conversation.messages.map((msg, index) => (
                    <div key={index} className="relative pl-4 text-xs">
                      <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-primary"></div>
                      <p className="font-medium">{msg.timestamp} - {msg.senderName}</p>
                      <p className="text-muted-foreground truncate">{msg.content.substring(0, 60)}...</p>
                      {msg.status && (
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {msg.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </div>
  );
};

export default ConversationSummary;
