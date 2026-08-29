
import React, { useState, useRef, useEffect } from 'react';
// import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { AtSign } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
}

const sampleUsers: User[] = [
  { id: 'u1', name: 'Alex Johnson' },
  { id: 'u2', name: 'Sarah Williams' },
  { id: 'u3', name: 'Carlos Rodriguez' },
  { id: 'u4', name: 'Dhrubo Hasan' },
  { id: 'u5', name: 'Maria Garcia' },
  { id: 'u6', name: 'John Smith' },
  { id: 'u7', name: 'Emma Davis' },
];

const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder = 'Type your message...',
  minRows = 3,
  className = '',
}) => {
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionStartPos, setMentionStartPos] = useState(-1);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(sampleUsers);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mentionQuery) {
      setFilteredUsers(
        sampleUsers.filter(user => 
          user.name.toLowerCase().includes(mentionQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(sampleUsers);
    }
  }, [mentionQuery]);

  useEffect(() => {
    const checkForMention = () => {
      if (!inputRef.current) return;
      
      const selectionStart = inputRef.current.selectionStart;
      const textBeforeCursor = value.substring(0, selectionStart);
      const matches = textBeforeCursor.match(/@(\w*)$/);
      
      if (matches) {
        setMentionQuery(matches[1]);
        setMentionStartPos(selectionStart - matches[0].length);
        setShowMentionList(true);
      } else {
        setShowMentionList(false);
      }
    };

    checkForMention();
  }, [value, cursorPosition]);

  const handleSelect = (user: User) => {
    if (mentionStartPos >= 0) {
      const before = value.substring(0, mentionStartPos);
      const after = value.substring(inputRef.current?.selectionStart || 0);
      const newValue = `${before}@${user.name} ${after}`;
      
      onChange(newValue);
      setShowMentionList(false);
      
      // Reset for next mention
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPosition = mentionStartPos + user.name.length + 2; // +2 for @ and space
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
          setCursorPosition(newCursorPosition);
        }
      }, 0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow navigation in the mention list with arrow keys
    if (showMentionList && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter')) {
      if (e.key === 'Enter' && filteredUsers.length > 0) {
        e.preventDefault();
        handleSelect(filteredUsers[0]);
      }
      e.preventDefault();
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClick={() => setCursorPosition(inputRef.current?.selectionStart || 0)}
        placeholder={placeholder}
        className={`min-h-[80px] ${className}`}
      />
      
      {showMentionList && (
        <div 
          ref={popoverRef}
          className="absolute z-50 mt-1 w-64 bg-popover border border-border rounded-md shadow-md"
        >
          <div className="p-2 border-b text-xs font-medium text-muted-foreground">
            <AtSign className="h-3 w-3 inline-block mr-1" />
            Mention a team member
          </div>
          <ScrollArea className="max-h-48">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                  onClick={() => handleSelect(user)}
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span>{user.name}</span>
                </button>
              ))
            ) : (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No users found
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default MentionInput;
