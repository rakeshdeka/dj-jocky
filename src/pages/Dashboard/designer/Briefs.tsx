import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import Search from '../../../components/dashboard/ui/Search';
import BriefsGrid from '../../../components/dashboard/dashboard/BriefsGrid';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/dashboard/ui/sheet';
import { toast } from 'sonner';
import { Button } from '../../../components/dashboard/ui/button';
import { RootState } from '../../../store/store';
import { UploadCloud } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/dashboard/ui/select';
import {
  fetchDesignerBriefs,
  startDesignerWork,
  type DesignerBrief,
} from '../../../lib/designer-api';
import { fetchBriefFilesBundle, uploadDeliveryFiles, type BriefFilesBundle } from '../../../lib/files-api';
import BriefFilesPanel from '../../../components/dashboard/briefs/BriefFilesPanel';
import SubmitWorkSheet from '../../../components/dashboard/designer/SubmitWorkSheet';
import SubmitFinalDeliverySheet from '../../../components/dashboard/designer/SubmitFinalDeliverySheet';

const Briefs = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [briefs, setBriefs] = useState<DesignerBrief[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingBriefId, setUpdatingBriefId] = useState<string | null>(null);

  const [selectedBrief, setSelectedBrief] = useState<{ id: string; title: string } | null>(null);
  const [briefFiles, setBriefFiles] = useState<BriefFilesBundle>({
    reference_files: [],
    delivery_files: [],
  });
  const [isFilesLoading, setIsFilesLoading] = useState(false);

  const [uploadModal, setUploadModal] = useState<{ id: string; title: string } | null>(null);
  const [submitWorkModal, setSubmitWorkModal] = useState<{ id: string; title: string } | null>(null);
  const [finalUploadModal, setFinalUploadModal] = useState<{ id: string; title: string } | null>(null);
  const [uploadFile, setUploadFile] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadBriefs = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setBriefs(
        await fetchDesignerBriefs(token, {
          status: statusFilter === 'all' ? undefined : statusFilter,
          priority: priorityFilter === 'all' ? undefined : priorityFilter,
        }),
      );
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to load briefs');
    } finally {
      setIsLoading(false);
    }
  }, [token, statusFilter, priorityFilter]);

  const loadFiles = async (id: string) => {
    if (!token) return;
    try {
      setIsFilesLoading(true);
      setBriefFiles(await fetchBriefFilesBundle(token, id));
    } catch {
      toast.error('Failed to fetch files');
    } finally {
      setIsFilesLoading(false);
    }
  };

  useEffect(() => {
    loadBriefs();
  }, [loadBriefs]);

  const handleUpload = async () => {
    if (!token || !uploadModal || !uploadFile || uploadFile.length === 0) {
      return toast.error('Select files');
    }

    try {
      setIsUploading(true);
      await uploadDeliveryFiles(token, uploadModal.id, uploadFile);
      toast.success('Files uploaded successfully');
      setUploadModal(null);
      setUploadFile(null);
      await loadBriefs();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartWork = async (briefId: string) => {
    if (!token) return;
    try {
      setUpdatingBriefId(briefId);
      await startDesignerWork(token, briefId);
      toast.success('Work started');
      await loadBriefs();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to start work');
    } finally {
      setUpdatingBriefId(null);
    }
  };

  const handleSubmitWorkOpen = (briefId: string, title: string) => {
    setSubmitWorkModal({ id: briefId, title });
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">ALL BRIEFS</h1>
        <p className="text-muted-foreground text-sm">
          Assigned briefs, deliverables, and status updates
        </p>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <Search onSearch={setSearchQuery} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-[180px] h-9 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="pending_admin_review">Awaiting admin review</SelectItem>
            <SelectItem value="under_review">Under review</SelectItem>
            <SelectItem value="awaiting_final_delivery">Awaiting final delivery</SelectItem>
            <SelectItem value="revision">Revision</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full lg:w-[180px] h-9 text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BriefsGrid
        briefs={briefs}
        searchQuery={searchQuery}
        sortBy="date-created"
        isLoading={isLoading}
        onDeleted={(id) => setBriefs((prev) => prev.filter((b) => b._id !== id))}
        onViewFiles={(id, title) => {
          setSelectedBrief({ id, title });
          loadFiles(id);
        }}
        onViewBrief={(id) => navigate(`/designer/briefs/${id}`)}
        role="designer"
        onUploadDelivery={(id, title) => setUploadModal({ id, title })}
        onStartWork={handleStartWork}
        onSubmitWork={handleSubmitWorkOpen}
        onUploadFinal={(id, title) => setFinalUploadModal({ id, title })}
        updatingBriefId={updatingBriefId}
      />

      <Sheet open={!!selectedBrief} onOpenChange={() => setSelectedBrief(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Files</SheetTitle>
            <SheetDescription>{selectedBrief?.title}</SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <BriefFilesPanel
              referenceFiles={briefFiles.reference_files}
              deliverables={briefFiles.deliverables}
              viewerRole="designer"
              briefStatus={briefs.find((b) => b._id === selectedBrief?.id)?.status}
              isLoading={isFilesLoading}
            />
          </div>
        </SheetContent>
      </Sheet>

      <SubmitWorkSheet
        open={!!submitWorkModal}
        briefId={submitWorkModal?.id ?? null}
        briefTitle={submitWorkModal?.title}
        token={token}
        onClose={() => setSubmitWorkModal(null)}
        onSuccess={loadBriefs}
      />

      <SubmitFinalDeliverySheet
        open={!!finalUploadModal}
        briefId={finalUploadModal?.id ?? null}
        briefTitle={finalUploadModal?.title}
        token={token}
        onClose={() => setFinalUploadModal(null)}
        onSuccess={loadBriefs}
      />

      <Sheet open={!!uploadModal} onOpenChange={() => setUploadModal(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add Delivery Files</SheetTitle>
            <SheetDescription>
              Upload extra deliverables without changing brief status — {uploadModal?.title}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer hover:border-[#C4FE01] transition">
              <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-sm">Click to upload delivery files</p>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setUploadFile(e.target.files)}
              />
            </label>

            {uploadFile && (
              <div className="space-y-2 max-h-40 overflow-auto">
                {Array.from(uploadFile).map((file) => (
                  <div key={file.name} className="text-sm border p-2 rounded">
                    {file.name}
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-[#C4FE01] text-black"
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default Briefs;
