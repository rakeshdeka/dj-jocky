import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMyBriefs, type Brief, type BriefStatus } from '../../../lib/briefs-api';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import Search from '../../../components/dashboard/ui/Search';
import SortDropdown from '../../../components/dashboard/ui/SortDropdown';
import BriefsGrid from '../../../components/dashboard/dashboard/BriefsGrid';
import ClientDeliveryReviewSheet from '../../../components/dashboard/briefs/ClientDeliveryReviewSheet';
import { Button } from '../../../components/dashboard/ui/button';
import { RootState } from '../../../store/store';

const sortOptions = [
  { value: 'date-created', label: 'Date Created' },
  { value: 'date-updated', label: 'Last Updated' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
];

const Index = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-created');
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewBrief, setReviewBrief] = useState<{
    id: string;
    title: string;
    mode: 'review' | 'revision';
  } | null>(null);

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

  useEffect(() => {
    if (token) fetchBriefs();
  }, [token]);

  const handleReviewDelivery = (id: string, title: string) => {
    setReviewBrief({ id, title, mode: 'review' });
  };

  const handleReviewSuccess = (briefId: string, newStatus: BriefStatus) => {
    setBriefs((prev) =>
      prev.map((brief) => (brief._id === briefId ? { ...brief, status: newStatus } : brief)),
    );
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
        onViewFiles={() => {}}
        onViewBrief={(id) => navigate(`/client/briefs/${id}`)}
        onReviewDelivery={handleReviewDelivery}
        role="client"
        onUploadDelivery={() => {}}
      />

      <ClientDeliveryReviewSheet
        open={!!reviewBrief}
        briefId={reviewBrief?.id ?? null}
        briefTitle={reviewBrief?.title}
        token={token}
        initialMode={reviewBrief?.mode}
        onClose={() => setReviewBrief(null)}
        onSuccess={(newStatus) => {
          if (reviewBrief) handleReviewSuccess(reviewBrief.id, newStatus);
        }}
      />
    </MainLayout>
  );
};

export default Index;
