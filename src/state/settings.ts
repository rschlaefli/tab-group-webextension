import { createSlice, createAction, createAsyncThunk } from '@reduxjs/toolkit'
import jsSHA from 'jssha'
import { remove } from 'ramda'

import { performBrowserActionSafe, getBrowserSafe, postNativeMessage } from '@src/lib/utils'
import { AppDispatch } from '@src/background'
import { RootState } from './configureStore'
import { processSettings } from '@src/lib/listeners'
import { openCurrentTab } from './currentTabs'
import { HEURISTICS_STATUS, TAB_ACTION } from '@src/types/Extension'
import { Runtime } from 'webextension-polyfill-ts'
import { nativePort } from '@src/lib/listeners'

const GRAPH_GENERATION_DEFAULTS = {
  minWeight: 2,
  expireAfter: 14,
  sameOriginFactor: 0.4,
  urlSimilarityFactor: 0.6,
}

const GROUPING_DEFAULTS = {
  maxGroups: 10,
  minGroupSize: 3,
  maxGroupSize: 10,
}

export const DEFAULT_WATSET_CONFIG = {
  name: 'Watset Default (Legacy)',
  heuristics: { algorithm: 'watset', minOverlap: 0.2 },
  graphGeneration: GRAPH_GENERATION_DEFAULTS,
  grouping: {
    ...GROUPING_DEFAULTS,
    expansion: 2,
    powerCoefficient: 2,
  },
}

export const DEFAULT_SIMAP_CONFIG = (name = 'SiMap Default') => ({
  name,
  heuristics: { algorithm: 'simap', minOverlap: 0.2 },
  graphGeneration: GRAPH_GENERATION_DEFAULTS,
  grouping: {
    ...GROUPING_DEFAULTS,
    tau: 0.15,
    resStart: 0.0001,
    resEnd: 0.05,
    resAcc: 0.001,
    largestCC: false,
  },
})

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    groupingActivationKey: '',
    isHeuristicsBackendEnabled: false,
    isFocusModeEnabled: false,
    heuristicsStatus: null,
    heuristicsActiveConfig: 1,
    heuristicsConfigs: [DEFAULT_WATSET_CONFIG, DEFAULT_SIMAP_CONFIG()],
  },
  reducers: {
    updateHeuristicsStatus(state, action): void {
      state.heuristicsStatus = action.payload
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
      state.heuristicsConfigs.push(DEFAULT_SIMAP_CONFIG(new Date().toDateString()))
      state.heuristicsActiveConfig = state.heuristicsConfigs.length - 1
    },
    removeHeuristicsConfig(state, action): void {
      if (action.payload > 1 && state.heuristicsConfigs.length > action.payload) {
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
        action.payload.configIndex > 1 &&
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

export const enableHeuristicsBackend = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>(
  'settings/enableHeuristicsBackend',
  async (_, thunkAPI): Promise<void> => {
    const state = thunkAPI.getState()
    if (!state.settings.isHeuristicsBackendEnabled) {
      thunkAPI.dispatch(updateHeuristicsStatus(null))
    }
    thunkAPI.dispatch(updateIsHeuristicsBackendEnabled(true))
    processSettings(thunkAPI)({ isHeuristicsBackendEnabled: true })
  }
)

export const disableHeuristicsBackend = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>(
  'settings/disableHeuristicsBackend',
  async (_, thunkAPI): Promise<void> => {
    thunkAPI.dispatch(updateHeuristicsStatus(null))
    thunkAPI.dispatch(updateIsHeuristicsBackendEnabled(false))
    postNativeMessage(nativePort, {
      action: TAB_ACTION.STOP,
      payload: {},
    })
    processSettings(thunkAPI)({ isHeuristicsBackendEnabled: false })
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
    if (state.settings.isHeuristicsBackendEnabled) {
      thunkAPI.dispatch(disableHeuristicsBackend() as any)
    } else {
      thunkAPI.dispatch(enableHeuristicsBackend() as any)
    }
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
>('settings/processHeuristicsStatusUpdate', async (heuristicsStatus, thunkAPI) => {
  switch (heuristicsStatus) {
    case HEURISTICS_STATUS.ALREADY_RUNNING: {
      thunkAPI.dispatch(updateHeuristicsStatus(HEURISTICS_STATUS.ALREADY_RUNNING))
      performBrowserActionSafe(async (browser) => {
        await browser.tabs.create({ url: 'already_running.html', active: true })
      })
      break
    }
    case HEURISTICS_STATUS.FAILED: {
      thunkAPI.dispatch(updateHeuristicsStatus(HEURISTICS_STATUS.ALREADY_RUNNING))
      performBrowserActionSafe(async (browser) => {
        await browser.tabs.create({ url: 'troubleshooting.html', active: true })
      })
      break
    }
    default:
      thunkAPI.dispatch(updateHeuristicsStatus(heuristicsStatus))
  }
})

export const pauseHeuristicsProcessing = createAsyncThunk<
  void,
  Runtime.Port,
  { dispatch: AppDispatch; state: RootState }
>('settings/pauseHeuristicsProcessing', async (nativePort) => {
  console.log('[background] Pausing background processing')
  postNativeMessage(nativePort, {
    action: TAB_ACTION.PAUSE,
    payload: {},
  })
})

export const resumeHeuristicsProcessing = createAsyncThunk<
  void,
  Runtime.Port,
  { dispatch: AppDispatch; state: RootState }
>('settings/resumeHeuristicsProcessing', async (nativePort) => {
  console.log('[background] Resuming background processing')
  postNativeMessage(nativePort, {
    action: TAB_ACTION.RESUME,
    payload: {},
  })
})

// ALIASES
export const openOptionsPageAlias = createAction('settings/openOptionsPageAlias')
export const toggleHeuristicsBackendAlias = createAction('settings/toggleHeuristicsBackendAlias')
export const reloadExtensionAlias = createAction('settings/reloadExtensionAlias')
export const openExtensionUIAlias = createAction('settings/openExtensionUIAlias')
export const processHeuristicsStatusUpdateAlias = createAction(
  'settings/processHeuristicsStatusUpdateAlias'
)
export const settingsAliases = {
  [openOptionsPageAlias.type]: openOptionsPage,
  [toggleHeuristicsBackendAlias.type]: toggleHeuristicsBackend,
  [reloadExtensionAlias.type]: reloadExtension,
  [openExtensionUIAlias.type]: openExtensionUI,
  [processHeuristicsStatusUpdateAlias.type]: processHeuristicsStatusUpdate,
}
