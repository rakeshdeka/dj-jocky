import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { formatBriefStatus, type Brief } from '../../../lib/briefs-api';

const AVATAR_COLORS = [
  'bg-[#C4FE01] text-black',
  'bg-purple-500 text-white',
  'bg-orange-500 text-white',
  'bg-cyan-500 text-black',
  'bg-pink-500 text-white',
  'bg-amber-400 text-black',
  'bg-blue-500 text-white',
];

type ProgressBriefListProps = {
  briefs: Brief[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (brief: Brief) => void;
  getPreview?: (brief: Brief) => string;
};

const ProgressBriefList = ({
  briefs,
  isLoading,
  searchQuery,
  onSearchChange,
  onSelect,
  getPreview,
}: ProgressBriefListProps) => {
  const filtered = briefs.filter((brief) =>
    brief.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-border/60">
        <input
          type="text"
          placeholder="Search inbox..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent border-none text-sm placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="text-center text-xs text-muted-foreground py-10">Loading inbox...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-10">No projects found.</p>
        ) : (
          filtered.map((brief, index) => {
            const preview =
              getPreview?.(brief) ||
              `${brief.service_id && typeof brief.service_id === 'object' ? brief.service_id.name : 'Project'} — ${formatBriefStatus(brief.status, 'client')}`;
            const dateLabel = brief.updatedAt
              ? format(new Date(brief.updatedAt), 'EEE M/d')
              : '';

            return (
              <button
                key={brief._id}
                type="button"
                onClick={() => onSelect(brief)}
                className="w-full text-left px-4 py-4 border-b border-border/40 transition-colors hover:bg-secondary/20"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      AVATAR_COLORS[index % AVATAR_COLORS.length]
                    }`}
                  >
                    {brief.title?.charAt(0)?.toUpperCase() || 'B'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold truncate">{brief.title}</h3>
                      {dateLabel && (
                        <span className="text-[11px] text-muted-foreground shrink-0">{dateLabel}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{preview}</p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-60" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProgressBriefList;
