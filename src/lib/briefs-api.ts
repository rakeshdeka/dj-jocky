import axios from 'axios';
import type { BriefFile } from './files-api';

const apiUrl = import.meta.env.VITE_API_URL;

export type BriefPriority = 'low' | 'medium' | 'high';

export type BriefStatus =
  | 'not_assigned'
  | 'assigned'
  | 'in_progress'
  | 'under_review'
  | 'revision'
  | 'completed';

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
  createdAt?: string;
  updatedAt?: string;
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
});

export const formatBriefStatus = (status?: string) =>
  (status || 'not_assigned').replace(/_/g, ' ');

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

export const EDITABLE_BRIEF_STATUSES: BriefStatus[] = ['not_assigned', 'assigned', 'in_progress'];

export const canEditBrief = (status?: BriefStatus) =>
  !status || EDITABLE_BRIEF_STATUSES.includes(status);

export const canDeleteBrief = (status?: BriefStatus) =>
  !status || status === 'not_assigned';
