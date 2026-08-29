import axios from "axios";

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
  client_id: string;
  designer_id?: string;
}

const getAuthConfig = (token: string) => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  withCredentials: true,
});

export const parseDropdownItems = (data: unknown): UserDropdownItem[] => {
  const list = Array.isArray(data)
    ? data
    : (data as { items?: unknown[] })?.items ?? [];

  return list
    .map((item: any) => ({
      id: String(item._id || item.id || ""),
      _id: String(item._id || item.id || ""),
      name: item.name || item.email || "Unnamed",
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

export const createMeeting = async (
  apiUrl: string,
  token: string,
  payload: CreateMeetingPayload
) => {
  const res = await axios.post(`${apiUrl}/meetings`, payload, getAuthConfig(token));
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to schedule meeting");
  }
  return res.data;
};
