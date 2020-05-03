import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Tabs } from 'webextension-polyfill-ts'
import { append, findIndex, mergeRight, remove } from 'ramda'
import { getBrowserSafe, augmentTabExtras } from '@src/lib/utils'
import { ITab } from '@src/types/Extension'

const currentTabsSlice = createSlice({
  name: 'currentTabs',
  initialState: {
    previousTabId: -1,
    activeTab: -1,
    activeWindow: 0,
    tabs: [] as ITab[],
  },
  reducers: {
    updateTabs(state, action): void {
      state.tabs = action.payload.map(augmentTabExtras)
    },
    createTab(state, action): void {
      state.tabs = append(augmentTabExtras(action.payload.tabData), state.tabs)
    },
    activateTab(state, action): void {
      state.activeTab = action.payload.tabId
      state.previousTabId = action.payload.previousTabId
    },
    updateTab(state, action): void {
      const tabIndex = findIndex((tab) => tab.id === action.payload.tabId, state.tabs)

      if (tabIndex > -1) {
        state.tabs[tabIndex] = mergeRight(state.tabs[tabIndex], action.payload.tabData)
      } else {
        // this.createTab(state, action.payload.tabData)
      }
    },
    removeTab(state, action): void {
      const tabIndex = findIndex((tab) => tab.id === action.payload.tabId, state.tabs)

      if (tabIndex > -1) {
        state.tabs = remove(tabIndex, 1, state.tabs)
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
export const { createTab, updateTab, removeTab, activateTab, updateTabs } = actions
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

    console.log(`> Initializing current tabs to ${visibleTabs.toString()}`)

    // initialize the tabs
    await thunkAPI.dispatch(updateTabs(visibleTabs))
  }
)
