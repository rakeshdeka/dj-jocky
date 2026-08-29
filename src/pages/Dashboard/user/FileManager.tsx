
import React, { useState, useEffect } from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Folder, FileType, FolderStatus, VersionFolder } from '../../../types/file-manager';
import { FolderPlus } from 'lucide-react';
import { Button } from '../../../components/dashboard/ui/button';
import FolderGrid from '../../../components/dashboard/file-manager/FolderGrid';
import FolderDetail from '../../../components/dashboard/file-manager/FolderDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/dashboard/ui/dialog';
import { Input } from '../../../components/dashboard/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/dashboard/ui/select';
import { toast } from 'sonner';

const generateMockFolders = (): Folder[] => {
  const types: FileType[] = ['branding', 'web', 'marketing', 'packaging', 'illustration'];
  const statuses: FolderStatus[] = ['pending', 'approved', 'revision', 'final'];
  const clients = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Corp', 'Stark Industries'];
  
  return Array.from({ length: 12 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const client = clients[Math.floor(Math.random() * clients.length)];
    
    // Generate between 1-3 versions
    const versionCount = Math.floor(Math.random() * 3) + 1;
    const versions: VersionFolder[] = Array.from({ length: versionCount }, (_, j) => {
      return {
        id: `version-${i}-${j}`,
        name: `V${j + 1}`,
        files: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, k) => ({
          id: `file-${i}-${j}-${k}`,
          name: `File_${k + 1}.pdf`,
          url: '#',
          type: 'application/pdf',
          size: Math.random() * 5000000,
          createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          createdBy: {
            id: 'user-1',
            name: 'John Designer'
          }
        })),
        comments: Array.from({ length: Math.floor(Math.random() * 3) }, (_, k) => ({
          id: `comment-${i}-${j}-${k}`,
          content: `This is a comment for version ${j + 1}, comment number ${k + 1}.`,
          createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          createdBy: {
            id: k % 2 === 0 ? 'user-1' : 'user-2',
            name: k % 2 === 0 ? 'John Designer' : 'Emily Client'
          }
        })),
        status: j === versionCount - 1 ? status : 'approved',
        createdAt: new Date(Date.now() - (10000000000 - j * 1000000000)).toISOString(),
        updatedAt: new Date(Date.now() - (10000000000 - j * 1000000000) + 86400000).toISOString()
      };
    });
    
    return {
      id: `folder-${i}`,
      name: `${client} - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      clientName: client,
      type,
      versions,
      status,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
    };
  });
};

const FileManager: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderClient, setNewFolderClient] = useState('');
  const [newFolderType, setNewFolderType] = useState<FileType>('branding');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    // Load mock data
    setFolders(generateMockFolders());
  }, []);
  
  const handleFolderClick = (folder: Folder) => {
    setSelectedFolder(folder);
  };
  
  const handleBack = () => {
    setSelectedFolder(null);
  };
  
  const handleUpdateFolder = (updatedFolder: Folder) => {
    setFolders(prevFolders => 
      prevFolders.map(folder => 
        folder.id === updatedFolder.id ? updatedFolder : folder
      )
    );
    setSelectedFolder(updatedFolder);
  };
  
  const handleCreateFolder = () => {
    if (!newFolderName.trim() || !newFolderClient.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: `${newFolderClient} - ${newFolderType.charAt(0).toUpperCase() + newFolderType.slice(1)}`,
      clientName: newFolderClient,
      type: newFolderType,
      versions: [
        {
          id: `version-${Date.now()}`,
          name: 'V1',
          files: [],
          comments: [],
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setFolders(prevFolders => [newFolder, ...prevFolders]);
    setIsDialogOpen(false);
    setNewFolderName('');
    setNewFolderClient('');
    setNewFolderType('branding');
    
    toast.success('Folder created successfully');
  };

  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">File Manager</h1>
      </div>
      
      {selectedFolder ? (
        <FolderDetail
          folder={selectedFolder}
          onBack={handleBack}
          onUpdate={handleUpdateFolder}
        />
      ) : (
        <FolderGrid 
          folders={folders}
          onFolderClick={handleFolderClick}
        />
      )}
    </MainLayout>
  );
};

export default FileManager;
