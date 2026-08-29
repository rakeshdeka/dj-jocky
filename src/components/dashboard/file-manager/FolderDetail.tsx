import React, { useState } from 'react';
import { Folder, VersionFolder, File, Comment, FolderStatus } from '../../../types/file-manager';
import { 
  ArrowLeft, 
  MessageSquare, 
  Download, 
  Share2, 
  MoreHorizontal, 
  X,
  Plus,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileCheck,
  Send,
  Upload
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar } from '../ui/avatar';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

interface FolderDetailProps {
  folder: Folder;
  onBack: () => void;
  onUpdate: (updatedFolder: Folder) => void;
}

const getStatusIcon = (status: FolderStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'approved':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'revision':
      return <RefreshCw className="h-4 w-4 text-red-500" />;
    case 'final':
      return <FileCheck className="h-4 w-4 text-blue-500" />;
  }
};

const getStatusLabel = (status: FolderStatus) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'revision':
      return 'Needs Revision';
    case 'final':
      return 'Finalized';
  }
};

const getStatusColor = (status: FolderStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/50';
    case 'approved':
      return 'bg-green-500/10 text-green-500 border-green-500/50';
    case 'revision':
      return 'bg-red-500/10 text-red-500 border-red-500/50';
    case 'final':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/50';
  }
};

const FolderDetail: React.FC<FolderDetailProps> = ({ folder, onBack, onUpdate }) => {
  const [activeVersion, setActiveVersion] = useState<string>(folder.versions[folder.versions.length - 1].id);
  const [newComment, setNewComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const currentVersion = folder.versions.find(v => v.id === activeVersion) || folder.versions[0];
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const updatedFolder = { ...folder };
    const versionIndex = updatedFolder.versions.findIndex(v => v.id === activeVersion);
    
    if (versionIndex !== -1) {
      const newCommentObj: Comment = {
        id: `comment-${Date.now()}`,
        content: newComment,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'You'
        }
      };
      
      updatedFolder.versions[versionIndex].comments.push(newCommentObj);
      onUpdate(updatedFolder);
      setNewComment('');
      
      toast.success('Comment added successfully');
    }
  };
  
  const handleStatusChange = (status: FolderStatus) => {
    const updatedFolder = { ...folder };
    const versionIndex = updatedFolder.versions.findIndex(v => v.id === activeVersion);
    
    if (versionIndex !== -1) {
      updatedFolder.versions[versionIndex].status = status;
      
      // If all versions are final, mark the folder as final
      if (status === 'final' && updatedFolder.versions.every(v => v.status === 'final')) {
        updatedFolder.status = 'final';
      } else if (status === 'revision') {
        updatedFolder.status = 'revision';
      } else if (status === 'approved') {
        updatedFolder.status = 'approved';
      } else {
        updatedFolder.status = 'pending';
      }
      
      onUpdate(updatedFolder);
      
      toast.success(`Status updated to ${getStatusLabel(status)}`);
    }
  };
  
  const handleFileUpload = () => {
    setIsUploading(true);
    
    // Simulate file upload delay
    setTimeout(() => {
      const updatedFolder = { ...folder };
      
      // Create a new version
      const newVersion: VersionFolder = {
        id: `version-${Date.now()}`,
        name: `V${folder.versions.length + 1}`,
        files: [
          {
            id: `file-${Date.now()}`,
            name: 'New_Design_Concept.pdf',
            url: '#',
            type: 'application/pdf',
            size: 2500000,
            createdAt: new Date().toISOString(),
            createdBy: {
              id: 'current-user',
              name: 'You'
            }
          }
        ],
        comments: [],
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      updatedFolder.versions.push(newVersion);
      updatedFolder.updatedAt = new Date().toISOString();
      
      onUpdate(updatedFolder);
      setActiveVersion(newVersion.id);
      setIsUploading(false);
      
      toast.success('New version created successfully');
    }, 1500);
  };
  
  const handleDownloadFile = (file: File) => {
    toast.success(`Downloading ${file.name}`);
  };
  
  const handleShareFile = (file: File) => {
    toast.success(`Link copied to clipboard for ${file.name}`);
  };
  
  const handleBulkDownload = () => {
    toast.success(`Downloading all files from ${currentVersion.name}`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{folder.name}</h2>
            <p className="text-muted-foreground">{folder.clientName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("flex items-center gap-1 px-3 py-1", getStatusColor(folder.status))}>
            {getStatusIcon(folder.status)}
            {getStatusLabel(folder.status)}
          </Badge>
          
          <Button
            variant="outline"
            onClick={handleBulkDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download All
          </Button>
          
          {/* <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast.success('Sharing link copied to clipboard')}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          
          <Button
            variant="default"
            className="gap-2"
            onClick={handleFileUpload}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button> */}
        </div>
      </div>
      
      {/* Tabs for versions */}
      <Tabs value={activeVersion} onValueChange={setActiveVersion} className="w-full">
        <TabsList className="w-full justify-start bg-muted/50 p-0 h-auto">
          {folder.versions.map((version) => (
            <TabsTrigger
              key={version.id}
              value={version.id}
              className={`data-[state=active]:bg-background px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary`}
            >
              <div className="flex items-center gap-2">
                {version.name}
                <Badge variant="outline" className={cn("h-5 px-1", getStatusColor(version.status))}>
                  {getStatusIcon(version.status)}
                </Badge>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {folder.versions.map((version) => (
          <TabsContent key={version.id} value={version.id} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Files section */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Files ({version.files.length})</h3>
             
                </div>
                
                {version.files.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-2">
                    {version.files.map((file) => (
                      <Card key={file.id} className="overflow-hidden group">
                        <div className="bg-muted h-24 flex items-center justify-center">
                          {file.type.includes('image') ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-6xl text-muted-foreground">{file.type.split('/')[1].toUpperCase()}</div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{file.name}</p>
                              <div className="text-xs text-muted-foreground">
                                {(file.size / 1000000).toFixed(2)} MB • {format(new Date(file.createdAt), 'MMM d, yyyy')}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7" 
                                onClick={() => handleDownloadFile(file)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7" 
                                onClick={() => handleShareFile(file)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">No files uploaded yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={handleFileUpload}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Comments section */}
              {/* <div className="space-y-4">
                <h3 className="text-lg font-medium">Comments ({version.comments.length})</h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <Textarea 
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="flex justify-end mb-6">
                  <Button 
                    variant="default" 
                    className="gap-2"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                    Post
                  </Button>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {version.comments.length > 0 ? (
                    version.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 group">
                        <Avatar className="h-8 w-8 bg-primary flex-shrink-0">
                          <div className="text-xs text-primary-foreground">
                            {comment.createdBy.name.charAt(0)}
                          </div>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium">{comment.createdBy.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-muted/30 rounded-lg">
                      <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No comments yet</p>
                    </div>
                  )}
                </div>
              </div> */}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FolderDetail;
