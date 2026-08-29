
import React from 'react';
import { Folder, FileType, FolderStatus } from '../../../types/file-manager';
import { Grid, List, Search, Filter, SortDesc, SortAsc } from 'lucide-react';
import { Button } from '../ui/button';
import FolderCard from '../file-manager/FolderCard';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface FolderGridProps {
  folders: Folder[];
  onFolderClick: (folder: Folder) => void;
}

const FolderGrid: React.FC<FolderGridProps> = ({ folders, onFolderClick }) => {
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = React.useState<FolderStatus | 'all'>('all');
  const [filterType, setFilterType] = React.useState<FileType | 'all'>('all');

  // Filter and sort folders
  const filteredFolders = folders
    .filter(folder => {
      const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         folder.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || folder.status === filterStatus;
      const matchesType = filterType === 'all' || folder.type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return 0;
    });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Search and filters bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search briefs by name or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-3 font-sans">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] font-sans">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name" className='font-sans'>Name</SelectItem>
              <SelectItem value="date" className='font-sans'>Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleSortOrder}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
          
          <Select value={filterStatus} onValueChange={(value: FolderStatus | 'all') => setFilterStatus(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className='font-sans'>All Statuses</SelectItem>
              <SelectItem value="pending" className='font-sans'>Pending</SelectItem>
              <SelectItem value="approved" className='font-sans'>Approved</SelectItem>
              <SelectItem value="revision" className='font-sans'>Needs Revision</SelectItem>
              <SelectItem value="final" className='font-sans'>Finalized</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={(value: FileType | 'all') => setFilterType(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className='font-sans'>All Types</SelectItem>
              <SelectItem value="branding" className='font-sans'>Branding</SelectItem>
              <SelectItem value="web" className='font-sans'>Web Design</SelectItem>
              <SelectItem value="marketing" className='font-sans'>Marketing</SelectItem>
              <SelectItem value="packaging" className='font-sans'>Packaging</SelectItem>
              <SelectItem value="illustration" className='font-sans'>Illustration</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center border border-border rounded-md">
            <Button 
              variant={view === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setView('grid')}
              className="rounded-r-none"
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={view === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setView('list')}
              className="rounded-l-none"
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Folder grid */}
      <div className={view === 'grid' 
        ? "grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" 
        : "space-y-2"
      }>
        {filteredFolders.length > 0 ? (
          filteredFolders.map((folder) => (
            <FolderCard 
              key={folder.id} 
              folder={folder} 
              view={view}
              onClick={() => onFolderClick(folder)} 
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No folders match your search criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderGrid;
