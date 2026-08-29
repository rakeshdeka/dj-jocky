
import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  Clock, 
  Download, 
  ExternalLink, 
  Eye, 
  FileText, 
  History, 
  Image as ImageIcon, 
  MessageCircle, 
  MoreHorizontal, 
  Paperclip, 
  Share2, 
  ThumbsUp, 
  X
} from 'lucide-react';

interface FileVersion {
  id: string;
  filename: string;
  uploadedBy: string;
  timestamp: string;
  url: string;
}

export interface FileAttachmentProps {
  filename: string;
  isPdf?: boolean;
  isImage?: boolean;
  url?: string;
  timestamp: string;
  uploadedBy: string;
  versions?: FileVersion[];
  onPreview?: () => void;
  onApprove?: () => void;
  onDownload?: () => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  filename,
  isPdf = false,
  isImage = false,
  url = "#",
  timestamp,
  uploadedBy,
  versions = [],
  onPreview,
  onApprove,
  onDownload
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{id: string; text: string; author: string; timestamp: string}[]>([]);

  const handleAddComment = () => {
    if (commentText.trim()) {
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          text: commentText,
          author: 'You',
          timestamp: new Date().toLocaleDateString()
        }
      ]);
      setCommentText('');
    }
  };

  const handleShareLink = () => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(`https://designjockey.com/file/${filename.replace(/\s/g, '-')}`);
    // You'd typically show a toast notification here
    console.log('Link copied to clipboard');
  };

  const FileIcon = () => {
    if (isImage) return <ImageIcon className="h-5 w-5" />;
    if (isPdf) return <FileText className="h-5 w-5" />;
    return <Paperclip className="h-5 w-5" />;
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 p-3 bg-muted rounded-md text-sm">
        <FileIcon />
        <span className="flex-1 truncate font-medium">{filename}</span>
        
        <div className="flex items-center gap-1">
          {/* Version history */}
          {versions.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <History className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0">
                <div className="p-3 border-b">
                  <h4 className="font-medium">Version History</h4>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {versions.map((version, index) => (
                    <div 
                      key={version.id} 
                      className="p-3 border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Version {versions.length - index}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded by {version.uploadedBy} • {version.timestamp}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          {/* File actions */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={onPreview || (() => setShowPreview(true))}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={onDownload || (() => console.log('Download clicked'))}
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0">
              <div className="py-1">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                  onClick={onApprove || (() => console.log('Approve clicked'))}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Approve
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                  onClick={handleShareLink}
                >
                  <Share2 className="h-4 w-4" />
                  Share Link
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Add Comment
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* File Preview */}
      {showPreview && (
        <div className="mt-2 relative border rounded-md overflow-hidden">
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-background/80 backdrop-blur-sm"
              onClick={() => setShowPreview(false)}
            >
              <X className="h-4 w-4 mr-1" /> Close
            </Button>
            {onApprove && (
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-background/80 backdrop-blur-sm"
                onClick={onApprove}
              >
                <ThumbsUp className="h-4 w-4 mr-1" /> Approve
              </Button>
            )}
          </div>
          
          {isImage ? (
            <img src={url} alt={filename} className="w-full h-auto max-h-[400px] object-contain bg-muted/50" />
          ) : isPdf ? (
            <div className="h-[400px] flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">PDF Preview Not Available</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={onDownload || (() => console.log('Download clicked'))}
                >
                  <Download className="h-4 w-4 mr-1" /> Download to View
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <Paperclip className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Preview Not Available</p>
              </div>
            </div>
          )}
          
          {/* Comments section */}
          <div className="p-4 border-t bg-card">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Comments
            </h4>
            
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="bg-muted p-2 rounded-md">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{comment.author}</span>
                      <span>{comment.timestamp}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-1 text-sm bg-muted border border-border rounded"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-1 flex text-xs text-muted-foreground">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>{timestamp}</span>
        </div>
        <span className="mx-1">•</span>
        <span>Uploaded by {uploadedBy}</span>
      </div>
    </div>
  );
};

export default FileAttachment;
