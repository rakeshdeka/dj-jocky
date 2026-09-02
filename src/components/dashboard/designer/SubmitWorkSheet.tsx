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
import { submitDesignerWork } from '../../../lib/designer-api';

type SubmitWorkSheetProps = {
  open: boolean;
  briefId: string | null;
  briefTitle?: string;
  token: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const SubmitWorkSheet = ({
  open,
  briefId,
  briefTitle,
  token,
  onClose,
  onSuccess,
}: SubmitWorkSheetProps) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setFiles(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!token || !briefId) return toast.error('Login required');
    if (!files || files.length === 0) return toast.error('Select at least one delivery file');

    try {
      setIsSubmitting(true);
      await submitDesignerWork(token, briefId, files);
      toast.success('Work submitted for review');
      setFiles(null);
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit work');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Submit Work</SheetTitle>
          <SheetDescription>
            Upload delivery files and mark this brief as under review
            {briefTitle ? ` — ${briefTitle}` : ''}.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer hover:border-[#C4FE01] transition">
            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-center">Upload delivery files</p>
            <p className="text-[11px] text-muted-foreground mt-1">Required before submitting</p>
            <input
              type="file"
              multiple
              className="hidden"
              disabled={isSubmitting}
              onChange={(e) => setFiles(e.target.files)}
            />
          </label>

          {files && files.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-auto">
              {Array.from(files).map((file) => (
                <div key={file.name} className="text-sm border p-2 rounded truncate">
                  {file.name}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-[#C4FE01] text-black hover:bg-[#b2e600]"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Work
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SubmitWorkSheet;
