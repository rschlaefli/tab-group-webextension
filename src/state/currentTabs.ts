import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Tabs } from 'webextension-polyfill-ts'
import { append, findIndex, mergeRight, remove, update, find, keys, any } from 'ramda'
import { getBrowserSafe, augmentTabExtras, postNativeMessage } from '@src/lib/utils'
import { ITab, TAB_ACTION } from '@src/types/Extension'

const currentTabsSlice = createSlice({
  name: 'currentTabs',
  initialState: {
    previousTabId: -1,
    activeTab: -1,
    activeWindow: 0,
    tabs: [] as ITab[],
    tabHashes: [] as string[],
    collapsed: false,
  },
  reducers: {
    collapseCurrentTabs(state): void {
      state.collapsed = !state.collapsed
    },
    updateTabs(state, action): void {
      const allTabs = action.payload.map(augmentTabExtras)
      console.log('UPDATE', allTabs)

      state.tabs = allTabs
      state.tabHashes = allTabs.map((tab) => tab.hash)
    },
    createTab(state, action): void {
      const augmentedTab = augmentTabExtras(action.payload.tabData)
      console.log('CREATE', augmentedTab)

      state.tabs = append(augmentedTab, state.tabs)
      state.tabHashes = append(augmentedTab.hash, state.tabHashes)
    },
    activateTab(state, action): void {
      console.log('ACTIVATE', action.payload)

      state.activeTab = action.payload.tabId
      state.previousTabId = action.payload.previousTabId
    },
    updateTab(state, action): void {
      const tabIndex = findIndex((tab) => tab.id === action.payload.tabId, state.tabs)

      if (tabIndex > -1) {
        const mergedTab = mergeRight(state.tabs[tabIndex], augmentTabExtras(action.payload.tabData))
        console.log('UPDATE', action.payload.tabData, mergedTab)

        state.tabs[tabIndex] = mergedTab

        if (typeof action.payload.tabData.hash !== 'undefined') {
          state.tabHashes = update(tabIndex, mergedTab.hash, state.tabHashes)
        }
      }
    },
    removeTab(state, action): void {
      const tabIndex = findIndex((tab) => tab.id === action.payload.tabId, state.tabs)

      if (tabIndex > -1) {
        console.log('REMOVE', state.tabs[tabIndex])

        state.tabs = remove(tabIndex, 1, state.tabs)
        state.tabHashes = remove(tabIndex, 1, state.tabHashes)
      }
    },
  },
})

const { actions, reducer } = currentTabsSlice
export const {
  collapseCurrentTabs,
  createTab,
  updateTab,
  removeTab,
  activateTab,
  updateTabs,
} = actions
export default reducer

// THUNKS
export const initializeCurrentTabs = createAsyncThunk(
  'currentTabs/initialize',
  async (_, thunkAPI): Promise<void> => {
    const browser = await getBrowserSafe()

    // query for all browser tabs that are currently open
    const tabs = await browser.tabs.query({})

    // filter tabs to only get visible ones
    // firefox can hide tabs that have been closed but might be reopened soon
    const visibleTabs = tabs.filter((tab: Tabs.Tab) => !tab.hidden)

    console.log(`> Initializing current tabs to:`, visibleTabs)

    // initialize the tabs
    await thunkAPI.dispatch(updateTabs(visibleTabs))
  }
)

export const closeCurrentTab = createAsyncThunk(
  'currentTabs/closeTab',
  async (tabId: number, _): Promise<void> => {
    const browser = await getBrowserSafe()
    await browser.tabs.remove(tabId)
  }
)

export const closeTabsWithHashes = createAsyncThunk(
  'currentTabs/closeTabsWithHashes',
  async (tabHashes: string[], thunkAPI): Promise<void> => {
    const browser = await getBrowserSafe()
    const state: any = thunkAPI.getState()

    const matchingTabs = state.currentTabs.tabs.filter((tab) => tabHashes.includes(tab.hash))

    await Promise.all(matchingTabs.map((tab) => browser.tabs.remove(tab.id)))
  }
)

export const openCurrentTab = createAsyncThunk(
  'currentTabs/openCurrentTab',
  async (tabHash: string, thunkAPI): Promise<void> => {
    const browser = await getBrowserSafe()
    const state: any = thunkAPI.getState()

    const tab = find((tab: ITab) => tab.hash === tabHash, state.currentTabs.tabs)

    if (tab?.id) {
      if (tab.pinned) {
        await browser.tabs.update(tab.id, { pinned: false })
      }
      const currentTab = await browser.tabs.getCurrent()
      await browser.tabs.move(tab.id, {
        windowId: currentTab.windowId,
        index: currentTab.index + 1,
      })
    }
  }
)

export const updateTabAndNotify = createAsyncThunk(
  'currentTabs/updateTabAndNotify',
  async (args: any, thunkAPI): Promise<void> => {
    const { id, changeData, newTab, nativePort } = args
    const { status, ...rest } = changeData

    const updatedKeys = keys(rest)

    if (
      any((propertyName: any) => updatedKeys.includes(propertyName), [
        'pinned',
        'title',
        'favIconUrl',
        'url',
      ])
    ) {
      // update the internal representation of the tab
      thunkAPI.dispatch(updateTab({ id, status, ...rest }))

      // notify the heuristics engine about the new tab if the tab change has completed
      if (nativePort && newTab && status === 'completed') {
        postNativeMessage(nativePort, {
          action: TAB_ACTION.UPDATE,
          payload: { ...newTab, ...augmentTabExtras(changeData) },
        })
      }
    }
  }
)

export const activateTabAndNotify = createAsyncThunk(
  'currentTabs/activateTabAndNotify',
  async ({ activeInfo, nativePort }: any, thunkAPI): Promise<void> => {
    // TODO: lookup hashes of new and previous active tab and send to the heuristics engine?

    thunkAPI.dispatch(
      activateTab({
        tabId: activeInfo.tabId,
        previousTabId: activeInfo.previousTabId,
      })
    )

    postNativeMessage(nativePort, {
      action: TAB_ACTION.ACTIVATE,
      payload: { id: activeInfo.tabId, ...activeInfo },
    })
  }
)

export const removeTabAndNotify = createAsyncThunk(
  'currentTabs/removeTabAndNotify',
  async ({ tabId, removeInfo, nativePort }: any, thunkAPI): Promise<void> => {
    thunkAPI.dispatch(removeTab({ tabId }))

    postNativeMessage(nativePort, {
      action: TAB_ACTION.REMOVE,
      payload: { id: tabId, ...removeInfo },
    })
  }
)
