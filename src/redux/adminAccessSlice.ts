import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  type AdminAccessPayload,
  type AdminMenuAccess,
  fetchAdminAccess,
  mergeLoginAccess,
  normalizePermissions,
} from '../lib/admin-access-api';
import { logout } from './authSlice';

type AdminAccessState = {
  isLoaded: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  menu: AdminMenuAccess | null;
  error: string | null;
};

const STORAGE_KEY = 'admin_access';

const readStoredAccess = (): AdminMenuAccess | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { menu?: AdminMenuAccess; isSuperAdmin?: boolean };
    return parsed.menu ? normalizePermissions(parsed.menu) : null;
  } catch {
    return null;
  }
};

const readStoredSuperAdmin = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { isSuperAdmin?: boolean };
    return Boolean(parsed.isSuperAdmin);
  } catch {
    return false;
  }
};

const persistAccess = (menu: AdminMenuAccess | null, isSuperAdmin: boolean) => {
  if (!menu) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ menu, isSuperAdmin }));
};

const initialState: AdminAccessState = {
  isLoaded: false,
  isLoading: false,
  isSuperAdmin: readStoredSuperAdmin(),
  menu: readStoredAccess(),
  error: null,
};

export const loadAdminAccess = createAsyncThunk(
  'adminAccess/load',
  async (token: string, { rejectWithValue }) => {
    try {
      return await fetchAdminAccess(token);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load access');
    }
  },
);

const applyAccessPayload = (state: AdminAccessState, payload: AdminAccessPayload) => {
  state.isSuperAdmin = Boolean(payload.is_super_admin);
  state.menu = payload.menu ?? payload.permissions ?? null;
  state.isLoaded = true;
  state.isLoading = false;
  state.error = null;
  persistAccess(state.menu, state.isSuperAdmin);
};

const adminAccessSlice = createSlice({
  name: 'adminAccess',
  initialState,
  reducers: {
    setAdminAccessFromLogin: (state, action: { payload: unknown }) => {
      const merged = mergeLoginAccess(action.payload);
      applyAccessPayload(state, merged);
    },
    clearAdminAccess: (state) => {
      state.isLoaded = false;
      state.isLoading = false;
      state.isSuperAdmin = false;
      state.menu = null;
      state.error = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAdminAccess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAdminAccess.fulfilled, (state, action) => {
        applyAccessPayload(state, action.payload);
      })
      .addCase(loadAdminAccess.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoaded = true;
        state.error = (action.payload as string) || 'Failed to load access';
      })
      .addCase(logout, (state) => {
        state.isLoaded = false;
        state.isLoading = false;
        state.isSuperAdmin = false;
        state.menu = null;
        state.error = null;
        localStorage.removeItem(STORAGE_KEY);
      });
  },
});

export const { setAdminAccessFromLogin, clearAdminAccess } = adminAccessSlice.actions;
export default adminAccessSlice.reducer;
