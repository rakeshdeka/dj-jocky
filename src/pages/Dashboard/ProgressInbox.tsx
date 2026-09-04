import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/dashboard/layout/MainLayout';
import { Badge } from '../../components/dashboard/ui/badge';
import { Button } from '../../components/dashboard/ui/button';
import { RootState } from '../../store/store';
import { fetchMyBriefs, type Brief } from '../../lib/briefs-api';
import { fetchDesignerBriefs } from '../../lib/designer-api';
import ProgressBriefList from '../../components/dashboard/progress/ProgressBriefList';

const ProgressInbox = () => {
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const isClient = user?.role === 'client';
  const isDesigner = user?.role === 'designer';
  const basePath = isDesigner ? '/designer/progress' : '/client/progress';

  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBriefs = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setBriefs(isDesigner ? await fetchDesignerBriefs(token) : await fetchMyBriefs(token));
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [token, isDesigner]);

  useEffect(() => {
    fetchBriefs();
  }, [fetchBriefs]);

  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">PROGRESS</h1>
            <p className="text-sm text-muted-foreground">
              {isClient ? 'Your project inbox' : 'Assigned project threads'}
            </p>
          </div>
          <Badge variant="secondary" className="bg-[#C4FE01] text-black hover:bg-[#C4FE01] shrink-0">
            {briefs.length}
          </Badge>
        </div>
        {isClient && (
          <Button
            className="bg-[#C4FE01] text-black hover:bg-[#b2e600] font-bold shrink-0"
            onClick={() => navigate('/client/create-brief')}
          >
            <Plus className="mr-2 h-4 w-4" /> New Brief
          </Button>
        )}
      </div>

      <div className="border border-border/60 rounded-lg overflow-hidden bg-card/10 min-h-[calc(100vh-240px)]">
        <ProgressBriefList
          briefs={briefs}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={(brief) => navigate(`${basePath}/${brief._id}`)}
        />
      </div>
    </MainLayout>
  );
};

export default ProgressInbox;
