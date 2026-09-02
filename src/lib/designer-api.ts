import axios from 'axios';
import { toMessageText } from './admin-settings-shared';
import { uploadDeliveryFiles } from './files-api';

export const apiBaseUrl = import.meta.env.VITE_API_URL;

export type DesignerBriefStatus =
  | 'not_assigned'
  | 'assigned'
  | 'in_progress'
  | 'under_review'
  | 'revision'
  | 'completed';

export type DesignerBriefPriority = 'low' | 'medium' | 'high';

export type DesignerBrief = {
  _id: string;
  title: string;
  status: DesignerBriefStatus;
  priority: DesignerBriefPriority;
  description?: string;
  delivery_date?: string;
  createdAt?: string;
  updatedAt?: string;
  thumbnail_url?: string;
  client_id?: { _id?: string; name?: string; email?: string };
  service_id?: { _id?: string; name?: string; price?: number };
  designer_id?: { _id?: string; name?: string; email?: string };
};

export type DesignerDashboardCounts = {
  assigned: number;
  in_progress: number;
  under_review: number;
  revision: number;
  completed: number;
  active: number;
  total: number;
};

export type DesignerMeeting = {
  _id: string;
  date: string;
  time: string;
  meeting_type: string;
  status: string;
  agenda?: string;
  client_id?: { name?: string; email?: string };
  admin_id?: { name?: string; email?: string };
  createdAt: string;
};

export type DesignerDashboardData = {
  counts: DesignerDashboardCounts;
  new_projects: DesignerBrief[];
  new_meetings: DesignerMeeting[];
};

export type DesignerBriefsQuery = {
  status?: string;
  priority?: string;
};

export type DesignerBriefDetail = DesignerBrief & {
  files?: unknown[];
  status_progress?: unknown;
};

const getAuthConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});

const getApiError = (data: unknown, fallback: string) =>
  toMessageText((data as Record<string, unknown>)?.error ?? (data as Record<string, unknown>)?.message, fallback);

export const fetchDesignerDashboard = async (token: string): Promise<DesignerDashboardData> => {
  const res = await axios.get(`${apiBaseUrl}/designer/dashboard`, getAuthConfig(token));
  const data = res.data;
  if (data.success === false) throw new Error(getApiError(data, 'Failed to load dashboard'));

  return {
    counts: data.counts || {
      assigned: 0,
      in_progress: 0,
      under_review: 0,
      revision: 0,
      completed: 0,
      active: 0,
      total: 0,
    },
    new_projects: data.new_projects || data.recent_projects || [],
    new_meetings: data.new_meetings || data.recent_meetings || [],
  };
};

export const fetchDesignerBriefs = async (
  token: string,
  query: DesignerBriefsQuery = {},
): Promise<DesignerBrief[]> => {
  const res = await axios.get(`${apiBaseUrl}/designer/briefs`, {
    ...getAuthConfig(token),
    params: {
      status: query.status || undefined,
      priority: query.priority || undefined,
    },
  });
  const data = res.data;
  if (data.success === false) throw new Error(getApiError(data, 'Failed to load briefs'));
  return data.items || data.briefs || data.data || [];
};

export const fetchDesignerBrief = async (
  token: string,
  briefId: string,
): Promise<DesignerBriefDetail> => {
  const res = await axios.get(`${apiBaseUrl}/designer/briefs/${briefId}`, getAuthConfig(token));
  const data = res.data;
  if (data.success === false) throw new Error(getApiError(data, 'Failed to load brief'));
  return (data.brief || data.item || data.data) as DesignerBriefDetail;
};

export const updateDesignerBriefStatus = async (
  token: string,
  briefId: string,
  status: 'in_progress' | 'under_review',
) => {
  const res = await axios.patch(
    `${apiBaseUrl}/designer/briefs/${briefId}/status`,
    { status },
    getAuthConfig(token),
  );
  const data = res.data;
  if (data.success === false) throw new Error(getApiError(data, 'Failed to update brief status'));
  return data;
};

export const startDesignerWork = async (token: string, briefId: string) =>
  updateDesignerBriefStatus(token, briefId, 'in_progress');

export const submitDesignerWork = async (
  token: string,
  briefId: string,
  files: FileList | File[],
) => {
  await uploadDeliveryFiles(token, briefId, files);
  return updateDesignerBriefStatus(token, briefId, 'under_review');
};

export const getNextDesignerBriefStatus = (
  currentStatus: string,
): 'in_progress' | 'under_review' | null => {
  if (currentStatus === 'assigned' || currentStatus === 'revision') return 'in_progress';
  if (currentStatus === 'in_progress') return 'under_review';
  return null;
};

export const getDesignerStatusActionLabel = (nextStatus: 'in_progress' | 'under_review') => {
  if (nextStatus === 'in_progress') return 'Start Work';
  return 'Submit Work';
};

export const canStartDesignerWork = (status: string) =>
  status === 'assigned' || status === 'revision';

export const canSubmitDesignerWork = (status: string) => status === 'in_progress';
