import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import { Tabs, Runtime } from 'webextension-polyfill-ts'
import { take, prepend, append, findIndex, remove, update, find, keys, any } from 'ramda'
import _debounce from 'lodash.debounce'

import {
  getBrowserSafe,
  augmentTabExtras,
  postNativeMessage,
  pickRelevantProperties,
} from '@src/lib/utils'
import { ITab, TAB_ACTION } from '@src/types/Extension'
import { AppDispatch } from '@src/background'
import { RootState } from './configureStore'

const currentTabsSlice = createSlice({
  name: 'currentTabs',
  initialState: {
    collapsed: false,
    previousTabId: -1,
    activeTab: -1,
    activeWindow: 0,
    tabs: [] as ITab[],
    tabHashes: [] as (string | null)[],
    recentTabs: [] as ITab[],
    recentTabsCollapsed: true,
  },
  reducers: {
    collapseCurrentTabs(state): void {
      state.collapsed = !state.collapsed
    },
    collapseRecentTabs(state): void {
      state.recentTabsCollapsed = !state.recentTabsCollapsed
    },
    updateTabs(state, action): void {
      // initialize derived properties for all existing tabs
      const allTabs = action.payload.map(augmentTabExtras)

      state.tabs = allTabs
      state.tabHashes = allTabs.map((tab) => tab.hash)

      console.log('[currentTabs] UPDATE', allTabs)
    },
    createTab(state, action): void {
      const augmentedTab = augmentTabExtras(action.payload.tabData)

      state.tabs = append(augmentedTab, state.tabs)
      state.tabHashes = append(augmentedTab.hash, state.tabHashes)

      console.log('[currentTabs] CREATE', augmentedTab)
    },
    activateTab(state, action): void {
      state.activeTab = action.payload.tabId
      state.previousTabId = action.payload.previousTabId

      console.log('[currentTabs] ACTIVATE', action.payload)
    },
    updateTab(state, action): void {
      const tabIndex = findIndex((tab) => tab.id === action.payload.tabId, state.tabs)

      if (tabIndex > -1) {
        // merge the existing tab with the changed properties
        let mergedTab = {
          ...state.tabs[tabIndex],
          ...action.payload.tabData,
          windowId: action.payload.tabData.newWindowId || state.tabs[tabIndex].windowId,
        }

        // check whether a property relevant for the tab hash has been changed
        const hashInvalidated = keys(action.payload.tabData).some((key) =>
          ['url', 'title'].includes(key as string)
        )

        // if the hash has been invalidated, recompute any dependent properties
        if (hashInvalidated) {
          mergedTab = augmentTabExtras(mergedTab)
          state.tabHashes = update(tabIndex, mergedTab.hash, state.tabHashes)
        }

        // update the tab in state
        state.tabs[tabIndex] = mergedTab

        console.log('[currentTabs] UPDATE', action.payload.tabData, mergedTab)
      }
    },
    removeTab(state, action): void {
      const tabIndex = findIndex((tab) => tab.id === action.payload.tabId, state.tabs)

      if (tabIndex > -1) {
        const tabData = state.tabs[tabIndex]
        console.log('[currentTabs] REMOVE', tabData)

        if (tabData.title && !['New Tab', 'Tab Groups'].includes(tabData.title)) {
          state.recentTabs = take(5, prepend(tabData, state.recentTabs))
        }

        state.tabs = remove(tabIndex, 1, state.tabs)
        state.tabHashes = remove(tabIndex, 1, state.tabHashes)
      }
    },
  },
})

const { actions, reducer } = currentTabsSlice
export const {
  collapseRecentTabs,
  collapseCurrentTabs,
  createTab,
  updateTab,
  removeTab,
  activateTab,
  updateTabs,
} = actions
export default reducer

// THUNKS
export const initializeCurrentTabs = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>(
  'currentTabs/initialize',
  async (_, thunkAPI): Promise<void> => {
    const browser = await getBrowserSafe()

    // query for all browser tabs that are currently open
    const tabs = await browser.tabs.query({})

    // filter tabs to only get visible ones
    // firefox can hide tabs that have been closed but might be reopened soon
    const visibleTabs = tabs.filter((tab: Tabs.Tab) => !tab.hidden)

    console.log(`[currentTabs] Initializing current tabs to:`, visibleTabs)

    // initialize the tabs
    await thunkAPI.dispatch(updateTabs(visibleTabs))
  }
)

export const closeTabsWithHashes = createAsyncThunk<
  void,
  { keepHashes?: (string | null)[]; closeHashes?: (string | null)[] },
  { dispatch: AppDispatch; state: RootState }
>(
  'currentTabs/closeTabsWithHashes',
  async ({ keepHashes, closeHashes }, thunkAPI): Promise<void> => {
    const browser = await getBrowserSafe()
    const state = thunkAPI.getState()

    let matchingTabs = [] as ITab[]
    if (keepHashes) {
      matchingTabs = state.currentTabs.tabs.filter((tab) => !keepHashes.includes(tab.hash))
    } else if (closeHashes) {
      matchingTabs = state.currentTabs.tabs.filter((tab) => closeHashes.includes(tab.hash))
    }

    await Promise.all(matchingTabs.map((tab) => browser.tabs.remove(tab.id)))
  }
)

export const closeCurrentTab = createAsyncThunk<
  void,
  { _sender?: any; payload: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'currentTabs/closeCurrentTab',
  async ({ payload: tabHash }, thunkAPI): Promise<void> => {
    await thunkAPI.dispatch(closeTabsWithHashes({ closeHashes: [tabHash] }) as any)
  }
)

export const openCurrentTab = createAsyncThunk<
  void,
  { _sender?: any; payload: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'currentTabs/openCurrentTab',
  async ({ _sender, payload: tabHash }, thunkAPI): Promise<void> => {
    const browser = await getBrowserSafe()
    const state = thunkAPI.getState()

    const tab = find((tab: ITab) => tab.hash === tabHash, state.currentTabs.tabs)

    if (tab?.id) {
      // get the selected tab
      const selectedTab = await browser.tabs.get(tab.id)

      // get the currently active window
      const currentWindow = await browser.windows.getCurrent()

      // move the tab to the current window (if it is in another one)
      // we need to do this as we cannot switch focus to another window
      if (currentWindow.id !== selectedTab.windowId) {
        await browser.tabs.move(tab.id, {
          windowId: currentWindow.id,
          index: -1,
        })
      }

      // activate the tab
      await browser.tabs.update(tab.id, { active: true, pinned: tab.pinned })

      // close the new tab page if we open a group
      if (_sender?.tab?.url && _sender.tab.id) {
        try {
          if (['moz-extension', 'chrome-extension'].includes(_sender.tab.url.split(':')[0])) {
            await browser.tabs.remove(_sender.tab.id)
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
)

const generateUpdateContents = (tabData) => () => ({
  action: TAB_ACTION.UPDATE,
  // TODO: get rid of this double hash calculation
  payload: pickRelevantProperties(augmentTabExtras(tabData as Partial<ITab>)),
})

const DEBOUNCERS = {}
const debounceUpdateNotification = (tabId: number) => {
  if (DEBOUNCERS[tabId]) {
    return DEBOUNCERS[tabId]
  }
  DEBOUNCERS[tabId] = _debounce(postNativeMessage, 2000)
  return DEBOUNCERS[tabId]
}

export const updateTabAndNotify = createAsyncThunk<
  void,
  {
    id: number
    changeData: any
    newTab?: Tabs.Tab
    nativePort?: Runtime.Port
  },
  { dispatch: AppDispatch; state: RootState }
>(
  'currentTabs/updateTabAndNotify',
  async ({ id, changeData, newTab, nativePort }, thunkAPI): Promise<void> => {
    const { status, ...rest } = changeData

    const updatedKeys = keys(rest)

    if (
      any((propertyName: any) => updatedKeys.includes(propertyName), [
        'pinned',
        'title',
        'favIconUrl',
        'url',
        'newWindowId',
      ])
    ) {
      // update the internal representation of the tab
      await thunkAPI.dispatch(updateTab({ tabId: id, tabData: changeData }))

      // notify the heuristics engine about the new tab if the tab change has completed
      if (nativePort && newTab && newTab.status == 'complete') {
        debounceUpdateNotification(id)(nativePort, generateUpdateContents(newTab))
      }
    }
  }
)

export const activateTabAndNotify = createAsyncThunk<
  void,
  any,
  { dispatch: AppDispatch; state: RootState }
>(
  'currentTabs/activateTabAndNotify',
  async ({ activeInfo, nativePort }, thunkAPI): Promise<void> => {
    // TODO: lookup hashes of new and previous active tab and send to the heuristics engine?

    await thunkAPI.dispatch(
      activateTab({
        tabId: activeInfo.tabId,
        previousTabId: activeInfo.previousTabId,
      })
    )

    await postNativeMessage(nativePort, {
      action: TAB_ACTION.ACTIVATE,
      payload: { id: activeInfo.tabId, ...activeInfo },
    })
  }
)

export const removeTabAndNotify = createAsyncThunk<void, any, { dispatch: AppDispatch }>(
  'currentTabs/removeTabAndNotify',
  async ({ tabId, removeInfo, nativePort }, thunkAPI): Promise<void> => {
    await thunkAPI.dispatch(removeTab({ tabId }))

    await postNativeMessage(nativePort, {
      action: TAB_ACTION.REMOVE,
      payload: { id: tabId, ...removeInfo },
    })
  }
)

// ALIASES
export const openCurrentTabAlias = createAction<string>('currentTabs/openCurrentTabAlias')
export const closeCurrentTabAlias = createAction<string>('currentTabs/closeCurrentTabAlias')
export const currentTabsAliases = {
  [openCurrentTabAlias.type]: openCurrentTab,
  [closeCurrentTabAlias.type]: closeCurrentTab,
}
