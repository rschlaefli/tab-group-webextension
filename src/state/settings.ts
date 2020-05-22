import { createSlice } from '@reduxjs/toolkit'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    focusModeEnabled: false,
  },
  reducers: {
    toggleFocusMode(state): void {
      state.focusModeEnabled = !state.focusModeEnabled
    },
  },
})

const { actions, reducer } = settingsSlice
export const { toggleFocusMode } = actions
export default reducer
