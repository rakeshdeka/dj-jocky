import { Loader2, PlayCircle, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { canStartDesignerWork, canSubmitDesignerWork } from '../../../lib/designer-api';

type DesignerBriefActionsProps = {
  status: string;
  isUpdating?: boolean;
  onStartWork?: () => void;
  onSubmitWork?: () => void;
  className?: string;
  size?: 'sm' | 'default';
};

const DesignerBriefActions = ({
  status,
  isUpdating = false,
  onStartWork,
  onSubmitWork,
  className = '',
  size = 'sm',
}: DesignerBriefActionsProps) => {
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
