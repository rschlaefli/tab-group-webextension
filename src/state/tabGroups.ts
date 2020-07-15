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
import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'

import { ITabGroup, ITab } from '@src/types/Extension'
import { getBrowserSafe } from '@src/lib/utils'
import { closeTabsWithHashes, openCurrentTab } from './currentTabs'
import { AppDispatch } from '@src/background'
import { RootState } from './configureStore'
import { DropResult } from 'react-beautiful-dnd'
import { removeSuggestedTab, acceptSuggestedTabAlias } from './suggestions'

function extractTabFromGroup(sourceGroupIndex: number, sourceTabIndex: number): (state) => any {
  return pipe(path([sourceGroupIndex, 'tabs', sourceTabIndex]), assoc('uuid', uuidv4()))
}

function removeTabFromGroup(sourceGroupIndex: number, sourceTabIndex: number): any {
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
  // if we don't have a hash yet, do not inject anything
  if (!tabData.hash) {
    return state
  }

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

  // check whether the given hash is already member of the target group
  const targetTabs: ITab[] = pathOr([], [targetGroupIndex, 'tabs'], state)
  if (targetTabs.map((tab) => tab.hash).includes(tabData.hash)) {
    return state
  }

  return pipe(insert(action.payload.targetTabIndex as number, tabData), (targetTabsWithTab) =>
    adjust(
      targetGroupIndex,
      (tabGroup: ITabGroup) => assoc('tabs', targetTabsWithTab, tabGroup),
      state
    )
  )(targetTabs)
}

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

      return injectTab(sourceGroup, action, removedTab)
    },
    moveCurrentTab(state, action): ITabGroup[] {
      return injectTab(state, action, action.payload.currentTab)
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
    editTab(state, action): ITabGroup[] {
      const sourceGroupIndex = findIndex((el) => el.id === action.payload.sourceGroupId, state)
      if (sourceGroupIndex === -1) {
        return state
      }

      return pipe(
        extractTabFromGroup(sourceGroupIndex, action.payload.sourceTabIndex as number),
        assoc('displayTitle', action.payload.title),
        (updatedTab) =>
          adjust(
            sourceGroupIndex,
            (tabGroup) =>
              assoc(
                'tabs',
                adjust(action.payload.sourceTabIndex, () => updatedTab, tabGroup.tabs),
                tabGroup
              ),
            state
          )
      )(state)
    },
    appendGroup(state, action): ITabGroup[] {
      return append(action.payload, state)
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
  appendGroup,
  editTab,
} = actions
export default reducer

// THUNKS
export const closeTabGroup = createAsyncThunk<
  void,
  { _sender?: any; payload: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'tabGroups/closeTabGroup',
  async ({ payload: tabGroupId }, thunkAPI): Promise<void> => {
    const state = thunkAPI.getState()

    const tabGroup = find((group: ITabGroup) => group.id === tabGroupId, state.tabGroups)
    if (tabGroup) {
      const tabHashes = tabGroup.tabs.map((tab) => tab.hash)
      await thunkAPI.dispatch(closeTabsWithHashes({ closeHashes: tabHashes }) as any)
    }
  }
)

export const closeTabsOutsideGroup = createAsyncThunk<
  void,
  { _sender?: any; payload: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'tabGroups/closeTabsOutsideGroup',
  async ({ payload: tabGroupId }, thunkAPI): Promise<void> => {
    const state = thunkAPI.getState()

    const tabGroup = find((group: ITabGroup) => group.id === tabGroupId, state.tabGroups)
    if (tabGroup) {
      const tabHashes = tabGroup.tabs.map((tab) => tab.hash)
      await thunkAPI.dispatch(closeTabsWithHashes({ keepHashes: tabHashes }) as any)
    }
  }
)

export const openTabGroup = createAsyncThunk<
  void,
  { _sender?: any; payload: { tabGroupId: string; newWindow?: boolean } },
  { dispatch: AppDispatch; state: RootState }
>(
  'tabGroups/openTabGroup',
  async ({ _sender, payload: { tabGroupId, newWindow } }, thunkAPI): Promise<void> => {
    const browser = await getBrowserSafe()
    const state = thunkAPI.getState()

    const isSuggestedGroup = tabGroupId.includes('suggest-')

    const tabGroupIndex = isSuggestedGroup
      ? findIndex(
          (group: ITabGroup) => group.id === tabGroupId.replace('suggest-', ''),
          state.suggestions
        )
      : findIndex((group: ITabGroup) => group.id === tabGroupId, state.tabGroups)
    if (tabGroupIndex > -1) {
      const tabGroup = isSuggestedGroup
        ? state.suggestions[tabGroupIndex]
        : state.tabGroups[tabGroupIndex]

      // if the tab group is to be opened in a new window, create one
      let createdWindow
      if (newWindow) {
        createdWindow = await browser.windows.create()
      }

      // open all of the tabs within the group in the new window
      await Promise.all(
        tabGroup.tabs.map(async (tab) => {
          // if the tab to be opened is already open, dispatch the openCurrentTab functionality instead
          if (tab.hash && state.currentTabs.tabHashes.includes(tab.hash)) {
            await thunkAPI.dispatch(openCurrentTab({ payload: tab.hash }) as any)
          } else {
            await browser.tabs.create({ url: tab.url })
          }
        })
      )

      // if the tab group was opened in a new window, remove the unnecessary new tab at the start
      if (createdWindow) {
        const uiTabs = await browser.tabs.query({ windowId: createdWindow.id, index: 0 })
        await browser.tabs.remove(uiTabs.map((tab) => tab.id) as number[])
      }

      // if focus mode is enabled, close all of the tabs belonging to other groups
      // but only if they are not also a member of the selected group
      if (state.settings.isFocusModeEnabled) {
        const currentGroupHashes = tabGroup.tabs.map((tab) => tab.hash).filter((hash) => !!hash)

        const tabHashesFromOtherGroups = state.tabGroups
          .filter((_, ix) => ix !== tabGroupIndex)
          .flatMap((tabGroup) => tabGroup.tabs)
          .map((tab) => tab.hash)
          .filter((hash) => !currentGroupHashes.includes(hash))

        console.log('[tabGroups] closing other tabs in focus mode', tabHashesFromOtherGroups)

        await thunkAPI.dispatch(
          closeTabsWithHashes({ closeHashes: tabHashesFromOtherGroups }) as any
        )
      }

      // close the new tab page if we open a group
      if (_sender?.tab?.url && _sender.tab.id) {
        try {
          if (['moz-extension', 'chrome'].includes(_sender.tab.url.split(':')[0])) {
            await browser.tabs.remove(_sender.tab.id)
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
)

const extractDragEventProperties = (dragEvent: DropResult) => ({
  sourceGroupId: dragEvent.source.droppableId,
  targetGroupId: dragEvent?.destination?.droppableId,
  sourceTabIndex: dragEvent.source.index,
  targetTabIndex: dragEvent?.destination?.index,
})

export const processDragEvent = createAsyncThunk<
  void,
  { payload: DropResult },
  { dispatch: AppDispatch; state: RootState }
>(
  'tabGroups/processDragEvent',
  async ({ payload: dragEvent }, thunkAPI): Promise<void> => {
    const state = thunkAPI.getState()
    const properties = extractDragEventProperties(dragEvent)

    // if the destination is empty, return
    if (!properties.targetGroupId) return

    // if we are reordering within a droppable
    if (properties.sourceGroupId === properties.targetGroupId) {
      // do not allow reordering in current tabs
      if (properties.sourceGroupId === 'current') return

      // if we are reordering to the same position,, return
      if (properties.sourceTabIndex === properties.targetTabIndex) return

      thunkAPI.dispatch(reorderTab(properties))
      return
    }

    if (properties.sourceGroupId === 'current') {
      const currentTab = state.currentTabs.tabs[properties.sourceTabIndex]
      thunkAPI.dispatch(moveCurrentTab({ ...properties, currentTab }))
      return
    }

    if (properties.sourceGroupId === 'recent') {
      const currentTab = state.currentTabs.recentTabs[properties.sourceTabIndex]
      thunkAPI.dispatch(moveCurrentTab({ ...properties, currentTab }))
      return
    }

    if (properties.sourceGroupId.includes('additional-')) {
      const suggestedGroup = state.suggestions.find(
        (tabGroup) => tabGroup.id === properties.sourceGroupId.replace('additional-', '')
      )

      if (suggestedGroup) {
        const currentTab = suggestedGroup.tabs[properties.sourceTabIndex]
        thunkAPI.dispatch(moveCurrentTab({ ...properties, currentTab }))
        thunkAPI.dispatch(
          removeSuggestedTab({ sourceGroupId: suggestedGroup.id, targetTabHash: currentTab.hash })
        )
        thunkAPI.dispatch(
          acceptSuggestedTabAlias({
            sourceGroupId: suggestedGroup.id,
            targetTabHash: currentTab.hash as string,
            targetGroupId: properties.targetGroupId,
          })
        )
      }

      return
    }

    if (properties.sourceGroupId.includes('suggest-')) {
      const suggestedGroup = state.suggestions.find(
        (tabGroup) => tabGroup.id === properties.sourceGroupId.replace('suggest-', '')
      )

      if (suggestedGroup) {
        const currentTab = suggestedGroup.tabs[properties.sourceTabIndex]
        thunkAPI.dispatch(moveCurrentTab({ ...properties, currentTab }))
        thunkAPI.dispatch(
          acceptSuggestedTabAlias({
            sourceGroupId: suggestedGroup.id,
            targetTabHash: currentTab.hash as string,
            targetGroupId: properties.targetGroupId,
          })
        )
      }

      return
    }

    // if we are moving between groups
    thunkAPI.dispatch(moveTab(properties))
  }
)

export const openInNewTab = createAsyncThunk<
  void,
  { payload: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'tabGroups/openInNewTab',
  async ({ payload: url }, _): Promise<void> => {
    const browser = await getBrowserSafe()
    await browser.tabs.create({ url, active: false })
  }
)

// ALIASES
export const closeTabGroupAlias = createAction<string>('tabGroups/closeTabGroupAlias')
export const closeTabsOutsideGroupAlias = createAction<string>('tabGroups/closeTabsOutsideGroup')
export const openTabGroupAlias = createAction<{ tabGroupId: string; newWindow?: boolean }>(
  'tabGroups/openTabGroupAlias'
)
export const processDragEventAlias = createAction<DropResult>('tabGroups/processDragEventAlias')
export const openInNewTabAlias = createAction<string>('tabGroups/openInNewTabAlias')
export const tabGroupsAliases = {
  [closeTabGroupAlias.type]: closeTabGroup,
  [closeTabsOutsideGroupAlias.type]: closeTabsOutsideGroup,
  [openTabGroupAlias.type]: openTabGroup,
  [processDragEventAlias.type]: processDragEvent,
  [openInNewTabAlias.type]: openInNewTab,
}
