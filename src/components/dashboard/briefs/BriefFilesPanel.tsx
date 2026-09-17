import { Loader2 } from 'lucide-react';
import {
  filterDeliverablesForViewer,
  getDeliverableStageSections,
  type BriefDeliverables,
  type BriefFile,
} from '../../../lib/files-api';
import VersionedFilesList from './VersionedFilesList';

type ViewerRole = 'client' | 'designer' | 'admin';

type BriefFilesPanelProps = {
  referenceFiles: BriefFile[];
  deliverables?: BriefDeliverables | null;
  viewerRole?: ViewerRole;
  briefStatus?: string;
  isLoading?: boolean;
};

const STAGE_DESCRIPTIONS: Record<string, string> = {
  submitted: 'Designer uploads awaiting admin review',
  preview: 'Approved deliverables ready for client review',
  final: 'Accepted final deliverables',
};

const FileSection = ({
  title,
  description,
  files,
}: {
  title: string;
  description: string;
  files: BriefFile[];
}) => (
  <div className="space-y-2">
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest">{title}</h3>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
    <VersionedFilesList files={files} emptyMessage="No files in this section" />
  </div>
);

const BriefFilesPanel = ({
  referenceFiles,
  deliverables,
  viewerRole = 'client',
  briefStatus,
  isLoading = false,
}: BriefFilesPanelProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01]" />
        <p className="text-xs text-muted-foreground mt-2">Loading files...</p>
      </div>
    );
  }

  const filteredDeliverables = deliverables
    ? filterDeliverablesForViewer(deliverables, viewerRole, briefStatus)
    : null;

  const showEmptyStages = viewerRole === 'admin' || viewerRole === 'designer';
  const stageSections = filteredDeliverables
    ? getDeliverableStageSections(filteredDeliverables, { showEmptyStages })
    : [];
  const hasDeliverables = stageSections.some((section) => section.files.length > 0);
  const hasAnyFiles = referenceFiles.length > 0 || hasDeliverables;

  if (!hasAnyFiles) {
    return (
      <div className="text-center py-20 border border-dashed rounded-md">
        <p className="text-sm text-muted-foreground">No files available for this brief.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {referenceFiles.length > 0 && (
        <FileSection
          title="Reference Files"
          description="Client-provided assets and brief attachments"
          files={referenceFiles}
        />
      )}

      {stageSections.map((section) => (
        <FileSection
          key={section.key}
          title={section.label}
          description={STAGE_DESCRIPTIONS[section.key]}
          files={section.files}
        />
      ))}
    </div>
  );
};

export default BriefFilesPanel;
