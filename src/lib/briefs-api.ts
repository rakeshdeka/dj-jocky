import axios from 'axios';
import type { BriefFile, BriefDeliverables } from './files-api';

const apiUrl = import.meta.env.VITE_API_URL;

export type BriefPriority = 'low' | 'medium' | 'high';

export type BriefStatus =
  | 'not_assigned'
  | 'assigned'
  | 'in_progress'
  | 'pending_admin_review'
  | 'under_review'
  | 'awaiting_final_delivery'
  | 'revision'
  | 'completed';

export type BriefStatusRole = 'client' | 'admin' | 'designer';

export type Brief = {
  _id: string;
  title: string;
  description?: string;
  status?: BriefStatus;
  priority?: BriefPriority;
  delivery_date?: string;
  thumbnail_url?: string;
  service_id?: string | { _id?: string; name?: string };
  client_id?: { _id?: string; name?: string; email?: string };
  designer_id?: { _id?: string; name?: string; email?: string } | null;
  reference_files?: BriefFile[];
  delivery_files?: BriefFile[];
  deliverables?: BriefDeliverables;
  revision_note?: string;
  rejection_note?: string;
  latest_revision_note?: string;
  latest_rejection_note?: string;
  admin_rejection_note?: string;
  revision_count?: number;
  revision_limit?: number | null;
  team_id?: string;
  created_by_user_id?: string | { _id?: string; name?: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
};

export type RevisionLimit = number | null | undefined;

/** `null` / omitted means unlimited revisions. */
export const hasRevisionLimit = (revisionLimit?: RevisionLimit): boolean =>
  typeof revisionLimit === 'number' && revisionLimit > 0;

export const getRemainingRevisions = (
  revisionCount = 0,
  revisionLimit?: RevisionLimit,
): number | null => {
  if (!hasRevisionLimit(revisionLimit)) return null;
  return Math.max(0, revisionLimit - revisionCount);
};

export const canRequestRevision = (
  revisionCount = 0,
  revisionLimit?: RevisionLimit,
): boolean => {
  if (!hasRevisionLimit(revisionLimit)) return true;
  return revisionCount < revisionLimit;
};

export const formatRevisionsRemainingLabel = (
  revisionCount = 0,
  revisionLimit?: RevisionLimit,
): string | null => {
  const remaining = getRemainingRevisions(revisionCount, revisionLimit);
  if (remaining === null) return null;
  return remaining === 1 ? '1 revision left' : `${remaining} revisions left`;
};

export type BriefFormValues = {
  title: string;
  description: string;
  service_id: string;
  priority: BriefPriority;
  delivery_date: string;
};

export type BriefFilePayload = {
  thumbnail?: File | null;
  files?: File[];
};

const getAuthConfig = (token: string | null) => ({
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});

const getMultipartConfig = (token: string | null) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: true,
});

const extractServiceId = (serviceId?: Brief['service_id']) => {
  if (!serviceId) return '';
  if (typeof serviceId === 'string') return serviceId;
  return serviceId._id || (serviceId as { id?: string }).id || '';
};

const parseBriefResponse = (data: any): Brief => {
  const brief =
    data?.item ??
    data?.brief ??
    data?.data ??
    (data?._id ? data : null);

  if (!brief?._id) {
    throw new Error(data?.message || 'Brief not found');
  }

  return normalizeBrief(brief, data);
};

export const normalizeBrief = (item: any, envelope?: Record<string, unknown>): Brief => ({
  ...item,
  service_id: item.service_id,
  reference_files: item.reference_files ?? envelope?.reference_files,
  delivery_files: item.delivery_files ?? envelope?.delivery_files,
  deliverables: item.deliverables ?? envelope?.deliverables,
});

export const formatBriefStatus = (status?: string, role: BriefStatusRole = 'client') => {
  const value = status || 'not_assigned';
  if (role === 'client' && (value === 'not_assigned' || value === 'pending_admin_review')) {
    return value === 'not_assigned' ? 'assigned' : 'in progress';
  }
  if (role === 'client' && value === 'awaiting_final_delivery') return 'in progress';
  if (value === 'pending_admin_review') return 'pending admin review';
  if (value === 'awaiting_final_delivery') return 'awaiting final delivery';
  return value.replace(/_/g, ' ');
};

export const getClientKanbanStatus = (status?: BriefStatus): BriefStatus => {
  if (!status || status === 'not_assigned') return 'assigned';
  if (status === 'pending_admin_review') return 'in_progress';
  if (status === 'awaiting_final_delivery') return 'in_progress';
  return status;
};

export const getClientStatusMessage = (status?: BriefStatus) => {
  if (status === 'awaiting_final_delivery') return 'Preparing your files';
  return null;
};

export const isAwaitingFinalDelivery = (status?: BriefStatus) =>
  status === 'awaiting_final_delivery';

export const canClientSeeDeliveryFiles = (status?: BriefStatus) =>
  status === 'under_review' || status === 'completed' || status === 'revision';

export const canAdminReviewDelivery = (status?: BriefStatus) =>
  status === 'pending_admin_review';

export const isPendingAdminReview = (status?: BriefStatus) =>
  status === 'pending_admin_review';

export type DesignerFeedbackNotes = {
  clientRevisionNote: string | null;
  adminRejectionNote: string | null;
};

export const getDesignerFeedbackNotes = (
  source?: Partial<Brief> | Record<string, unknown> | null,
): DesignerFeedbackNotes => {
  if (!source) {
    return { clientRevisionNote: null, adminRejectionNote: null };
  }

  const record = source as Record<string, unknown>;
  const statusProgress =
    record.status_progress && typeof record.status_progress === 'object'
      ? (record.status_progress as Record<string, unknown>)
      : null;

  const readNote = (...values: unknown[]) => {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return null;
  };

  return {
    clientRevisionNote: readNote(
      record.revision_note,
      record.latest_revision_note,
      statusProgress?.revision_note,
      statusProgress?.client_revision_note,
    ),
    adminRejectionNote: readNote(
      record.rejection_note,
      record.admin_rejection_note,
      record.latest_rejection_note,
      statusProgress?.rejection_note,
      statusProgress?.admin_rejection_note,
    ),
  };
};

export const hasDesignerFeedbackNotes = (source?: Partial<Brief> | Record<string, unknown> | null) => {
  const notes = getDesignerFeedbackNotes(source);
  return Boolean(notes.clientRevisionNote || notes.adminRejectionNote);
};

export const formatBriefPriority = (priority?: string) =>
  priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Medium';

export const briefToFormValues = (brief: Brief): BriefFormValues => ({
  title: brief.title || '',
  description: brief.description || '',
  service_id: extractServiceId(brief.service_id),
  priority: brief.priority || 'medium',
  delivery_date: brief.delivery_date || '',
});

const appendIfChanged = (
  formData: FormData,
  key: string,
  value: string,
  originalValue?: string,
  isPartial = false,
) => {
  if (!isPartial || value !== (originalValue ?? '')) {
    formData.append(key, value);
  }
};

const buildBriefFormData = (
  values: BriefFormValues,
  files: BriefFilePayload = {},
  original?: BriefFormValues,
): FormData => {
  const formData = new FormData();
  const isPartial = !!original;

  appendIfChanged(formData, 'title', values.title.trim(), original?.title, isPartial);
  appendIfChanged(formData, 'description', values.description.trim(), original?.description, isPartial);
  appendIfChanged(formData, 'service_id', values.service_id, original?.service_id, isPartial);
  appendIfChanged(formData, 'priority', values.priority, original?.priority, isPartial);
  appendIfChanged(formData, 'delivery_date', values.delivery_date, original?.delivery_date, isPartial);

  if (files.thumbnail) {
    formData.append('thumbnail', files.thumbnail);
  }

  files.files?.forEach((file) => {
    formData.append('files', file);
  });

  return formData;
};

export const fetchMyBriefs = async (token: string | null): Promise<Brief[]> => {
  const res = await axios.get(`${apiUrl}/briefs/me`, getAuthConfig(token));
  return res.data.items || [];
};

export const fetchBrief = async (token: string | null, id: string): Promise<Brief> => {
  const res = await axios.get(`${apiUrl}/briefs/${id}`, getAuthConfig(token));
  return parseBriefResponse(res.data);
};

export const createBrief = async (
  token: string | null,
  values: BriefFormValues,
  files: BriefFilePayload = {},
) => {
  const formData = buildBriefFormData(values, files);
  const res = await axios.post(`${apiUrl}/briefs`, formData, getMultipartConfig(token));
  return res.data;
};

export const updateBrief = async (
  token: string | null,
  id: string,
  values: BriefFormValues,
  files: BriefFilePayload = {},
  original?: BriefFormValues,
) => {
  let formData = buildBriefFormData(values, files, original);

  // Ensure PATCH always has a body even when no fields changed
  if ([...formData.keys()].length === 0) {
    formData = buildBriefFormData(values, files);
  }

  const res = await axios.patch(`${apiUrl}/briefs/${id}`, formData, getMultipartConfig(token));
  return res.data;
};

export const deleteBrief = async (token: string | null, id: string) => {
  const res = await axios.delete(`${apiUrl}/briefs/${id}`, getAuthConfig(token));
  return res.data;
};

export const updateBriefPriority = async (
  token: string | null,
  id: string,
  priority: BriefPriority,
) => {
  const res = await axios.patch(
    `${apiUrl}/briefs/${id}/priority`,
    { priority },
    getAuthConfig(token),
  );
  return res.data;
};

export const acceptBrief = async (token: string | null, id: string) => {
  const res = await axios.post(`${apiUrl}/briefs/${id}/accept`, {}, getAuthConfig(token));
  return res.data;
};

export const requestBriefRevision = async (
  token: string | null,
  id: string,
  revisionNote: string,
) => {
  const res = await axios.post(
    `${apiUrl}/briefs/${id}/request-revision`,
    { revision_note: revisionNote.trim() },
    getAuthConfig(token),
  );
  return res.data;
};

export const REVIEWABLE_BRIEF_STATUSES: BriefStatus[] = ['under_review'];

export const canReviewBrief = (status?: BriefStatus) =>
  !!status && REVIEWABLE_BRIEF_STATUSES.includes(status);

export type AdminBriefsQuery = {
  status?: string;
  limit?: number;
};

export const fetchAdminBriefs = async (
  token: string | null,
  query: AdminBriefsQuery = {},
): Promise<Brief[]> => {
  const res = await axios.get(`${apiUrl}/admin/briefs`, {
    ...getAuthConfig(token),
    params: {
      status: query.status || undefined,
      limit: query.limit || undefined,
    },
  });
  return res.data.items || [];
};

export const approveAdminDelivery = async (token: string | null, id: string) => {
  const res = await axios.post(
    `${apiUrl}/admin/briefs/${id}/approve-delivery`,
    {},
    getAuthConfig(token),
  );
  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to approve delivery');
  }
  return res.data;
};

export const rejectAdminDelivery = async (
  token: string | null,
  id: string,
  rejectionNote?: string,
) => {
  const res = await axios.post(
    `${apiUrl}/admin/briefs/${id}/reject-delivery`,
    rejectionNote?.trim() ? { rejection_note: rejectionNote.trim() } : {},
    getAuthConfig(token),
  );
  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to reject delivery');
  }
  return res.data;
};

export const assignDesignerToBrief = async (
  token: string | null,
  briefId: string,
  designerId: string,
) => {
  const res = await axios.patch(
    `${apiUrl}/admin/briefs/${briefId}/assign-designer`,
    { designer_id: designerId },
    getAuthConfig(token),
  );
  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to assign designer');
  }
  return res.data;
};

export const EDITABLE_BRIEF_STATUSES: BriefStatus[] = ['not_assigned', 'assigned', 'in_progress'];

export const canEditBrief = (status?: BriefStatus) =>
  !status || EDITABLE_BRIEF_STATUSES.includes(status);

export const canDeleteBrief = (status?: BriefStatus) =>
  !status || status === 'not_assigned';
