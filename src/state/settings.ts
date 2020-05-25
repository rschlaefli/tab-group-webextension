import { createSlice, createAction, createAsyncThunk } from '@reduxjs/toolkit'
import { browser } from 'webextension-polyfill-ts'

import { performBrowserActionSafe, getBrowserSafe } from '@src/lib/utils'
import { AppDispatch, bootstrap } from '@src/background'
import { RootState } from './configureStore'
import { processSettings } from '@src/lib/listeners'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    isDebugLoggingEnabled: true,
    isHeuristicsBackendEnabled: false,
    isFocusModeEnabled: false,
    tutorialProgress: 0,
  },
  reducers: {
    updateIsDebugLoggingEnabled(state, action): void {
      state.isDebugLoggingEnabled = action.payload
    },
    updateIsHeuristicsBackendEnabled(state, action): void {
      state.isHeuristicsBackendEnabled = action.payload
    },
    toggleFocusMode(state): void {
      state.isFocusModeEnabled = !state.isFocusModeEnabled
    },
    resetTutorialProgress(state): void {
      state.tutorialProgress = 0
    },
    updateTutorialProgress(state, action): void {
      state.tutorialProgress = action.payload
    },
  },
})

const { actions, reducer } = settingsSlice
export const {
  toggleFocusMode,
  resetTutorialProgress,
  updateIsDebugLoggingEnabled,
  updateIsHeuristicsBackendEnabled,
  updateTutorialProgress,
} = actions
export default reducer

// THUNKS
export const openOptionsPage = createAsyncThunk(
  'settings/openOptionsPage',
  async (): Promise<void> => {
    await performBrowserActionSafe(async (browser) => {
      await browser.runtime.openOptionsPage()
    })
  }
)

export const reloadExtension = createAsyncThunk(
  'settings/reloadExtension',
  async (): Promise<void> => {
    await performBrowserActionSafe(async (browser) => {
      await browser.runtime.reload()
    })
  }
)

export const toggleDebugLogging = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>(
  'settings/toggleDebugLogging',
  async (_, thunkAPI): Promise<void> => {
    const state = thunkAPI.getState()
    thunkAPI.dispatch(updateIsDebugLoggingEnabled(!state.settings.isDebugLoggingEnabled))
    processSettings(thunkAPI)({ isDebugLoggingEnabled: !state.settings.isDebugLoggingEnabled })
  }
)

export const toggleHeuristicsBackend = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>(
  'settings/toggleHeuristicsBackend',
  async (_, thunkAPI): Promise<void> => {
    const state = thunkAPI.getState()
    thunkAPI.dispatch(updateIsHeuristicsBackendEnabled(!state.settings.isHeuristicsBackendEnabled))
    processSettings(thunkAPI)({
      isHeuristicsBackendEnabled: !state.settings.isHeuristicsBackendEnabled,
    })
  }
)

// ALIASES
export const openOptionsPageAlias = createAction('settings/openOptionsPageAlias')
export const toggleDebugLoggingAlias = createAction('settings/toggleDebugLoggingAlias')
export const toggleHeuristicsBackendAlias = createAction('settings/toggleHeuristicsBackendAlias')
export const reloadExtensionAlias = createAction('settings/reloadExtensionAlias')
export const settingsAliases = {
  [openOptionsPageAlias.type]: openOptionsPage,
  [toggleDebugLoggingAlias.type]: toggleDebugLogging,
  [toggleHeuristicsBackendAlias.type]: toggleHeuristicsBackend,
  [reloadExtensionAlias.type]: reloadExtension,
}
