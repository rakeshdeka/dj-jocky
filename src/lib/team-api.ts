import axios from 'axios';
import { toMessageText } from './admin-settings-shared';

export const apiBaseUrl = import.meta.env.VITE_API_URL;

const getAuthConfig = (token: string | null) => ({
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});

const readNestedMessage = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.trim()) return record.message.trim();
  if (record.error !== undefined) return readNestedMessage(record.error);
  return null;
};

const getResponseErrorMessage = (data: unknown, fallback: string): string => {
  const nested = readNestedMessage(data);
  if (nested) return nested;
  return toMessageText(data, fallback);
};

const assertTeamSuccess = (data: unknown, fallback: string) => {
  if (data && typeof data === 'object' && (data as Record<string, unknown>).success === false) {
    throw new Error(getResponseErrorMessage(data, fallback));
  }
  return data;
};

const isGenericHttpError = (message: string) =>
  /^Request failed with status code \d+$/i.test(message) ||
  /^Network Error$/i.test(message);

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;
    const apiMessage = data ? getResponseErrorMessage(data, '') : '';
    if (apiMessage) return apiMessage;
  }

  if (error instanceof Error && error.message && !isGenericHttpError(error.message)) {
    return error.message;
  }

  return fallback;
};

export type TeamUserRef = {
  _id?: string;
  name?: string;
  email?: string;
};

export type Team = {
  _id: string;
  name?: string;
  owner_id?: string | TeamUserRef;
  billing_user_id?: string;
  role?: string;
  createdAt?: string;
};

export type TeamMember = {
  _id: string;
  user_id?: string | TeamUserRef;
  name?: string;
  email?: string;
  role?: 'owner' | 'member' | string;
  status?: 'active' | 'pending' | string;
  joined_at?: string;
  invite_expires_at?: string | null;
  createdAt?: string;
};

export type TeamInvite = {
  _id: string;
  email: string;
  name?: string;
  status?: 'pending' | 'accepted' | 'expired' | 'cancelled' | string;
  invited_at?: string;
  expires_at?: string;
  createdAt?: string;
};

export type TeamCounts = {
  activeMembers: number;
  pendingInvites: number;
  maxMembers: number;
};

export type TeamDetails = {
  team: Team;
  members: TeamMember[];
  pendingInvites: TeamInvite[];
  isOwner: boolean;
  isMember: boolean;
  counts: TeamCounts;
  owner?: TeamUserRef;
};

export type TeamInvitePreview = {
  email: string;
  name?: string;
  teamName?: string;
  ownerName?: string;
  ownerEmail?: string;
  expiresAt?: string;
  valid: boolean;
};

export type IncomingTeamInvite = {
  _id: string;
  team_id: string;
  team_name: string;
  invited_by?: string;
  invited_by_email?: string;
  email: string;
  expires_at?: string;
  created_at?: string;
};

const readUserRef = (value: unknown): TeamUserRef | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return { _id: value };
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return {
      _id: record._id ? String(record._id) : record.id ? String(record.id) : undefined,
      name: record.name ? String(record.name) : undefined,
      email: record.email ? String(record.email) : undefined,
    };
  }
  return undefined;
};

const normalizeMember = (raw: Record<string, unknown>): TeamMember => {
  const userId = raw.user_id ?? raw.user;
  const userRef = readUserRef(userId);
  return {
    _id: String(raw._id ?? raw.id ?? userRef?._id ?? ''),
    user_id: typeof userId === 'string' ? userId : userRef,
    name: String(raw.name ?? userRef?.name ?? 'Team member'),
    email: String(raw.email ?? userRef?.email ?? ''),
    role: raw.role ? String(raw.role) : 'member',
    status: raw.status ? String(raw.status) : 'active',
    joined_at: raw.joined_at ? String(raw.joined_at) : undefined,
    invite_expires_at:
      raw.invite_expires_at === null
        ? null
        : raw.invite_expires_at
          ? String(raw.invite_expires_at)
          : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
  };
};

const normalizeInvite = (raw: Record<string, unknown>): TeamInvite => ({
  _id: String(raw._id ?? raw.id ?? ''),
  email: String(raw.email ?? ''),
  name: raw.name ? String(raw.name) : undefined,
  status: raw.status ? String(raw.status) : 'pending',
  invited_at: raw.invited_at ? String(raw.invited_at) : undefined,
  expires_at: raw.expires_at
    ? String(raw.expires_at)
    : raw.invite_expires_at
      ? String(raw.invite_expires_at)
      : undefined,
  createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
});

const memberToPendingInvite = (member: TeamMember): TeamInvite => ({
  _id: member._id,
  email: member.email,
  name: member.name,
  status: 'pending',
  expires_at: member.invite_expires_at || undefined,
  createdAt: member.createdAt,
});

export const parseTeamResponse = (data: unknown): TeamDetails => {
  const record = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const teamRecord = (record.team && typeof record.team === 'object'
    ? record.team
    : record) as Record<string, unknown>;
  const countsRecord = (record.counts && typeof record.counts === 'object'
    ? record.counts
    : {}) as Record<string, unknown>;

  const membersRaw = Array.isArray(record.members)
    ? record.members
    : Array.isArray(teamRecord.members)
      ? teamRecord.members
      : [];

  const invitesRaw = Array.isArray(record.pending_invites)
    ? record.pending_invites
    : Array.isArray(record.invites)
      ? record.invites
      : Array.isArray(record.pendingInvites)
        ? record.pendingInvites
        : [];

  const allMembers = membersRaw.map((item) => normalizeMember(item as Record<string, unknown>));
  const members = allMembers.filter((member) => member.status !== 'pending');
  const pendingFromMembers = allMembers
    .filter((member) => member.status === 'pending')
    .map(memberToPendingInvite);

  const pendingInvites = [
    ...invitesRaw.map((item) => normalizeInvite(item as Record<string, unknown>)),
    ...pendingFromMembers,
  ].filter((invite) => invite.status === 'pending' || !invite.status);

  const ownerMember = members.find((member) => member.role === 'owner');
  const owner =
    readUserRef(record.owner ?? teamRecord.owner_id ?? teamRecord.owner) ??
    (ownerMember
      ? {
          _id: getMemberUserId(ownerMember),
          name: ownerMember.name,
          email: ownerMember.email,
        }
      : undefined);

  const activeMembers =
    typeof countsRecord.active_members === 'number'
      ? countsRecord.active_members
      : members.filter((member) => member.role !== 'owner').length;

  const pendingInviteCount =
    typeof countsRecord.pending_invites === 'number'
      ? countsRecord.pending_invites
      : pendingInvites.length;

  const maxMembers =
    typeof countsRecord.max_members === 'number'
      ? countsRecord.max_members
      : typeof record.max_members === 'number'
        ? record.max_members
        : 50;

  const isOwner = Boolean(
    teamRecord.is_owner ?? record.is_owner ?? record.isOwner ?? teamRecord.role === 'owner',
  );
  const isMember = Boolean(teamRecord.is_member ?? record.is_member ?? record.isMember);

  return {
    team: {
      _id: String(teamRecord._id ?? teamRecord.id ?? ''),
      name: teamRecord.name ? String(teamRecord.name) : undefined,
      owner_id: readUserRef(teamRecord.owner_id ?? owner),
      billing_user_id: teamRecord.billing_user_id
        ? String(teamRecord.billing_user_id)
        : undefined,
      role: teamRecord.role ? String(teamRecord.role) : undefined,
      createdAt: teamRecord.createdAt ? String(teamRecord.createdAt) : undefined,
    },
    members,
    pendingInvites,
    isOwner,
    isMember,
    counts: {
      activeMembers,
      pendingInvites: pendingInviteCount,
      maxMembers,
    },
    owner,
  };
};

export const parseInvitePreview = (data: unknown): TeamInvitePreview => {
  const record = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const invite = (record.invite && typeof record.invite === 'object'
    ? record.invite
    : record) as Record<string, unknown>;
  const team = (record.team && typeof record.team === 'object'
    ? record.team
    : {}) as Record<string, unknown>;
  const owner = readUserRef(record.owner ?? team.owner ?? team.owner_id);

  const email = String(invite.email ?? record.email ?? '');
  const expiresAt = invite.expires_at ?? record.expires_at;

  return {
    email,
    name: invite.name ? String(invite.name) : record.name ? String(record.name) : undefined,
    teamName: team.name ? String(team.name) : record.team_name ? String(record.team_name) : undefined,
    ownerName: owner?.name,
    ownerEmail: owner?.email,
    expiresAt: expiresAt ? String(expiresAt) : undefined,
    valid: record.valid !== false && Boolean(email),
  };
};

const normalizeIncomingInvite = (raw: Record<string, unknown>): IncomingTeamInvite => ({
  _id: String(raw._id ?? raw.id ?? ''),
  team_id: String(raw.team_id ?? ''),
  team_name: String(raw.team_name ?? 'Team'),
  invited_by: raw.invited_by ? String(raw.invited_by) : undefined,
  invited_by_email: raw.invited_by_email ? String(raw.invited_by_email) : undefined,
  email: String(raw.email ?? ''),
  expires_at: raw.expires_at ? String(raw.expires_at) : undefined,
  created_at: raw.created_at ? String(raw.created_at) : undefined,
});

export const parseIncomingInvites = (data: unknown): IncomingTeamInvite[] => {
  const record = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const invitesRaw = Array.isArray(record.invites) ? record.invites : [];
  return invitesRaw.map((item) => normalizeIncomingInvite(item as Record<string, unknown>));
};

export const fetchTeam = async (token: string | null): Promise<TeamDetails> => {
  const res = await axios.get(`${apiBaseUrl}/team`, getAuthConfig(token));
  assertTeamSuccess(res.data, 'Failed to load team');
  return parseTeamResponse(res.data);
};

export const fetchIncomingTeamInvites = async (
  token: string | null,
): Promise<IncomingTeamInvite[]> => {
  const res = await axios.get(`${apiBaseUrl}/team/invites/incoming`, getAuthConfig(token));
  assertTeamSuccess(res.data, 'Failed to load invitations');
  return parseIncomingInvites(res.data);
};

export const inviteTeamMember = async (
  token: string | null,
  payload: { email: string; name?: string },
) => {
  const res = await axios.post(`${apiBaseUrl}/team/invites`, payload, getAuthConfig(token));
  return assertTeamSuccess(res.data, 'Failed to send invitation');
};

export const previewTeamInvite = async (inviteToken: string): Promise<TeamInvitePreview> => {
  const res = await axios.get(`${apiBaseUrl}/team/invites/preview`, {
    params: { token: inviteToken },
    withCredentials: true,
  });
  assertTeamSuccess(res.data, 'This invite link is invalid or has expired');
  return parseInvitePreview(res.data);
};

export const acceptTeamInvite = async (token: string | null, inviteToken: string) => {
  const res = await axios.post(
    `${apiBaseUrl}/team/invites/accept`,
    { token: inviteToken },
    getAuthConfig(token),
  );
  const data = assertTeamSuccess(res.data, 'Failed to accept invitation');
  return parseTeamResponse(data);
};

export const acceptIncomingTeamInvite = async (
  token: string | null,
  inviteId: string,
): Promise<TeamDetails> => {
  const res = await axios.post(
    `${apiBaseUrl}/team/invites/${inviteId}/accept`,
    {},
    getAuthConfig(token),
  );
  const data = assertTeamSuccess(res.data, 'Failed to accept invitation');
  return parseTeamResponse(data);
};

export const declineIncomingTeamInvite = async (token: string | null, inviteId: string) => {
  const res = await axios.post(
    `${apiBaseUrl}/team/invites/${inviteId}/decline`,
    {},
    getAuthConfig(token),
  );
  return assertTeamSuccess(res.data, 'Failed to decline invitation');
};

export const cancelTeamInvite = async (token: string | null, inviteId: string) => {
  const res = await axios.delete(`${apiBaseUrl}/team/invites/${inviteId}`, getAuthConfig(token));
  return assertTeamSuccess(res.data, 'Failed to cancel invitation');
};

export const removeTeamMember = async (token: string | null, memberId: string) => {
  const res = await axios.delete(`${apiBaseUrl}/team/members/${memberId}`, getAuthConfig(token));
  return assertTeamSuccess(res.data, 'Failed to remove member');
};

export const leaveTeam = async (token: string | null) => {
  const res = await axios.post(`${apiBaseUrl}/team/leave`, {}, getAuthConfig(token));
  return assertTeamSuccess(res.data, 'Failed to leave team');
};

export const getMemberDisplayName = (member: TeamMember) =>
  member.name?.trim() || member.email || 'Team member';

export const getMemberInitials = (member: TeamMember) => {
  const source = getMemberDisplayName(member);
  return source
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export const isTeamOwner = (member: TeamMember) =>
  member.role === 'owner' || member.role === 'Owner';

export const getMemberUserId = (member: TeamMember) => {
  if (typeof member.user_id === 'string') return member.user_id;
  return member.user_id?._id;
};

export const getTeamSeatsUsed = (team: TeamDetails) =>
  team.counts.activeMembers + team.counts.pendingInvites;

export { toErrorMessage as getTeamErrorMessage };
