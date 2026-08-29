
export type FileType = 'branding' | 'web' | 'marketing' | 'packaging' | 'illustration';
export type FolderStatus = 'pending' | 'approved' | 'revision' | 'final';

export interface File {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface VersionFolder {
  id: string;
  name: string; // V1, V2, Final, etc.
  files: File[];
  comments: Comment[];
  status: FolderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  clientName: string;
  type: FileType;
  versions: VersionFolder[];
  status: FolderStatus;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}
