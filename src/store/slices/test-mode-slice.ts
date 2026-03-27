import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type TestRole = "client" | "provider" | "sub_admin" | "super_admin" | "admin"

interface TestModeState {
  enabled: boolean
  currentRole: TestRole
}

const initialState: TestModeState ={
  enabled: false,
  currentRole: "client",
}


export const testModeSlice = createSlice({
  name: "testMode",
  initialState,
  reducers: {
    enableTestMode: (state) => {
      state.enabled = true
    },
    switchRole: (state, action: PayloadAction<TestRole>) => {
      state.currentRole = action.payload
    },
  },
})

export const { enableTestMode, switchRole } = testModeSlice.actions
export default testModeSlice.reducer
