import { useMemo } from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  getBriefFileName,
  getDefaultVersionTab,
  groupFilesByVersion,
  type BriefFile,
} from '../../../lib/files-api';

type VersionedFilesListProps = {
  files: BriefFile[];
  emptyMessage?: string;
  variant?: 'list' | 'cards';
};

const ListFileRow = ({ file }: { file: BriefFile }) => (
  <div className="flex items-center justify-between p-3 border rounded-md hover:border-[#C4FE01] transition gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="p-2 bg-muted rounded shrink-0">
        <FileText className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{getBriefFileName(file)}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {file.stage_label && (
            <Badge variant="outline" className="text-[9px] h-4 px-1 capitalize">
              {file.stage_label}
            </Badge>
          )}
          {file.uploaded_by && (
            <span className="text-[10px] text-muted-foreground capitalize">{file.uploaded_by}</span>
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

const CardFileRow = ({ file }: { file: BriefFile }) => (
  <div className="flex items-center gap-3 min-w-[220px] max-w-[280px] border border-border/60 rounded-lg bg-background/60 px-3 py-2.5 shrink-0">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium truncate">{getBriefFileName(file)}</p>
      {file.stage_label && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{file.stage_label}</p>
      )}
    </div>
    <div className="flex items-center gap-1 shrink-0">
      <a
        href={file.file_url}
        target="_blank"
        rel="noreferrer"
        className="p-1.5 rounded-md hover:bg-[#C4FE01]/20 transition-colors"
        title="Preview"
      >
        <Eye className="h-4 w-4" />
      </a>
      <a
        href={file.file_url}
        download
        target="_blank"
        rel="noreferrer"
        className="p-1.5 rounded-md hover:bg-[#C4FE01]/20 transition-colors"
        title="Download"
      >
        <Download className="h-4 w-4" />
      </a>
    </div>
  </div>
);

const VersionedFilesList = ({
  files,
  emptyMessage = 'No files in this section',
  variant = 'list',
}: VersionedFilesListProps) => {
  const versionGroups = useMemo(() => groupFilesByVersion(files), [files]);
  const defaultTab = useMemo(() => getDefaultVersionTab(versionGroups), [versionGroups]);

  if (files.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-md">
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="h-9 bg-secondary/30 p-1 flex flex-wrap justify-start gap-1 w-full">
        {versionGroups.map((group) => (
          <TabsTrigger
            key={group.version}
            value={String(group.version)}
            className="text-[10px] font-bold uppercase tracking-wider px-3 h-7 data-[state=active]:bg-[#C4FE01] data-[state=active]:text-black"
          >
            {group.label}
            <span className="ml-1.5 opacity-70">({group.files.length})</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {versionGroups.map((group) => (
        <TabsContent key={group.version} value={String(group.version)} className="mt-3">
          {variant === 'cards' ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {group.files.map((file) => (
                <CardFileRow key={file._id || file.id} file={file} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {group.files.map((file) => (
                <ListFileRow key={file._id || file.id} file={file} />
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default VersionedFilesList;
