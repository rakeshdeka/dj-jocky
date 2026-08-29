import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'client' | 'designer' | 'admin'

export interface User {
  id: string
  role: UserRole
  email: string
  name?: string
  bio?: string
  company?: string
  phone?: string
  portfolioUrl?: string
  profilePictureUrl?: string | null
}

interface AuthState {
  token: string | null
  user: User | null
  isHydrated: boolean
}

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: getStoredUser(),
  isHydrated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth: (state) => {
      state.isHydrated = true
    },

    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isHydrated = true

      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },

    logout: (state) => {
      state.token = null
      state.user = null
      state.isHydrated = true
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (!state.user) return
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
  },
})

export const { setCredentials, logout, hydrateAuth, updateUser } = authSlice.actions
export default authSlice.reducer