import { Download, FileText, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { getBriefFileName, type BriefFile } from '../../../lib/files-api';

type BriefFilesPanelProps = {
  referenceFiles: BriefFile[];
  deliveryFiles: BriefFile[];
  isLoading?: boolean;
};

const FileRow = ({ file }: { file: BriefFile }) => (
  <div className="flex items-center justify-between p-3 border rounded-md hover:border-[#C4FE01] transition gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="p-2 bg-muted rounded shrink-0">
        <FileText className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{getBriefFileName(file)}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {file.uploaded_by && (
            <span className="text-[10px] text-muted-foreground capitalize">{file.uploaded_by}</span>
          )}
          {file.version != null && file.version > 0 && (
            <Badge variant="secondary" className="text-[9px] h-4 px-1">
              v{file.version}
            </Badge>
          )}
          {file.file_type && (
            <span className="text-[10px] text-muted-foreground uppercase">{file.file_type}</span>
          )}
        </div>
      </div>
    </div>

    <a
      href={file.file_url}
      target="_blank"
      rel="noreferrer"
      className="p-2 hover:bg-[#C4FE01] rounded shrink-0"
    >
      <Download className="w-4 h-4" />
    </a>
  </div>
);

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
    {files.length > 0 ? (
      <div className="space-y-2">
        {files.map((file) => (
          <FileRow key={file._id || file.id} file={file} />
        ))}
      </div>
    ) : (
      <div className="text-center py-8 border border-dashed rounded-md">
        <p className="text-xs text-muted-foreground">No files in this section</p>
      </div>
    )}
  </div>
);

const BriefFilesPanel = ({
  referenceFiles,
  deliveryFiles,
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

  const hasAnyFiles = referenceFiles.length > 0 || deliveryFiles.length > 0;

  if (!hasAnyFiles) {
    return (
      <div className="text-center py-20 border border-dashed rounded-md">
        <p className="text-sm text-muted-foreground">No files available for this brief.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileSection
        title="Reference Files"
        description="Client-provided assets and brief attachments"
        files={referenceFiles}
      />
      <FileSection
        title="Delivery Files"
        description="Designer deliverables submitted for review"
        files={deliveryFiles}
      />
    </div>
  );
};

export default BriefFilesPanel;
