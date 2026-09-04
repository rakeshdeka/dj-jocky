import { format } from 'date-fns';
import { MessageSquare, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { DesignerFeedbackNotes as DesignerFeedbackNotesData } from '../../../lib/briefs-api';

type DesignerFeedbackNotesProps = {
  notes: DesignerFeedbackNotesData;
  updatedAt?: string;
  className?: string;
};

const formatNoteDate = (value?: string) => {
  if (!value) return null;
  try {
    return format(new Date(value), 'MMM d, yyyy · h:mm a');
  } catch {
    return null;
  }
};

const DesignerFeedbackNotes = ({ notes, updatedAt, className = '' }: DesignerFeedbackNotesProps) => {
  const { clientRevisionNote, adminRejectionNote } = notes;

  if (!clientRevisionNote && !adminRejectionNote) {
    return null;
  }

  const formattedDate = formatNoteDate(updatedAt);

  return (
    <div className={`space-y-3 ${className}`}>
      {adminRejectionNote && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold tracking-[0.15em] uppercase flex items-center gap-2 text-orange-400">
              <ShieldAlert className="h-4 w-4" />
              Admin Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{adminRejectionNote}</p>
            {formattedDate && (
              <p className="text-[10px] text-muted-foreground mt-2">{formattedDate}</p>
            )}
          </CardContent>
        </Card>
      )}

      {clientRevisionNote && (
        <Card className="border-purple-500/30 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold tracking-[0.15em] uppercase flex items-center gap-2 text-purple-300">
              <MessageSquare className="h-4 w-4" />
              Client Revision Request
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{clientRevisionNote}</p>
            {formattedDate && !adminRejectionNote && (
              <p className="text-[10px] text-muted-foreground mt-2">{formattedDate}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DesignerFeedbackNotes;
