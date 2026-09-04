import { useState } from 'react';
import { CheckCircle2, Loader2, RotateCcw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import {
  approveAdminDelivery,
  rejectAdminDelivery,
} from '../../../lib/briefs-api';

type AdminDeliveryReviewPanelProps = {
  briefId: string;
  token: string | null;
  onSuccess: () => void;
};

const AdminDeliveryReviewPanel = ({
  briefId,
  token,
  onSuccess,
}: AdminDeliveryReviewPanelProps) => {
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    if (!token) return;
    try {
      setIsApproving(true);
      await approveAdminDelivery(token, briefId);
      toast.success('Delivery approved — client and designer notified');
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve delivery');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!token) return;
    try {
      setIsRejecting(true);
      await rejectAdminDelivery(token, briefId, rejectionNote);
      toast.success('Delivery sent back to designer');
      setRejectionNote('');
      setShowRejectForm(false);
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject delivery');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Card className="border-orange-500/30 bg-orange-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold tracking-[0.15em] uppercase flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-orange-400" />
          Delivery Awaiting Approval
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Review designer deliverables before the client sees them. Approve to release for client
          review, or reject to send back to the designer.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="bg-[#c5fb00] hover:bg-[#b0e000] text-black font-bold"
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Approve for Client
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRejectForm((prev) => !prev)}
            disabled={isApproving || isRejecting}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Send Back to Designer
          </Button>
        </div>

        {showRejectForm && (
          <div className="space-y-2 rounded-lg border border-border/60 bg-background/40 p-3">
            <Textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="Optional note for the designer (e.g. Fix logo alignment)"
              rows={3}
              disabled={isRejecting}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionNote('');
                }}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={isRejecting}
              >
                {isRejecting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDeliveryReviewPanel;
