import { createSlice, createAction, createAsyncThunk } from '@reduxjs/toolkit'
import jsSHA from 'jssha'
import { remove } from 'ramda'

import { performBrowserActionSafe, getBrowserSafe } from '@src/lib/utils'
import { AppDispatch } from '@src/background'
import { RootState } from './configureStore'
import { processSettings } from '@src/lib/listeners'
import { openCurrentTab } from './currentTabs'
import { HEURISTICS_STATUS } from '@src/types/Extension'

const DEFAULT_HEURISTICS_CONFIG = (name = 'Default') => ({ name, algorithm: 'simap' })

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    groupingActivationKey: '',
    isDebugLoggingEnabled: true,
    isHeuristicsBackendEnabled: false,
    isFocusModeEnabled: false,
    heuristicsStatus: null,
    heuristicsActiveConfig: 0,
    heuristicsConfigs: [DEFAULT_HEURISTICS_CONFIG()],
  },
  reducers: {
    updateHeuristicsStatus(state, action): void {
      state.heuristicsStatus = action.payload
    },
    updateIsDebugLoggingEnabled(state, action): void {
      state.isDebugLoggingEnabled = action.payload
    },
    updateIsHeuristicsBackendEnabled(state, action): void {
      state.isHeuristicsBackendEnabled = action.payload
    },
    toggleFocusMode(state): void {
      state.isFocusModeEnabled = !state.isFocusModeEnabled
    },
    setGroupingActivationKey(state, action): void {
      try {
        const sha512 = new jsSHA('SHA-512' as any, 'TEXT' as any)
        sha512.update(action.payload)
        state.groupingActivationKey = sha512.getHash('HEX')
      } catch (e) {
        console.error(e)
      }
    },
    addHeuristicsConfig(state): void {
      state.heuristicsConfigs.push(DEFAULT_HEURISTICS_CONFIG(new Date().toDateString()))
      state.heuristicsActiveConfig = state.heuristicsConfigs.length - 1
    },
    removeHeuristicsConfig(state, action): void {
      if (action.payload > 0 && state.heuristicsConfigs.length > action.payload) {
        state.heuristicsConfigs = remove(action.payload, 1, state.heuristicsConfigs)
      }
    },
    updateActiveHeuristicsConfig(state, action): void {
      if (
        Number.isSafeInteger(action.payload) &&
        action.payload >= 0 &&
        state.heuristicsConfigs.length > action.payload
      ) {
        state.heuristicsActiveConfig = action.payload
      }
    },
    updateHeuristicsConfig(state, action): void {
      if (
        Number.isSafeInteger(action.payload.configIndex) &&
        action.payload.configIndex > 0 &&
        state.heuristicsConfigs.length > action.payload.configIndex
      ) {
        state.heuristicsConfigs[action.payload.configIndex] = action.payload.configValue
      }
    },
  },
})

const { actions, reducer } = settingsSlice
export const {
  updateHeuristicsStatus,
  toggleFocusMode,
  updateIsDebugLoggingEnabled,
  updateIsHeuristicsBackendEnabled,
  setGroupingActivationKey,
  addHeuristicsConfig,
  removeHeuristicsConfig,
  updateActiveHeuristicsConfig,
  updateHeuristicsConfig,
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
    const isDebugLoggingEnabled = !state.settings.isDebugLoggingEnabled
    thunkAPI.dispatch(updateIsDebugLoggingEnabled(isDebugLoggingEnabled))
    processSettings(thunkAPI)({ isDebugLoggingEnabled })
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
    const isHeuristicsBackendEnabled = !state.settings.isHeuristicsBackendEnabled
    if (!isHeuristicsBackendEnabled) {
      thunkAPI.dispatch(updateHeuristicsStatus(null))
    }
    thunkAPI.dispatch(updateIsHeuristicsBackendEnabled(isHeuristicsBackendEnabled))
    processSettings(thunkAPI)({ isHeuristicsBackendEnabled })
  }
)

export const openExtensionUI = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>(
  'settings/openExtensionUI',
  async (_, thunkAPI): Promise<void> => {
    const browser = await getBrowserSafe()
    const state = thunkAPI.getState()

    // get the currently active tab
    const currentTab = await browser.tabs.query({
      active: true,
    })

    // if there are any existing tab group pages, get them for recycling
    // otherwise, open a new tab with the tab group overview
    const existingTabs = state.currentTabs.tabs.filter((tab) => tab.title === 'Tab Groups')
    if (existingTabs.length > 0) {
      thunkAPI.dispatch(openCurrentTab({ payload: existingTabs[0].hash as string }) as any)
    } else {
      await browser.tabs.create({ url: 'ui.html' })
    }

    // remove the source tab if it was a "New Tab" page
    if (currentTab?.length > 0 && currentTab[0]?.title === 'New Tab') {
      await browser.tabs.remove(currentTab[0].id as number)
    }
  }
)

export const processHeuristicsStatusUpdate = createAsyncThunk<
  void,
  string,
  { dispatch: AppDispatch; state: RootState }
>('settings/updateHeuristicsStatus', async (heuristicsStatus, thunkAPI) => {
  switch (heuristicsStatus) {
    case HEURISTICS_STATUS.ALREADY_RUNNING: {
      thunkAPI.dispatch(updateHeuristicsStatus(HEURISTICS_STATUS.ALREADY_RUNNING))
      break
    }
    case HEURISTICS_STATUS.RUNNING: {
      thunkAPI.dispatch(updateHeuristicsStatus(HEURISTICS_STATUS.RUNNING))
      break
    }
  }
})

// ALIASES
export const openOptionsPageAlias = createAction('settings/openOptionsPageAlias')
export const toggleDebugLoggingAlias = createAction('settings/toggleDebugLoggingAlias')
export const toggleHeuristicsBackendAlias = createAction('settings/toggleHeuristicsBackendAlias')
export const reloadExtensionAlias = createAction('settings/reloadExtensionAlias')
export const openExtensionUIAlias = createAction('settings/openExtensionUIAlias')
export const settingsAliases = {
  [openOptionsPageAlias.type]: openOptionsPage,
  [toggleDebugLoggingAlias.type]: toggleDebugLogging,
  [toggleHeuristicsBackendAlias.type]: toggleHeuristicsBackend,
  [reloadExtensionAlias.type]: reloadExtension,
  [openExtensionUIAlias.type]: openExtensionUI,
}
