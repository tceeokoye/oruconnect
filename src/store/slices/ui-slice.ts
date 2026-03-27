import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface UIState {
  sidebarOpen: boolean
  theme: "light" | "dark" | "system"
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: "system",
}

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload
    },
  },
})

export const { toggleSidebar, setTheme } = uiSlice.actions
export default uiSlice.reducer
