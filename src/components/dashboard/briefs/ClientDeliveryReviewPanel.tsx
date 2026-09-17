import { useState } from 'react';
import { CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  acceptBrief,
  canRequestRevision,
  formatRevisionsRemainingLabel,
  requestBriefRevision,
} from '../../../lib/briefs-api';
import { type BriefFile } from '../../../lib/files-api';
import VersionedFilesList from './VersionedFilesList';

type ClientDeliveryReviewPanelProps = {
  briefId: string;
  token: string | null;
  previewFiles: BriefFile[];
  revisionCount?: number;
  revisionLimit?: number | null;
  onSuccess?: (newStatus: 'awaiting_final_delivery' | 'revision') => void;
};

const ClientDeliveryReviewPanel = ({
  briefId,
  token,
  previewFiles,
  revisionCount = 0,
  revisionLimit,
  onSuccess,
}: ClientDeliveryReviewPanelProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');

  const handleAccept = async () => {
    if (!token) return;

    try {
      setIsAccepting(true);
      await acceptBrief(token, briefId);
      toast.success('Preview accepted — we\'re preparing your final files');
      onSuccess?.('awaiting_final_delivery');
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
    if (!token) return;
    if (!revisionNote.trim()) {
      toast.error('Please describe what needs to be changed');
      return;
    }

    try {
      setIsSubmittingRevision(true);
      await requestBriefRevision(token, briefId, revisionNote);
      toast.success('Revision requested — sent back to designer');
      onSuccess?.('revision');
      setRevisionNote('');
      setShowRevisionForm(false);
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
  const revisionsRemainingLabel = formatRevisionsRemainingLabel(revisionCount, revisionLimit);
  const canRequestMoreRevisions = canRequestRevision(revisionCount, revisionLimit);

  return (
    <Card className="border-[#C4FE01]/30 bg-[#C4FE01]/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold tracking-[0.15em] uppercase">
          Review Delivery
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Download and review the preview files below. Accept to approve the preview — your final ZIP will be prepared separately.
        </p>
        {revisionsRemainingLabel && (
          <p className="text-[11px] text-muted-foreground">{revisionsRemainingLabel}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest">Ready for review</h3>
          <VersionedFilesList
            files={previewFiles}
            emptyMessage="No preview files available yet."
          />
        </div>

        {!showRevisionForm ? (
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/40">
            <Button
              onClick={handleAccept}
              disabled={isBusy || previewFiles.length === 0}
              className="flex-1 bg-[#C4FE01] hover:bg-[#b2e600] text-black font-bold"
            >
              {isAccepting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Accept Preview
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRevisionForm(true)}
              disabled={isBusy || !canRequestMoreRevisions}
              className="flex-1"
              title={
                canRequestMoreRevisions
                  ? undefined
                  : 'No revisions remaining for this brief'
              }
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Request Changes
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2 border-t border-border/40">
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
      </CardContent>
    </Card>
  );
};

export default ClientDeliveryReviewPanel;
