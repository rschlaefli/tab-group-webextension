import { createSlice, createAction, createAsyncThunk } from '@reduxjs/toolkit'

import { AppDispatch } from '@src/background'
import { RootState } from './configureStore'
import { getBrowserSafe } from '@src/lib/utils'

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

// THUNKS
export const openOptionsPage = createAsyncThunk(
  'tabGroups/closeTabGroup',
  async (): Promise<void> => {
    const browser = await getBrowserSafe()
    browser.runtime.openOptionsPage()
  }
)

// ALIASES
export const openOptionsPageAlias = createAction('settings/openOptionsPage')
export const settingsAliases = {
  [openOptionsPageAlias.type]: openOptionsPage,
}
