import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export type MeetingType = 'service' | 'platform_query';

export interface UserDropdownItem {
  id: string;
  _id: string;
  name: string;
  email?: string;
}

export interface AvailabilitySlot {
  _id: string;
  date: string;
  start_time: string;
  end_time: string;
  meeting_type: MeetingType | string;
  is_booked?: boolean;
  is_available?: boolean;
}

export interface MeetingUserRef {
  _id: string;
  name: string;
  email?: string;
}

export type MeetingsProvider = 'calcom' | 'legacy' | string;

export interface MeetingListItem {
  _id: string;
  date: string;
  time?: string;
  start_time?: string;
  end_time?: string;
  meeting_type?: string | null;
  meeting_link?: string;
  status: string;
  client_status?: string;
  client_status_label?: string;
  client_message?: string;
  client_id?: MeetingUserRef | null;
  designer_id?: MeetingUserRef | null;
  slot_id?: AvailabilitySlot | string | null;
  provider?: MeetingsProvider;
  booking_source?: string;
  calcom_booking_id?: string;
  createdAt?: string;
}

export type CalcomEventType = {
  meeting_type?: MeetingType | string;
  event_type_id?: number | string;
  slug?: string;
  title?: string;
  cal_link: string;
  duration_minutes?: number;
};

export type CalcomConfig = {
  provider: MeetingsProvider;
  isCalcom: boolean;
  username?: string;
  timezone?: string;
  webhook_url?: string;
  /** Single default event from GET /meetings/calcom/config */
  event_type: CalcomEventType | null;
  /** @deprecated Legacy array shape; derived from `event_type` when present */
  event_types: CalcomEventType[];
};

export type CalcomSlot = {
  start: string;
  end?: string;
  label?: string;
};

export type CalcomBookingPayload = {
  start: string;
  timeZone?: string;
};

export interface ClientMeetingRequestPayload {
  slot_id: string;
  meeting_type?: MeetingType | string;
}

export interface AdminDirectMeetingPayload {
  client_id: string;
  slot_id: string;
  meeting_link: string;
  meeting_type?: MeetingType | string;
  designer_id?: string;
}

export interface CreateAvailabilitySlotPayload {
  date: string;
  start_time: string;
  end_time: string;
  meeting_type: MeetingType | string;
}

const getAuthConfig = (token: string) => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  withCredentials: true,
});

const readApiError = (data: unknown, fallback: string): string => {
  if (!data || typeof data !== 'object') return fallback;
  const record = data as Record<string, unknown>;
  if (record.success === false) {
    const err = record.error;
    if (err && typeof err === 'object' && typeof (err as Record<string, unknown>).message === 'string') {
      return String((err as Record<string, unknown>).message);
    }
    if (typeof record.message === 'string') return record.message;
  }
  return fallback;
};

const assertMeetingSuccess = (data: unknown, fallback: string) => {
  if (data && typeof data === 'object' && (data as Record<string, unknown>).success === false) {
    throw new Error(readApiError(data, fallback));
  }
  return data;
};

export const isCalcomProvider = (config?: CalcomConfig | null) =>
  config?.isCalcom === true || config?.provider === 'calcom';

export const isCalcomMeeting = (meeting: Pick<MeetingListItem, 'provider' | 'booking_source' | 'calcom_booking_id'>) =>
  meeting.provider === 'calcom' ||
  meeting.booking_source === 'calcom' ||
  Boolean(meeting.calcom_booking_id);

export const getMeetingJoinLabel = (meeting: MeetingListItem) => {
  if (isCalcomMeeting(meeting)) return 'Join Meeting';
  return 'Join Google Meet';
};

export const isValidGoogleMeetUrl = (url: string) => {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' && parsed.hostname === 'meet.google.com' && parsed.pathname.length > 1;
  } catch {
    return false;
  }
};

export const normalizeGoogleMeetUrl = (url: string) => url.trim();

export const formatMeetingTypeLabel = (meetingType?: string | null) => {
  if (!meetingType) return null;
  return meetingType.replace(/_/g, ' ');
};

export const formatMeetingTimeRange = (meeting: Pick<MeetingListItem, 'time' | 'start_time' | 'end_time'>) => {
  if (meeting.start_time && meeting.end_time) {
    return `${meeting.start_time} – ${meeting.end_time}`;
  }
  return meeting.time || meeting.start_time || '—';
};

export const getMeetingDisplayTitle = (
  meeting: Pick<MeetingListItem, 'date' | 'meeting_type' | 'time' | 'start_time' | 'end_time'>,
): string => {
  const timeLabel = formatMeetingTimeRange(meeting);
  if (meeting.date) {
    const parsed = new Date(meeting.date);
    if (!Number.isNaN(parsed.getTime())) {
      const dateLabel = parsed.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      if (timeLabel && timeLabel !== '—') return `${dateLabel} · ${timeLabel}`;
      return dateLabel;
    }
  }
  const typeLabel = formatMeetingTypeLabel(meeting.meeting_type);
  if (typeLabel) return `${typeLabel} call`;
  return 'Scheduled call';
};

export const getMeetingSlot = (meeting: MeetingListItem): AvailabilitySlot | null => {
  if (meeting.slot_id && typeof meeting.slot_id === 'object') {
    return meeting.slot_id;
  }
  return null;
};

export const getClientStatusBadgeClass = (clientStatus?: string) => {
  switch (clientStatus) {
    case 'confirmed':
      return 'bg-[#C4FE01]/20 text-[#C4FE01] border-[#C4FE01]/30';
    case 'request_sent':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    case 'cancelled':
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 'completed':
      return 'bg-secondary text-muted-foreground border-border/40';
    default:
      return 'bg-secondary text-muted-foreground border-border/40';
  }
};

export const getAdminStatusBadgeClass = (status?: string) => {
  switch (status) {
    case 'scheduled':
      return 'bg-[#C4FE01]/20 text-[#C4FE01]';
    case 'pending':
      return 'bg-orange-500/20 text-orange-400';
    case 'cancelled':
      return 'bg-red-500/20 text-red-400';
    case 'completed':
      return 'bg-secondary text-muted-foreground';
    default:
      return 'bg-secondary text-muted-foreground';
  }
};

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
    } else if (Array.isArray(envelope.slots)) {
      list = envelope.slots;
    } else if (envelope.data && typeof envelope.data === 'object') {
      const nested = envelope.data as Record<string, unknown>;
      if (Array.isArray(nested.items)) list = nested.items;
      else if (Array.isArray(nested.data)) list = nested.data;
      else if (Array.isArray(nested.designers)) list = nested.designers;
      else if (Array.isArray(nested.slots)) list = nested.slots;
    }
  }

  return list
    .map((item: Record<string, unknown>) => ({
      id: String(item._id || item.id || ''),
      _id: String(item._id || item.id || ''),
      name: String(item.name || item.email || 'Unnamed'),
      email: item.email ? String(item.email) : undefined,
    }))
    .filter((item) => item.id);
};

const parseSlots = (data: unknown): AvailabilitySlot[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data as AvailabilitySlot[];

  if (typeof data === 'object') {
    const envelope = data as Record<string, unknown>;
    if (Array.isArray(envelope.items)) return envelope.items as AvailabilitySlot[];
    if (Array.isArray(envelope.slots)) return envelope.slots as AvailabilitySlot[];
    if (envelope.data && typeof envelope.data === 'object') {
      const nested = envelope.data as Record<string, unknown>;
      if (Array.isArray(nested.items)) return nested.items as AvailabilitySlot[];
      if (Array.isArray(nested.slots)) return nested.slots as AvailabilitySlot[];
    }
  }

  return [];
};

const parseMeetings = (data: unknown): MeetingListItem[] => {
  const raw: MeetingListItem[] = (() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as MeetingListItem[];

    if (typeof data === 'object') {
      const envelope = data as Record<string, unknown>;
      if (Array.isArray(envelope.items)) return envelope.items as MeetingListItem[];
      if (envelope.data && typeof envelope.data === 'object') {
        const nested = envelope.data as Record<string, unknown>;
        if (Array.isArray(nested.items)) return nested.items as MeetingListItem[];
      }
    }

    return [];
  })();

  return raw;
};

export const fetchClientsDropdown = async (token: string) => {
  const res = await axios.get(`${apiUrl}/admin/clients/dropdown`, getAuthConfig(token));
  return parseDropdownItems(res.data);
};

export const fetchDesignersDropdown = async (token: string) => {
  const res = await axios.get(`${apiUrl}/admin/designers/dropdown`, getAuthConfig(token));
  return parseDropdownItems(res.data);
};

const parseCalcomEventTypeItem = (
  item: unknown,
  configUsername?: string,
): CalcomEventType | null => {
  if (!item || typeof item !== 'object') return null;

  const et = item as Record<string, unknown>;
  const slug = et.slug ? String(et.slug) : undefined;
  const rawLink = String(et.cal_link ?? et.embed_link ?? '').trim();
  const cal_link = rawLink || (configUsername && slug ? `${configUsername}/${slug}` : slug || '');
  if (!cal_link) return null;

  const meetingTypeRaw = et.meeting_type ?? et.type;
  return {
    meeting_type: meetingTypeRaw ? String(meetingTypeRaw) : undefined,
    event_type_id: et.event_type_id as number | string | undefined,
    slug,
    title: et.title ? String(et.title) : undefined,
    cal_link,
    duration_minutes: typeof et.duration_minutes === 'number' ? et.duration_minutes : undefined,
  };
};

const parseCalcomConfig = (data: unknown): CalcomConfig => {
  const record = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const provider = String(record.provider ?? record.meetings_provider ?? 'legacy');
  const eventTypesRaw = Array.isArray(record.event_types) ? record.event_types : [];

  const configUsername = record.username
    ? String(record.username)
    : record.calcom_username
      ? String(record.calcom_username)
      : undefined;

  const event_type =
    parseCalcomEventTypeItem(record.event_type, configUsername) ??
    (eventTypesRaw.length > 0 ? parseCalcomEventTypeItem(eventTypesRaw[0], configUsername) : null);

  const event_types: CalcomEventType[] = event_type
    ? [event_type]
    : eventTypesRaw
        .map((item) => parseCalcomEventTypeItem(item, configUsername))
        .filter((item): item is CalcomEventType => item !== null);

  return {
    provider,
    isCalcom: provider === 'calcom' || record.is_calcom === true,
    username: configUsername,
    timezone: record.timezone ? String(record.timezone) : undefined,
    webhook_url: record.webhook_url ? String(record.webhook_url) : undefined,
    event_type,
    event_types,
  };
};

/** Cal link path for embed (no protocol/host). */
export const getCalcomEmbedCalLink = (calLink: string, username?: string): string =>
  normalizeCalcomPath(calLink, username);

const parseCalcomSlots = (data: unknown): CalcomSlot[] => {
  if (!data) return [];
  const list = Array.isArray(data)
    ? data
    : typeof data === 'object'
      ? (() => {
          const record = data as Record<string, unknown>;
          if (Array.isArray(record.slots)) return record.slots;
          if (Array.isArray(record.items)) return record.items;
          if (record.data && typeof record.data === 'object') {
            const nested = record.data as Record<string, unknown>;
            if (Array.isArray(nested.slots)) return nested.slots;
          }
          return [];
        })()
      : [];

  return list
    .map((item) => {
      const slot = item as Record<string, unknown>;
      const start = String(slot.start ?? slot.start_time ?? slot.time ?? '');
      if (!start) return null;
      return {
        start,
        end: slot.end ? String(slot.end) : slot.end_time ? String(slot.end_time) : undefined,
        label: slot.label ? String(slot.label) : undefined,
      };
    })
    .filter((slot): slot is CalcomSlot => slot !== null);
};

/** Strip host/protocol so we never produce cal.com/cal.com/... */
export const normalizeCalcomPath = (calLink: string, username?: string): string => {
  let path = calLink.trim();
  if (!path && username) return '';

  path = path
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?app\.cal\.com\/?/i, '')
    .replace(/^(www\.)?cal\.com\/?/i, '')
    .replace(/^cal\.com\/?/i, '')
    .replace(/^\//, '')
    .replace(/\/$/, '');

  if (!path && username) return username;
  if (path && !path.includes('/') && username) return `${username}/${path}`;
  return path;
};

export const getCalcomBookingPageUrl = (calLink: string, username?: string): string => {
  const path = normalizeCalcomPath(calLink, username);
  if (!path) return '';
  return `https://cal.com/${path}`;
};

export const getCalcomEmbedUrl = (calLink: string, username?: string): string => {
  const base = getCalcomBookingPageUrl(calLink, username);
  if (!base) return '';
  const url = new URL(base);
  url.searchParams.set('embed', 'true');
  url.searchParams.set('layout', 'month_view');
  return url.toString();
};

export const formatCalcomSlotTime = (isoStart: string, timezone?: string) => {
  try {
    const date = new Date(isoStart);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    });
  } catch {
    return isoStart;
  }
};

export const fetchCalcomConfig = async (token: string): Promise<CalcomConfig> => {
  const res = await axios.get(`${apiUrl}/meetings/calcom/config`, getAuthConfig(token));
  assertMeetingSuccess(res.data, 'Failed to load booking configuration');
  return parseCalcomConfig(res.data);
};

export const fetchCalcomSlots = async (
  token: string,
  params?: { date?: string },
): Promise<CalcomSlot[]> => {
  const res = await axios.get(`${apiUrl}/meetings/calcom/slots`, {
    ...getAuthConfig(token),
    params: params?.date ? { date: params.date } : undefined,
  });
  assertMeetingSuccess(res.data, 'Failed to load available times');
  return parseCalcomSlots(res.data);
};

export const bookCalcomMeeting = async (token: string, payload: CalcomBookingPayload) => {
  const res = await axios.post(`${apiUrl}/meetings/calcom/bookings`, payload, getAuthConfig(token));
  return assertMeetingSuccess(res.data, 'Failed to book meeting');
};

export const getCalcomEventType = (config: CalcomConfig): CalcomEventType | null =>
  config.event_type ?? config.event_types[0] ?? null;

export const fetchMyMeetings = async (token: string): Promise<MeetingListItem[]> => {
  const res = await axios.get(`${apiUrl}/meetings/me`, getAuthConfig(token));
  return parseMeetings(res.data);
};

export const fetchAdminMeetings = async (token: string): Promise<MeetingListItem[]> => {
  const res = await axios.get(`${apiUrl}/admin/meetings`, getAuthConfig(token));
  return parseMeetings(res.data);
};

export const fetchAvailableSlots = async (
  token: string,
  params: { date: string; meeting_type?: MeetingType | string },
): Promise<AvailabilitySlot[]> => {
  const query: Record<string, string> = { date: params.date };
  if (params.meeting_type) query.meeting_type = String(params.meeting_type);

  const res = await axios.get(`${apiUrl}/meetings/available-slots`, {
    ...getAuthConfig(token),
    params: query,
  });
  return parseSlots(res.data);
};

export const requestMeeting = async (token: string, payload: ClientMeetingRequestPayload) => {
  const body: Record<string, unknown> = {
    slot_id: payload.slot_id,
  };
  if (payload.meeting_type) body.meeting_type = payload.meeting_type;

  const res = await axios.post(`${apiUrl}/meetings`, body, getAuthConfig(token));

  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to submit call request');
  }

  return res.data as { message?: string; success?: boolean };
};

export const createAdminMeeting = async (token: string, payload: AdminDirectMeetingPayload) => {
  if (!isValidGoogleMeetUrl(payload.meeting_link)) {
    throw new Error('Meeting link must be a valid Google Meet URL (https://meet.google.com/...)');
  }

  const body: Record<string, unknown> = {
    client_id: payload.client_id,
    slot_id: payload.slot_id,
    meeting_link: normalizeGoogleMeetUrl(payload.meeting_link),
  };
  if (payload.designer_id) body.designer_id = payload.designer_id;
  if (payload.meeting_type) body.meeting_type = payload.meeting_type;

  const res = await axios.post(`${apiUrl}/meetings`, body, getAuthConfig(token));

  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to schedule meeting');
  }

  return res.data;
};

export const fetchAdminAvailabilitySlots = async (token: string): Promise<AvailabilitySlot[]> => {
  const res = await axios.get(`${apiUrl}/admin/meetings/availability`, getAuthConfig(token));
  return parseSlots(res.data);
};

export const createAvailabilitySlot = async (token: string, payload: CreateAvailabilitySlotPayload) => {
  const res = await axios.post(`${apiUrl}/admin/meetings/availability`, payload, getAuthConfig(token));

  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to create availability slot');
  }

  return res.data;
};

export const deleteAvailabilitySlot = async (token: string, slotId: string) => {
  const res = await axios.delete(`${apiUrl}/admin/meetings/availability/${slotId}`, getAuthConfig(token));

  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to delete slot');
  }

  return res.data;
};

export const confirmMeeting = async (token: string, meetingId: string, meetingLink: string) => {
  if (!isValidGoogleMeetUrl(meetingLink)) {
    throw new Error('Meeting link must be a valid Google Meet URL (https://meet.google.com/...)');
  }

  const res = await axios.post(
    `${apiUrl}/admin/meetings/${meetingId}/confirm`,
    { meeting_link: normalizeGoogleMeetUrl(meetingLink) },
    getAuthConfig(token),
  );

  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to confirm meeting');
  }

  return res.data;
};

export const rejectMeeting = async (token: string, meetingId: string, rejectionNote?: string) => {
  const res = await axios.post(
    `${apiUrl}/admin/meetings/${meetingId}/reject`,
    rejectionNote?.trim() ? { rejection_note: rejectionNote.trim() } : {},
    getAuthConfig(token),
  );

  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to reject meeting');
  }

  return res.data;
};

export const rescheduleMeeting = async (token: string, meetingId: string, slotId: string) => {
  const res = await axios.post(
    `${apiUrl}/admin/meetings/${meetingId}/reschedule`,
    { slot_id: slotId },
    getAuthConfig(token),
  );

  if (res.data?.success === false) {
    throw new Error(res.data?.message || 'Failed to reschedule meeting');
  }

  return res.data;
};

export const assignDesignerToMeeting = async (token: string, meetingId: string, designerId: string) => {
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

/** @deprecated Use requestMeeting (client) or createAdminMeeting (admin) */
export const createMeeting = createAdminMeeting;
