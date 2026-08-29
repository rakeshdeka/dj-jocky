
import React from 'react';
import { MoreHorizontal, Plus, File } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface FolderCardProps {
  title: string
  onUpload: () => void
}

const FolderCard: React.FC<FolderCardProps> = ({ title, onUpload }) => {
  return (
    <div className="relative group">
      <div className="rounded-md border border-border bg-background p-4 h-[120px] flex flex-col items-center justify-center space-y-2 transition-all hover:border-primary/40">
        <File className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Empty folder</p>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onUpload}>
              <Plus className="mr-2 h-4 w-4" />
              Upload files
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 text-sm font-medium">{title}</div>
    </div>
  )
}

export default FolderCard
