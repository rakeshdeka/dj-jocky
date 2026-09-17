import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export type DeliveryStage = 'submitted' | 'approved_for_review' | 'accepted';

export type BriefFile = {
  _id: string;
  id?: string;
  brief_id?: string;
  file_url: string;
  display_name?: string;
  original_name: string;
  file_type?: string;
  category?: string;
  uploaded_by?: string;
  uploaded_by_user?: string;
  version?: number;
  delivery_stage?: DeliveryStage | string;
  stage_label?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DeliverableStageGroup = {
  label: string;
  files: BriefFile[];
};

export type BriefDeliverables = {
  submitted: DeliverableStageGroup;
  preview: DeliverableStageGroup;
  final: DeliverableStageGroup;
};

export type BriefFilesBundle = {
  reference_files: BriefFile[];
  delivery_files: BriefFile[];
  submitted_deliverables: BriefFile[];
  preview_deliverables: BriefFile[];
  final_deliverables: BriefFile[];
  deliverables: BriefDeliverables;
};

const DEFAULT_DELIVERABLES: BriefDeliverables = {
  submitted: { label: 'Submitted work', files: [] },
  preview: { label: 'Ready for review', files: [] },
  final: { label: 'Final deliverables', files: [] },
};

const getAuthConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});

const parseFileArray = (value: unknown): BriefFile[] =>
  Array.isArray(value) ? (value as BriefFile[]) : [];

const readStageGroup = (
  grouped: Record<string, unknown> | undefined,
  key: 'submitted' | 'preview' | 'final',
  fallbackFiles: BriefFile[],
  defaultLabel: string,
): DeliverableStageGroup => {
  const stage = grouped?.[key];
  if (stage && typeof stage === 'object') {
    const stageObj = stage as Record<string, unknown>;
    return {
      label: typeof stageObj.label === 'string' ? stageObj.label : defaultLabel,
      files: parseFileArray(stageObj.files).length
        ? parseFileArray(stageObj.files)
        : fallbackFiles,
    };
  }

  return {
    label: defaultLabel,
    files: fallbackFiles,
  };
};

export const parseDeliverablesBundle = (data: Record<string, unknown>): BriefFilesBundle => {
  const grouped = data.deliverables as Record<string, unknown> | undefined;
  const submitted = readStageGroup(
    grouped,
    'submitted',
    parseFileArray(data.submitted_deliverables),
    'Submitted work',
  );
  const preview = readStageGroup(
    grouped,
    'preview',
    parseFileArray(data.preview_deliverables),
    'Ready for review',
  );
  const finalStage = readStageGroup(
    grouped,
    'final',
    parseFileArray(data.final_deliverables),
    'Final deliverables',
  );

  const delivery_files = parseFileArray(data.delivery_files);

  return {
    reference_files: parseFileArray(data.reference_files),
    delivery_files,
    submitted_deliverables: submitted.files,
    preview_deliverables: preview.files,
    final_deliverables: finalStage.files,
    deliverables: {
      submitted,
      preview,
      final: finalStage,
    },
  };
};

export const getBriefFileName = (file: BriefFile) =>
  file.display_name || file.original_name || 'Attachment';

export const getFileVersion = (file: BriefFile): number => {
  if (file.version != null && file.version > 0) return file.version;

  const name = file.display_name || file.original_name || '';
  const versionMatch = name.match(/(?:^|[-_])v?(\d+)(?:[-_]|$)/i);
  if (versionMatch) return Number.parseInt(versionMatch[1], 10);

  return 1;
};

export type VersionedFileGroup = {
  version: number;
  label: string;
  files: BriefFile[];
};

export const groupFilesByVersion = (files: BriefFile[]): VersionedFileGroup[] => {
  const grouped = new Map<number, BriefFile[]>();

  files.forEach((file) => {
    const version = getFileVersion(file);
    const list = grouped.get(version) ?? [];
    list.push(file);
    grouped.set(version, list);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => b - a)
    .map(([version, versionFiles]) => ({
      version,
      label: `V${version}`,
      files: versionFiles,
    }));
};

export const getDefaultVersionTab = (groups: VersionedFileGroup[]) =>
  groups.length > 0 ? String(groups[0].version) : '1';

export const getDeliverableStageSections = (
  deliverables: BriefDeliverables,
  options: { showEmptyStages?: boolean } = {},
) => {
  const sections = [
    { key: 'submitted' as const, ...deliverables.submitted },
    { key: 'preview' as const, ...deliverables.preview },
    { key: 'final' as const, ...deliverables.final },
  ];

  if (options.showEmptyStages) return sections;
  return sections.filter((section) => section.files.length > 0);
};

export const countDeliverableFiles = (deliverables: BriefDeliverables) =>
  deliverables.submitted.files.length +
  deliverables.preview.files.length +
  deliverables.final.files.length;

type DeliverableViewerRole = 'client' | 'designer' | 'admin';

export const filterDeliverablesForViewer = (
  deliverables: BriefDeliverables,
  role: DeliverableViewerRole,
  status?: string,
): BriefDeliverables => {
  if (role === 'admin' || role === 'designer') {
    return deliverables;
  }

  const emptyStage = (group: DeliverableStageGroup): DeliverableStageGroup => ({
    label: group.label,
    files: [],
  });

  if (status === 'under_review' || status === 'revision') {
    return {
      submitted: emptyStage(deliverables.submitted),
      preview: deliverables.preview,
      final: emptyStage(deliverables.final),
    };
  }

  if (status === 'completed') {
    return {
      submitted: emptyStage(deliverables.submitted),
      preview: emptyStage(deliverables.preview),
      final: deliverables.final,
    };
  }

  return {
    submitted: emptyStage(deliverables.submitted),
    preview: emptyStage(deliverables.preview),
    final: emptyStage(deliverables.final),
  };
};

export const uploadFinalDelivery = async (token: string, briefId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('final_package', file);

  const res = await axios.post(`${apiUrl}/files/briefs/${briefId}/final-delivery`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });

  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to upload final delivery');
  }

  return res.data;
};

export const fetchBriefFilesBundle = async (
  token: string,
  briefId: string,
): Promise<BriefFilesBundle> => {
  const res = await axios.get(`${apiUrl}/files/briefs/${briefId}`, getAuthConfig(token));
  return parseDeliverablesBundle(res.data);
};

export const fetchBriefReferenceFiles = async (
  token: string,
  briefId: string,
): Promise<BriefFile[]> => {
  const res = await axios.get(`${apiUrl}/files/briefs/${briefId}/references`, getAuthConfig(token));
  const data = res.data;
  return parseFileArray(data.reference_files ?? data.files ?? data.items ?? data.data);
};

export const fetchBriefDeliveryFiles = async (
  token: string,
  briefId: string,
): Promise<BriefFile[]> => {
  const res = await axios.get(`${apiUrl}/files/briefs/${briefId}/delivery`, getAuthConfig(token));
  const bundle = parseDeliverablesBundle(res.data);
  return bundle.delivery_files.length > 0
    ? bundle.delivery_files
    : [
        ...bundle.submitted_deliverables,
        ...bundle.preview_deliverables,
        ...bundle.final_deliverables,
      ];
};

/** @deprecated Use fetchBriefFilesBundle */
export const fetchBriefFiles = async (token: string, briefId: string): Promise<BriefFile[]> => {
  const bundle = await fetchBriefFilesBundle(token, briefId);
  return [...bundle.reference_files, ...bundle.delivery_files];
};

export const uploadDeliveryFiles = async (
  token: string,
  briefId: string,
  files: FileList | File[],
) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('delivery_files', file);
    formData.append('files', file);
  });

  const res = await axios.post(`${apiUrl}/files/briefs/${briefId}/delivery`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });

  return res.data;
};
