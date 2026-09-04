import { useRef, useState } from 'react';
import { FileText, Loader2, Paperclip, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_FILES = 10;

type ProgressMessageComposerProps = {
  isSending?: boolean;
  placeholder?: string;
  onSend: (content: string, files?: File[]) => void;
};

const ProgressMessageComposer = ({
  isSending = false,
  placeholder = 'Write a message...',
  onSend,
}: ProgressMessageComposerProps) => {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim() && selectedFiles.length === 0) return;
    if (message.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }
    onSend(message.trim(), selectedFiles.length > 0 ? selectedFiles : undefined);
    setMessage('');
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setSelectedFiles((prev) => {
      const combined = [...prev, ...Array.from(files)];
      if (combined.length > MAX_FILES) {
        toast.error(`You can attach up to ${MAX_FILES} files`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canSend =
    (message.trim().length > 0 || selectedFiles.length > 0) &&
    message.length <= MAX_MESSAGE_LENGTH &&
    !isSending;

  return (
    <div className="border-t border-border/60 bg-background/95 backdrop-blur-sm p-4 space-y-2">
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
                onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== index))}
                className="text-muted-foreground hover:text-foreground shrink-0"
                aria-label="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex items-end gap-2 bg-secondary/30 p-2 rounded-xl border border-border focus-within:border-[#C4FE01]/40 transition-all">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={placeholder}
          disabled={isSending}
          maxLength={MAX_MESSAGE_LENGTH}
          className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2 px-2 resize-none min-h-[42px] max-h-[150px] disabled:opacity-50"
          rows={1}
        />
        <div className="flex flex-col items-end gap-1 pb-1 pr-1">
          <span className="text-[10px] text-muted-foreground tabular-nums px-1">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isSending || selectedFiles.length >= MAX_FILES}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!canSend}
              className="h-8 w-8 bg-[#C4FE01] text-black hover:bg-[#b2e600] disabled:opacity-20 rounded-lg"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressMessageComposer;
