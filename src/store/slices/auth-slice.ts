import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type SubAdminType = "verification" | "dispute" | "moderation" | "support"

export interface User {
  id: string
  email: string
  name: string
  role: "USER" | "PROFESSIONAL" | "SUPER_ADMIN" | "OPERATIONS_ADMIN" | "CATEGORY_ADMIN" | "CONTENT_ADMIN" | "SUPPORT_ADMIN"
  verified?: boolean
  emailVerified?: boolean
  professionalId?: string
  profileImage?: string | null
  createdAt?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  token: string | null
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  token: null,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setRole: (state, action: PayloadAction<User["role"]>) => {
      if (state.user) {
        state.user.role = action.payload
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
    },
  },
})

export const tokenActions = authSlice.actions;
export const { setUser, setToken, setLoading, setRole, logout } =
  authSlice.actions;

export default authSlice.reducer;


