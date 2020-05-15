import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Tabs } from 'webextension-polyfill-ts'
import { append, findIndex, mergeRight, remove, update } from 'ramda'
import { getBrowserSafe, augmentTabExtras } from '@src/lib/utils'
import { ITab } from '@src/types/Extension'

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
      state.tabs = allTabs
      state.tabHashes = allTabs.map((tab) => tab.hash)
    },
    createTab(state, action): void {
      const augmentedTab = augmentTabExtras(action.payload.tabData)
      state.tabs = append(augmentedTab, state.tabs)
      state.tabHashes = append(augmentedTab.hash, state.tabHashes)
    },
    activateTab(state, action): void {
      state.activeTab = action.payload.tabId
      state.previousTabId = action.payload.previousTabId
    },
    updateTab(state, action): void {
      const tabIndex = findIndex((tab) => tab.id === action.payload.tabId, state.tabs)

      if (tabIndex > -1) {
        const augmentedTab = augmentTabExtras(
          mergeRight(state.tabs[tabIndex], action.payload.tabData)
        )

        state.tabs[tabIndex] = augmentedTab
        state.tabHashes = update(tabIndex, augmentedTab.hash, state.tabHashes)
      } else {
        // this.createTab(state, action.payload.tabData)
      }
    },
    removeTab(state, action): void {
      const tabIndex = findIndex((tab) => tab.id === action.payload.tabId, state.tabs)

      if (tabIndex > -1) {
        state.tabs = remove(tabIndex, 1, state.tabs)
        state.tabHashes = remove(tabIndex, 1, state.tabHashes)
      }
    },
    // moveTab(state, action) {
    //   return state
    // },
    // attachTab(state, action) {
    //   return state
    // },
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
