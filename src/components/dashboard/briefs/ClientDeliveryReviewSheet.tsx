import { useEffect, useState } from 'react';
import { CheckCircle2, Download, FileText, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { acceptBrief, requestBriefRevision } from '../../../lib/briefs-api';
import { fetchBriefDeliveryFiles, getBriefFileName, type BriefFile } from '../../../lib/files-api';

type ClientDeliveryReviewSheetProps = {
  open: boolean;
  briefId: string | null;
  briefTitle?: string;
  token: string | null;
  onClose: () => void;
  onSuccess?: (newStatus: 'completed' | 'revision') => void;
  initialMode?: 'review' | 'revision';
};

const DeliveryFileRow = ({ file }: { file: BriefFile }) => (
  <div className="flex items-center justify-between p-3 border rounded-md hover:border-[#C4FE01] transition gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="p-2 bg-muted rounded shrink-0">
        <FileText className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{getBriefFileName(file)}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {file.version != null && file.version > 0 && (
            <Badge variant="secondary" className="text-[9px] h-4 px-1">
              v{file.version}
            </Badge>
          )}
          {file.file_type && (
            <span className="text-[10px] text-muted-foreground uppercase">{file.file_type}</span>
          )}
        </div>
      </div>
    </div>
    <a
      href={file.file_url}
      target="_blank"
      rel="noreferrer"
      className="p-2 hover:bg-[#C4FE01] rounded shrink-0"
    >
      <Download className="w-4 h-4" />
    </a>
  </div>
);

const ClientDeliveryReviewSheet = ({
  open,
  briefId,
  briefTitle,
  token,
  onClose,
  onSuccess,
  initialMode = 'review',
}: ClientDeliveryReviewSheetProps) => {
  const [deliveryFiles, setDeliveryFiles] = useState<BriefFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(initialMode === 'revision');
  const [revisionNote, setRevisionNote] = useState('');

  useEffect(() => {
    if (!open) {
      setShowRevisionForm(initialMode === 'revision');
      setRevisionNote('');
      return;
    }

    setShowRevisionForm(initialMode === 'revision');

    if (!token || !briefId) return;

    const loadDeliveryFiles = async () => {
      try {
        setIsLoadingFiles(true);
        setDeliveryFiles(await fetchBriefDeliveryFiles(token, briefId));
      } catch {
        toast.error('Failed to load delivery files');
      } finally {
        setIsLoadingFiles(false);
      }
    };

    loadDeliveryFiles();
  }, [open, token, briefId, initialMode]);

  const handleClose = () => {
    if (isAccepting || isSubmittingRevision) return;
    onClose();
  };

  const handleAccept = async () => {
    if (!token || !briefId) return;

    try {
      setIsAccepting(true);
      await acceptBrief(token, briefId);
      toast.success('Delivery accepted — brief marked as completed');
      onSuccess?.('completed');
      onClose();
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || 'Failed to accept delivery');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!token || !briefId) return;
    if (!revisionNote.trim()) {
      toast.error('Please describe what needs to be changed');
      return;
    }

    try {
      setIsSubmittingRevision(true);
      await requestBriefRevision(token, briefId, revisionNote);
      toast.success('Revision requested — sent back to designer');
      onSuccess?.('revision');
      onClose();
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || 'Failed to request revision');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const isBusy = isAccepting || isSubmittingRevision;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Review Delivery</SheetTitle>
          <SheetDescription>
            Review designer deliverables and accept or request changes
            {briefTitle ? ` — ${briefTitle}` : ''}.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest">Delivery Files</h3>
            <p className="text-[11px] text-muted-foreground">
              Download and review each file before accepting or requesting changes.
            </p>

            {isLoadingFiles ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01]" />
                <p className="text-xs text-muted-foreground mt-2">Loading delivery files...</p>
              </div>
            ) : deliveryFiles.length > 0 ? (
              <div className="space-y-2">
                {deliveryFiles.map((file) => (
                  <DeliveryFileRow key={file._id || file.id} file={file} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-md">
                <p className="text-xs text-muted-foreground">No delivery files yet.</p>
              </div>
            )}
          </div>

          {!showRevisionForm ? (
            <div className="space-y-2 pt-2 border-t">
              <Button
                onClick={handleAccept}
                disabled={isBusy || isLoadingFiles || deliveryFiles.length === 0}
                className="w-full bg-[#C4FE01] hover:bg-[#b2e600] text-black"
              >
                {isAccepting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Accept Delivery
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRevisionForm(true)}
                disabled={isBusy}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-2 border-t">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest">
                  Revision Note
                </label>
                <p className="text-[11px] text-muted-foreground mt-1 mb-2">
                  Tell the designer what to adjust (required).
                </p>
                <Textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="e.g. Please adjust the logo size and update the color palette..."
                  rows={4}
                  disabled={isBusy}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRevisionForm(false);
                    setRevisionNote('');
                  }}
                  disabled={isBusy}
                >
                  Back
                </Button>
                <Button
                  onClick={handleRequestRevision}
                  disabled={isBusy || !revisionNote.trim()}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSubmittingRevision ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Send Revision
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ClientDeliveryReviewSheet;
