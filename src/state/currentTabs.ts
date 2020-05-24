import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import { Tabs, Runtime } from 'webextension-polyfill-ts'
import { append, findIndex, remove, update, find, keys, any } from 'ramda'
import { getBrowserSafe, augmentTabExtras, postNativeMessage } from '@src/lib/utils'
import { ITab, TAB_ACTION } from '@src/types/Extension'
import { AppDispatch } from '@src/background'
import { RootState } from './configureStore'

const currentTabsSlice = createSlice({
  name: 'currentTabs',
  initialState: {
    previousTabId: -1,
    activeTab: -1,
    activeWindow: 0,
    tabs: [] as ITab[],
    tabHashes: [] as (string | null)[],
    collapsed: false,
  },
  reducers: {
    collapseCurrentTabs(state): void {
      state.collapsed = !state.collapsed
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
        let mergedTab = { ...state.tabs[tabIndex], ...action.payload.tabData }

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
        state.tabs = remove(tabIndex, 1, state.tabs)
        state.tabHashes = remove(tabIndex, 1, state.tabHashes)

        console.log('[currentTabs] REMOVE', state.tabs[tabIndex])
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

export const closeCurrentTab = createAsyncThunk<
  void,
  { _sender?: any; payload: number },
  { dispatch: AppDispatch; state: RootState }
>(
  'currentTabs/closeCurrentTab',
  async ({ payload: tabId }, _): Promise<void> => {
    const browser = await getBrowserSafe()
    await browser.tabs.remove(tabId)
  }
)

export const closeTabsWithHashes = createAsyncThunk<
  void,
  (string | null)[],
  { dispatch: AppDispatch; state: RootState }
>(
  'currentTabs/closeTabsWithHashes',
  async (tabHashes, thunkAPI): Promise<void> => {
    const browser = await getBrowserSafe()
    const state = thunkAPI.getState()

    const matchingTabs = state.currentTabs.tabs.filter((tab) => tabHashes.includes(tab.hash))

    await Promise.all(matchingTabs.map((tab) => browser.tabs.remove(tab.id)))
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

      // get the currently active tab
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
          if (['moz-extension', 'chrome'].includes(_sender.tab.url.split(':')[0])) {
            await browser.tabs.remove(_sender.tab.id)
          }
        } catch (e) {}
      }
    }
  }
)

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
      ])
    ) {
      // update the internal representation of the tab
      await thunkAPI.dispatch(updateTab({ tabId: id, tabData: changeData }))
    }

    // notify the heuristics engine about the new tab if the tab change has completed
    if (nativePort && newTab && status === 'complete') {
      await postNativeMessage(nativePort, {
        action: TAB_ACTION.UPDATE,
        payload: { ...newTab, ...augmentTabExtras(changeData) },
      })
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
export const closeCurrentTabAlias = createAction<number>('currentTabs/closeCurrentTabAlias')
export const currentTabsAliases = {
  [openCurrentTabAlias.type]: openCurrentTab,
  [closeCurrentTabAlias.type]: closeCurrentTab,
}
