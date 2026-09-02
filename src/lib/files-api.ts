import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

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
  createdAt?: string;
  updatedAt?: string;
};

export type BriefFilesBundle = {
  reference_files: BriefFile[];
  delivery_files: BriefFile[];
};

const getAuthConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});

const parseFileArray = (value: unknown): BriefFile[] =>
  Array.isArray(value) ? (value as BriefFile[]) : [];

const parseBundle = (data: Record<string, unknown>): BriefFilesBundle => ({
  reference_files: parseFileArray(data.reference_files),
  delivery_files: parseFileArray(data.delivery_files),
});

export const getBriefFileName = (file: BriefFile) =>
  file.display_name || file.original_name || 'Attachment';

export const fetchBriefFilesBundle = async (
  token: string,
  briefId: string,
): Promise<BriefFilesBundle> => {
  const res = await axios.get(`${apiUrl}/files/briefs/${briefId}`, getAuthConfig(token));
  return parseBundle(res.data);
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
  const data = res.data;
  return parseFileArray(data.delivery_files ?? data.files ?? data.items ?? data.data);
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
