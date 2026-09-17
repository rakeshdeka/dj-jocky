import { useMemo, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { getCalcomBookingPageUrl, getCalcomEmbedUrl } from '../../../lib/meetings-api';
import { Button } from '../ui/button';

type CalcomEmbedProps = {
  calLink: string;
  username?: string;
  title?: string;
  className?: string;
};

const CalcomEmbed = ({ calLink, username, title, className }: CalcomEmbedProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const embedUrl = useMemo(() => getCalcomEmbedUrl(calLink, username), [calLink, username]);
  const publicUrl = useMemo(() => getCalcomBookingPageUrl(calLink, username), [calLink, username]);

  if (!embedUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-border/50 rounded-xl bg-muted/10">
        <p className="text-sm text-muted-foreground">Calendar link is not configured.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#C4FE01]">
            {title || 'Select a time'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Pick a slot below — your meeting syncs automatically after booking.
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 h-9 text-xs" asChild>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            Open in Cal.com
            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </a>
        </Button>
      </div>

      <div className="relative rounded-xl border border-border/50 bg-background overflow-hidden shadow-sm">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01]" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Loading calendar...
            </p>
          </div>
        )}
        <iframe
          key={embedUrl}
          title={title ? `Book: ${title}` : 'Book a meeting'}
          src={embedUrl}
          onLoad={() => setIsLoading(false)}
          className={className ?? 'w-full h-[min(720px,75vh)] border-0 bg-white dark:bg-zinc-950'}
          allow="payment *; clipboard-read; clipboard-write"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default CalcomEmbed;
