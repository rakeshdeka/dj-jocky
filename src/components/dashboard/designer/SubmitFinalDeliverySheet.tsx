import { useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { submitFinalDelivery } from '../../../lib/designer-api';

type SubmitFinalDeliverySheetProps = {
  open: boolean;
  briefId: string | null;
  briefTitle?: string;
  token: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const SubmitFinalDeliverySheet = ({
  open,
  briefId,
  briefTitle,
  token,
  onClose,
  onSuccess,
}: SubmitFinalDeliverySheetProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setFile(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!token || !briefId) return toast.error('Login required');
    if (!file) return toast.error('Select a ZIP file to upload');

    const isZip =
      file.name.toLowerCase().endsWith('.zip') ||
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed';

    if (!isZip) {
      toast.error('Final delivery must be a ZIP file');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFinalDelivery(token, briefId, file);
      toast.success('Final package uploaded — brief marked as completed');
      setFile(null);
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload final package');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="uppercase tracking-tight text-sm">Upload Final ZIP</SheetTitle>
          <SheetDescription>
            {briefTitle
              ? `Upload the final deliverable package for "${briefTitle}".`
              : 'Upload the final deliverable ZIP package for this brief.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <label
            className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-[#C4FE01]/50 transition-colors"
          >
            <UploadCloud className="h-8 w-8 text-[#C4FE01]" />
            <span className="text-xs text-muted-foreground text-center">
              {file ? file.name : 'Click to select a .zip file'}
            </span>
            <input
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="hidden"
              disabled={isSubmitting}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#C4FE01] text-black font-bold"
              onClick={handleSubmit}
              disabled={isSubmitting || !file}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Upload Final Package
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SubmitFinalDeliverySheet;
