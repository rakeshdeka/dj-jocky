import axios from 'axios';

export interface UserDropdownItem {
  id: string;
  _id: string;
  name: string;
  email?: string;
}

export interface CreateMeetingPayload {
  date: string;
  time: string;
  meeting_type: string;
  agenda: string;
  meeting_link: string;
  client_id?: string;
  designer_id?: string;
}

export interface MeetingListItem {
  _id: string;
  date: string;
  time: string;
  agenda: string;
  meeting_type: string;
  meeting_link: string;
  status: string;
  client_id?: { _id: string; name: string; email?: string } | null;
  designer_id?: { _id: string; name: string; email?: string } | null;
  createdAt?: string;
}

const getAuthConfig = (token: string) => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  withCredentials: true,
});

export const isValidGoogleMeetUrl = (url: string) => {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' && parsed.hostname === 'meet.google.com' && parsed.pathname.length > 1;
  } catch {
    return false;
  }
};

export const normalizeGoogleMeetUrl = (url: string) => url.trim();

export const parseDropdownItems = (data: unknown): UserDropdownItem[] => {
  if (!data) return [];

  let list: unknown[] = [];

  if (Array.isArray(data)) {
    list = data;
  } else if (typeof data === 'object') {
    const envelope = data as Record<string, unknown>;
    if (Array.isArray(envelope.items)) {
      list = envelope.items;
    } else if (Array.isArray(envelope.data)) {
      list = envelope.data;
    } else if (Array.isArray(envelope.designers)) {
      list = envelope.designers;
    } else if (envelope.data && typeof envelope.data === 'object') {
      const nested = envelope.data as Record<string, unknown>;
      if (Array.isArray(nested.items)) list = nested.items;
      else if (Array.isArray(nested.data)) list = nested.data;
      else if (Array.isArray(nested.designers)) list = nested.designers;
    }
  }

  return list
    .map((item: any) => ({
      id: String(item._id || item.id || ''),
      _id: String(item._id || item.id || ''),
      name: item.name || item.email || 'Unnamed',
      email: item.email,
    }))
    .filter((item) => item.id);
};

export const fetchClientsDropdown = async (apiUrl: string, token: string) => {
  const res = await axios.get(`${apiUrl}/admin/clients/dropdown`, getAuthConfig(token));
  return parseDropdownItems(res.data);
};

export const fetchDesignersDropdown = async (apiUrl: string, token: string) => {
  const res = await axios.get(`${apiUrl}/admin/designers/dropdown`, getAuthConfig(token));
  return parseDropdownItems(res.data);
};

export const fetchMyMeetings = async (apiUrl: string, token: string): Promise<MeetingListItem[]> => {
  const res = await axios.get(`${apiUrl}/meetings/me`, getAuthConfig(token));
  return res.data.items || [];
};

export const fetchAdminMeetings = async (apiUrl: string, token: string): Promise<MeetingListItem[]> => {
  const res = await axios.get(`${apiUrl}/admin/meetings`, getAuthConfig(token));
  return res.data.items || [];
};

export const createMeeting = async (
  apiUrl: string,
  token: string,
  payload: CreateMeetingPayload,
) => {
  if (!isValidGoogleMeetUrl(payload.meeting_link)) {
    throw new Error('Meeting link must be a valid Google Meet URL (https://meet.google.com/...)');
  }

  const res = await axios.post(
    `${apiUrl}/meetings`,
    {
      ...payload,
      meeting_link: normalizeGoogleMeetUrl(payload.meeting_link),
    },
    getAuthConfig(token),
  );

  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to schedule meeting');
  }

  return res.data;
};

export const assignDesignerToMeeting = async (
  apiUrl: string,
  token: string,
  meetingId: string,
  designerId: string,
) => {
  const res = await axios.patch(
    `${apiUrl}/meetings/${meetingId}/assign-designer`,
    { designer_id: designerId },
    getAuthConfig(token),
  );

  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to assign designer');
  }

  return res.data;
};
