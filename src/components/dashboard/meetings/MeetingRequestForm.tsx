
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../../../lib/utils';
import { CalendarIcon, Clock } from 'lucide-react';
import { Conversation } from '../../../pages/Dashboard/Progress';
import { Meeting } from '../../../types/meeting';

interface MeetingRequestFormProps {
  conversation: Conversation;
  onRequestMeeting: (meeting: Omit<Meeting, 'id' | 'status' | 'createdAt'>) => void;
  onCancel: () => void;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

const MeetingRequestForm: React.FC<MeetingRequestFormProps> = ({ 
  conversation, 
  onRequestMeeting, 
  onCancel 
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [agenda, setAgenda] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !startTime || !endTime) {
      return; // Form validation would be better in a real app
    }
    
    onRequestMeeting({
      projectId: conversation.projectId,
      projectName: conversation.projectName,
      projectType: conversation.projectType,
      requestedBy: {
        id: 'currentUser', // In a real app, this would be the current user's ID
        name: 'You'
      },
      date,
      startTime,
      endTime,
      agenda,
      discordLink: undefined
    });
  };
  
  // Calculate valid end times based on start time
  const validEndTimes = startTime 
    ? timeSlots.filter(time => time > startTime) 
    : [];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-1">Request Meeting</h3>
        <p className="text-sm text-muted-foreground">
          Schedule a meeting with the designer for your {conversation.projectType.toLowerCase()} project.
        </p>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="project">Project</Label>
          <Input 
            id="project" 
            value={`${conversation.projectName} - ${conversation.projectType}`} 
            disabled 
          />
        </div>
        
        <div>
          <Label>Meeting Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(date) => date < new Date()}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startTime && "text-muted-foreground"
                  )}
                  disabled={!date}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {startTime || <span>Select time</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <div className="p-2 border-b">
                  <h4 className="font-medium text-sm">Select start time</h4>
                </div>
                <div className="py-2 max-h-[200px] overflow-y-auto">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors",
                        startTime === time && "bg-muted font-medium"
                      )}
                      onClick={() => {
                        setStartTime(time);
                        setEndTime(''); // Reset end time when start time changes
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endTime && "text-muted-foreground"
                  )}
                  disabled={!startTime}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {endTime || <span>Select time</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <div className="p-2 border-b">
                  <h4 className="font-medium text-sm">Select end time</h4>
                </div>
                <div className="py-2 max-h-[200px] overflow-y-auto">
                  {validEndTimes.map(time => (
                    <button
                      key={time}
                      type="button"
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors",
                        endTime === time && "bg-muted font-medium"
                      )}
                      onClick={() => setEndTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div>
          <Label htmlFor="agenda">Agenda</Label>
          <Textarea 
            id="agenda" 
            placeholder="What would you like to discuss?" 
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button 
          type="submit"
          disabled={!date || !startTime || !endTime}
        >
          Request Meeting
        </Button>
      </div>
    </form>
  );
};

export default MeetingRequestForm;
