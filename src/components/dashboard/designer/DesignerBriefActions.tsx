import { Loader2, Package, PlayCircle, Send, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import {
  canStartDesignerWork,
  canSubmitDesignerWork,
  canUploadFinalDelivery,
  isDesignerAwaitingAdminReview,
} from '../../../lib/designer-api';

type DesignerBriefActionsProps = {
  status: string;
  isUpdating?: boolean;
  onStartWork?: () => void;
  onSubmitWork?: () => void;
  onUploadFinal?: () => void;
  className?: string;
  size?: 'sm' | 'default';
};

const DesignerBriefActions = ({
  status,
  isUpdating = false,
  onStartWork,
  onSubmitWork,
  onUploadFinal,
  className = '',
  size = 'sm',
}: DesignerBriefActionsProps) => {
  if (isDesignerAwaitingAdminReview(status)) {
    return (
      <Button
        size={size}
        variant="outline"
        disabled
        className={`border-orange-500/30 text-orange-400 ${className}`}
      >
        <Clock className="h-3.5 w-3.5 mr-2" />
        Awaiting Admin Review
      </Button>
    );
  }

  if (canUploadFinalDelivery(status) && onUploadFinal) {
    return (
      <Button
        size={size}
        className={`bg-[#C4FE01] text-black hover:bg-[#b2e600] ${className}`}
        disabled={isUpdating}
        onClick={onUploadFinal}
      >
        {isUpdating ? (
          <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
        ) : (
          <Package className="h-3.5 w-3.5 mr-2" />
        )}
        Upload Final ZIP
      </Button>
    );
  }

  if (canStartDesignerWork(status) && onStartWork) {
    return (
      <Button
        size={size}
        className={`bg-[#C4FE01] text-black hover:bg-[#b2e600] ${className}`}
        disabled={isUpdating}
        onClick={onStartWork}
      >
        {isUpdating ? (
          <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
        ) : (
          <PlayCircle className="h-3.5 w-3.5 mr-2" />
        )}
        Start Work
      </Button>
    );
  }

  if (canSubmitDesignerWork(status) && onSubmitWork) {
    return (
      <Button
        size={size}
        className={`bg-[#C4FE01] text-black hover:bg-[#b2e600] ${className}`}
        disabled={isUpdating}
        onClick={onSubmitWork}
      >
        {isUpdating ? (
          <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5 mr-2" />
        )}
        Submit Work
      </Button>
    );
  }

  return null;
};

export default DesignerBriefActions;
