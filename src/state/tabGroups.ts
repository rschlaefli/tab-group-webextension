import {
  pathOr,
  append,
  insert,
  move,
  assoc,
  adjust,
  remove,
  findIndex,
  pipe,
  path,
  update,
  find,
  nth,
  pick,
} from 'ramda'
import { v4 as uuidv4 } from 'uuid'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { ITabGroup, ITab } from '@src/types/Extension'
import { getBrowserSafe } from '@src/lib/utils'
import { closeTabsWithHashes } from './currentTabs'

function extractTabFromGroup(sourceGroupIndex: number, sourceTabIndex: number): Function {
  return pipe(path([sourceGroupIndex, 'tabs', sourceTabIndex]), assoc('uuid', uuidv4()))
}

function removeTabFromGroup(sourceGroupIndex: number, sourceTabIndex: number): Function {
  return (state: ITabGroup[]): ITabGroup[] =>
    pipe(
      pathOr([], [sourceGroupIndex, 'tabs']),
      remove(sourceTabIndex, 1),
      (sourceTabsWithoutTab) =>
        adjust(
          sourceGroupIndex,
          (tabGroup: ITabGroup) => assoc('tabs', sourceTabsWithoutTab, tabGroup),
          state
        )
    )(state)
}

function updateGroupOrDefault(existingTabGroup?: ITabGroup, payload?: any): ITabGroup {
  const defaults = {
    id: `droppable-${uuidv4()}`,
    name: new Date().toISOString(),
    tabs: [],
    readOnly: false,
    collapsed: false,
  }

  return Object.assign(
    {},
    defaults,
    existingTabGroup,
    pick(['name', 'tabs', 'readOnly', 'collapsed'], payload),
    payload?.sourceGroupId && { id: payload.sourceGroupId }
  )
}

function injectTab(state: ITabGroup[], action: any, tabData: ITab): ITabGroup[] {
  // if we are injecting a tab into a new group
  if (action.payload.targetGroupId === 'newGroup') {
    const newGroup = updateGroupOrDefault(undefined, { tabs: [tabData] })
    return append(newGroup, state)
  }

  // compute the index of the target group
  const targetGroupIndex = findIndex((el) => el.id === action.payload.targetGroupId, state)
  if (targetGroupIndex === -1) {
    return state
  }

  return pipe(
    pathOr([], [targetGroupIndex, 'tabs']),
    insert(action.payload.targetTabIndex as number, tabData),
    (targetTabsWithTab) =>
      adjust(
        targetGroupIndex,
        (tabGroup: ITabGroup) => assoc('tabs', targetTabsWithTab, tabGroup),
        state
      )
  )(state)
}

// TODO: extend each tab by the hash
// TODO: deduplicate storage according to the hash of tabs
// TODO: can we replace the uuid with the hash? uuid + tabgroup id?
const tabGroupsSlice = createSlice({
  name: 'tabGroups',
  initialState: [] as ITabGroup[],
  reducers: {
    collapseGroup(state, action): ITabGroup[] {
      const sourceGroupIndex = findIndex((el) => el.id === action.payload.sourceGroupId, state)
      if (sourceGroupIndex === -1) {
        return state
      }

      const existingTabGroup = sourceGroupIndex > -1 ? nth(sourceGroupIndex, state) : null

      // update a tab group that already exists
      return update(
        sourceGroupIndex,
        assoc('collapsed', !existingTabGroup?.collapsed, existingTabGroup),
        state
      )
    },
    updateGroup(state, action): ITabGroup[] {
      const sourceGroupIndex = findIndex((el) => el.id === action.payload.sourceGroupId, state)
      const existingTabGroup = sourceGroupIndex > -1 ? nth(sourceGroupIndex, state) : undefined

      // if trying to update a group that does not exist, append it
      const tabGroup = updateGroupOrDefault(existingTabGroup, action.payload)

      if (sourceGroupIndex === -1) {
        return append(tabGroup, state)
      }

      // update a tab group that already exists
      return update(sourceGroupIndex, tabGroup, state)
    },
    removeGroup(state, action): ITabGroup[] {
      const sourceGroupIndex = findIndex((el) => el.id === action.payload.sourceGroupId, state)
      if (sourceGroupIndex === -1) {
        return state
      }

      // ensure that the list of current tabs cannot be removed
      if (action.payload.sourceGroupId === 'current') {
        return state
      }

      // remove the tab group at the specified index
      return remove(sourceGroupIndex, 1, state)
    },
    moveTab(state, action): ITabGroup[] {
      const sourceGroupIndex = findIndex((el) => el.id === action.payload.sourceGroupId, state)
      if (sourceGroupIndex === -1) {
        return state
      }

      // store the tab to be removed
      const removedTab = extractTabFromGroup(
        sourceGroupIndex,
        action.payload.sourceTabIndex as number
      )(state)

      // remove the tab from the source group
      // but only if the source group is not the list of current tabs
      let sourceGroup = state
      if (action.payload.sourceGroupId !== 'current') {
        sourceGroup = removeTabFromGroup(
          sourceGroupIndex,
          action.payload.sourceTabIndex as number
        )(state)
      }

      // TODO: only move the tab if it does not already exist in the group?
      return injectTab(sourceGroup, action, removedTab)
    },
    moveCurrentTab(state, action): ITabGroup[] {
      return injectTab(state, action, { ...action.payload.currentTab, uuid: uuidv4() })
    },
    reorderTab(state, action): ITabGroup[] {
      const sourceGroupIndex = findIndex((el) => el.id === action.payload.sourceGroupId, state)
      if (sourceGroupIndex === -1) {
        return state
      }

      return pipe(
        // extract tabs from the source group and reorder them
        pipe(
          pathOr([], [sourceGroupIndex, 'tabs']),
          move(action.payload.sourceTabIndex as number, action.payload.targetTabIndex as number)
        ),
        // inject the reordered tabs into the source group
        (reorderedTabs) =>
          adjust(
            sourceGroupIndex,
            (tabGroup: ITabGroup) => assoc('tabs', reorderedTabs, tabGroup),
            state
          )
      )(state)
    },
    removeTab(state, action): ITabGroup[] {
      const sourceGroupIndex = findIndex((el) => el.id === action.payload.sourceGroupId, state)
      if (sourceGroupIndex === -1) {
        return state
      }
      return removeTabFromGroup(sourceGroupIndex, action.payload.sourceTabIndex as number)(state)
    },
  },
})

const { actions, reducer } = tabGroupsSlice
export const {
  collapseGroup,
  updateGroup,
  removeGroup,
  moveTab,
  reorderTab,
  removeTab,
  moveCurrentTab,
} = actions
export default reducer

// THUNKS
export const closeTabGroup = createAsyncThunk(
  'tabGroups/closeTabGroup',
  async (tabGroupId: string, thunkAPI): Promise<void> => {
    const state: any = thunkAPI.getState()

    const tabGroup = find((group: ITabGroup) => group.id === tabGroupId, state.tabGroups)
    if (tabGroup) {
      const tabHashes = tabGroup.tabs.map((tab) => tab.hash)
      await thunkAPI.dispatch(closeTabsWithHashes(tabHashes))
    }
  }
)

export const openTabGroup = createAsyncThunk(
  'tabGroups/openTabGroup',
  async (tabGroupId: string, thunkAPI): Promise<void> => {
    const browser = await getBrowserSafe()
    const state: any = thunkAPI.getState()

    const tabGroup = find((group: ITabGroup) => group.id === tabGroupId, state.tabGroups)
    if (tabGroup) {
      await Promise.all(tabGroup.tabs.map((tab) => browser.tabs.create({ url: tab.url })))
    }
  }
)

export const openCurrentTab = createAsyncThunk(
  'tabGroups/openCurrentTab',
  async (tabHash: string, thunkAPI): Promise<void> => {
    const browser = await getBrowserSafe()
    const state: any = thunkAPI.getState()

    // const activeTabIndex = findIndex(
    //   (tab: ITab) => tab.id === state.currentTabs.activeTab,
    //   state.currentTabs.tabs
    // )
    const tab = find((tab: ITab) => tab.hash === tabHash, state.currentTabs.tabs)

    if (tab?.id) {
      if (tab.pinned) {
        await browser.tabs.update(tab.id, { pinned: false })
      }
      await browser.tabs.move(tab.id, {
        // windowId: state.currentTabs.activeWindow,
        // index: activeTabIndex ? activeTabIndex + 1 : -1,
        index: -1,
      })
    }
  }
)
