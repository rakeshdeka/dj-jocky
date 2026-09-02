import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMyBriefs } from '../../../lib/briefs-api';
import { fetchBriefFilesBundle, type BriefFilesBundle } from '../../../lib/files-api';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import Search from '../../../components/dashboard/ui/Search';
import SortDropdown from '../../../components/dashboard/ui/SortDropdown';
import BriefsGrid from '../../../components/dashboard/dashboard/BriefsGrid';
import BriefFilesPanel from '../../../components/dashboard/briefs/BriefFilesPanel';
import { Button } from '../../../components/dashboard/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/dashboard/ui/sheet';
import { RootState } from '../../../store/store';

const sortOptions = [
  { value: 'date-created', label: 'Date Created' },
  { value: 'date-updated', label: 'Last Updated' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
];

const Index = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-created');
  const [briefs, setBriefs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedBrief, setSelectedBrief] = useState<{ id: string; title: string } | null>(null);
  const [briefFiles, setBriefFiles] = useState<BriefFilesBundle>({
    reference_files: [],
    delivery_files: [],
  });
  const [isFilesLoading, setIsFilesLoading] = useState(false);

  const fetchBriefs = async () => {
    try {
      setIsLoading(true);
      setBriefs(await fetchMyBriefs(token));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load briefs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBriefFiles = async (briefId: string) => {
    if (!token) return;
    try {
      setIsFilesLoading(true);
      setBriefFiles(await fetchBriefFilesBundle(token, briefId));
    } catch {
      toast.error('Failed to fetch brief files');
    } finally {
      setIsFilesLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBriefs();
  }, [token]);

  const handleOpenFiles = (id: string, title: string) => {
    setSelectedBrief({ id, title });
    loadBriefFiles(id);
  };

  const handleDeleted = (id: string) => {
    setBriefs((prev) => prev.filter((b) => b._id !== id));
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">ALL BRIEFS</h1>
        <p className="text-muted-foreground text-sm">Manage your design requests and associated assets</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex-1 w-full">
          <Search onSearch={setSearchQuery} />
        </div>
        <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
          <SortDropdown options={sortOptions} defaultValue="date-created" onSort={setSortBy} />
          <Link to="/client/create-brief">
            <Button className="bg-[#C4FE01] hover:bg-[#b2e600] text-black">
              <Plus className="mr-2 h-4 w-4" /> Create
            </Button>
          </Link>
        </div>
      </div>

      <BriefsGrid
        briefs={briefs}
        searchQuery={searchQuery}
        sortBy={sortBy}
        isLoading={isLoading}
        onDeleted={handleDeleted}
        onViewFiles={handleOpenFiles}
        role="client"
        onUploadDelivery={() => {}}
      />

      <Sheet open={!!selectedBrief} onOpenChange={() => setSelectedBrief(null)}>
        <SheetContent className="sm:max-w-md font-sans overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Brief Files</SheetTitle>
            <SheetDescription>{selectedBrief?.title}</SheetDescription>
          </SheetHeader>

          <BriefFilesPanel
            referenceFiles={briefFiles.reference_files}
            deliveryFiles={briefFiles.delivery_files}
            isLoading={isFilesLoading}
          />
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default Index;
