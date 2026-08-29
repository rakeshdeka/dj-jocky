
import React from 'react';
import { Folder, FolderStatus } from '../../../types/file-manager';
import { 
  FolderIcon, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  FileCheck,
  MoreHorizontal, 
  Users,
  Share2
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '../../../lib/utils';

interface FolderCardProps {
  folder: Folder;
  view: 'grid' | 'list';
  onClick: () => void;
}

const getStatusIcon = (status: FolderStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    case 'approved':
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    case 'revision':
      return <RefreshCw className="h-3.5 w-3.5 text-red-500" />;
    case 'final':
      return <FileCheck className="h-3.5 w-3.5 text-blue-500" />;
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

const getFileTypeColor = (type: Folder['type']) => {
  switch (type) {
    case 'branding':
      return 'bg-purple-500';
    case 'web':
      return 'bg-blue-500';
    case 'marketing':
      return 'bg-green-500';
    case 'packaging':
      return 'bg-amber-500';
    case 'illustration':
      return 'bg-red-500';
  }
};

const FolderCard: React.FC<FolderCardProps> = ({ folder, view, onClick }) => {
  const latestVersion = folder.versions[folder.versions.length - 1];
  const fileCount = folder.versions.reduce((count, version) => count + version.files.length, 0);
  
  if (view === 'list') {
    return (
      <div 
        className="flex items-center p-3 hover:bg-[#C4FE01]/50 rounded-lg cursor-pointer transition-colors"
        onClick={onClick}
      >
        <div className={`h-10 w-10 rounded-md flex items-center justify-center text-white ${getFileTypeColor(folder.type)}`}>
          <FolderIcon className="h-5 w-5" />
        </div>
        
        <div className="ml-3 flex-grow">
          <div className="font-medium">{folder.name}</div>
          <div className="text-xs text-muted-foreground">
            {folder.clientName} • {fileCount} files • Updated {format(new Date(folder.updatedAt), 'MMM d, yyyy')}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("flex items-center gap-1", getStatusColor(folder.status))}>
            {getStatusIcon(folder.status)}
            {getStatusLabel(folder.status)}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share folder
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="h-4 w-4 mr-2" />
                Manage access
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="group relative border border-border bg-card overflow-hidden rounded-lg hover:border-[#C4FE01]/50 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Share2 className="h-4 w-4 mr-2" />
              Share folder
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="h-4 w-4 mr-2" />
              Manage access
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="outline" className={cn("flex items-center gap-1", getStatusColor(folder.status))}>
          {getStatusIcon(folder.status)}
          {getStatusLabel(folder.status)}
        </Badge>
      </div>
      
      <div className="h-28 flex items-center justify-center bg-muted">
        {folder.thumbnail ? (
          <img 
            src={folder.thumbnail} 
            alt={folder.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`h-16 w-16 rounded-md flex items-center justify-center text-white ${getFileTypeColor(folder.type)}`}>
            <FolderIcon className="h-10 w-10" />
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium truncate">{folder.name}</h3>
        <div className="text-xs text-muted-foreground">
          {folder.clientName}
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>{fileCount} files</span>
          <span>{folder.versions.length} versions</span>
        </div>
      </div>
    </div>
  );
};

export default FolderCard;
