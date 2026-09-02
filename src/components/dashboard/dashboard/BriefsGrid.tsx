import React, { useMemo, useState } from 'react';
import BriefCard from './BriefCard';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../../store/store';
import { deleteBrief } from '../../../lib/briefs-api';

interface BriefsGridProps {
  briefs: any[];
  searchQuery: string;
  sortBy: string;
  isLoading: boolean;
  onDeleted: (id: string) => void;
  onViewFiles: (id: string, title: string) => void;
  role: "client" | "designer";
  onUploadDelivery: (id: string, title: string) => void;
  onStartWork?: (id: string) => void;
  onSubmitWork?: (id: string, title: string) => void;
  updatingBriefId?: string | null;
}

const BriefsGrid: React.FC<BriefsGridProps> = ({
  briefs = [],
  searchQuery = "",
  sortBy = "date-created",
  isLoading,
  onDeleted,
  onViewFiles,
  role,
  onUploadDelivery,
  onStartWork,
  onSubmitWork,
  updatingBriefId = null,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brief?')) return;

    try {
      setDeletingId(id);
      await deleteBrief(token, id);
      toast.success('Brief deleted successfully');
      onDeleted(id);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBriefs = useMemo(() => {
    let list = [...briefs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.service_id?.name?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      if (sortBy === "date-updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [briefs, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {filteredBriefs.map((brief) => (
        <BriefCard
          key={brief._id}
          id={brief._id}
          category={brief.service_id?.name || "Uncategorized"}
          title={brief.title}
          status={brief.status}
          imageSrc={brief.thumbnail_url}
          isDeleting={deletingId === brief._id}
          onDelete={() => handleDelete(brief._id)}
          onViewFiles={onViewFiles}
          role={role}
          onUploadDelivery={onUploadDelivery}
          onStartWork={onStartWork}
          onSubmitWork={onSubmitWork}
          isUpdatingStatus={updatingBriefId === brief._id}
        />
      ))}

      {filteredBriefs.length === 0 && (
        <div className="col-span-full text-center py-20 border border-dashed rounded-xl">
          <p className="text-muted-foreground">No briefs found.</p>
        </div>
      )}
    </div>
  );
};

export default BriefsGrid;
