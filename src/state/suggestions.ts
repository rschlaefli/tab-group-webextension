import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import { findIndex, remove, any } from 'ramda'

import { ITabGroup, TAB_ACTION } from '@src/types/Extension'
import { AppDispatch } from '@src/background'
import { RootState } from './configureStore'
import { updateGroup } from './tabGroups'
import { postNativeMessage } from '@src/lib/utils'
import { nativePort } from '@src/lib/listeners'

const suggestionsSlice = createSlice({
  name: 'suggestions',
  initialState: [] as ITabGroup[],
  reducers: {
    updateSuggestedGroups(_, action): ITabGroup[] {
      return action.payload.map(({ id, name, tabs }) => ({
        id: id ?? uuidv4(),
        name: name ?? 'xyz',
        tabs,
        readOnly: true,
        collapsed: false,
      }))
    },
    removeSuggestedTab(state, action): void {
      const groupIndex = findIndex((group) => group.id === action.payload.sourceGroupId, state)
      if (groupIndex > -1) {
        const tabIndex = findIndex(
          (tab) => tab.hash === action.payload.targetTabHash,
          state[groupIndex].tabs
        )

        if (tabIndex > -1) {
          state[groupIndex].tabs = remove(tabIndex, 1, state[groupIndex].tabs)
        }
      }
    },
    removeSuggestedGroup(state, action): ITabGroup[] {
      return state.filter((tabGroup) => tabGroup.id !== action.payload)
    },
  },
})

const { actions, reducer } = suggestionsSlice
export const { updateSuggestedGroups, removeSuggestedGroup, removeSuggestedTab } = actions
export default reducer

export const acceptSuggestedGroup = createAsyncThunk<
  void,
  { _sender?: any; payload: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'suggestions/acceptSuggestedGroup',
  async ({ payload: sourceGroupId }, thunkAPI): Promise<void> => {
    const state = thunkAPI.getState()

    const cleanSourceGroupId = sourceGroupId.replace('suggest-', '')
    const selectedGroup = state.suggestions.find(
      (suggestion) => suggestion.id === cleanSourceGroupId
    )

    thunkAPI.dispatch(updateGroup({ ...selectedGroup, readOnly: false, collapsed: false }))
    thunkAPI.dispatch(removeSuggestedGroup(cleanSourceGroupId))

    postNativeMessage(nativePort, {
      action: TAB_ACTION.ACCEPT_GROUP,
      payload: { groupHash: cleanSourceGroupId },
    })
  }
)

export const acceptSuggestedTab = createAsyncThunk<
  void,
  {
    _sender?: any
    payload: { sourceGroupId: string; targetTabHash: string; targetGroupId: string }
  },
  { dispatch: AppDispatch; state: RootState }
>(
  'suggestions/acceptSuggestedTab',
  async ({ payload: { sourceGroupId, targetTabHash, targetGroupId } }): Promise<void> => {
    postNativeMessage(nativePort, {
      action: TAB_ACTION.ACCEPT_TAB,
      payload: { groupHash: sourceGroupId, tabHash: targetTabHash, targetGroup: targetGroupId },
    })
  }
)

export const discardSuggestedTab = createAsyncThunk<
  void,
  { _sender?: any; payload: { sourceGroupId: string; targetTabHash: string; reason?: string } },
  { dispatch: AppDispatch; state: RootState }
>(
  'suggestions/discardSuggestedTab',
  async ({ payload: { sourceGroupId, targetTabHash, reason } }, thunkAPI) => {
    const state = thunkAPI.getState()

    const cleanSourceGroupId = sourceGroupId.replace('suggest-', '').replace('additional-', '')
    const sourceGroup = state.suggestions.find((group) => group.id === cleanSourceGroupId)

    if (sourceGroup) {
      thunkAPI.dispatch(
        removeSuggestedTab({
          sourceGroupId: cleanSourceGroupId,
          targetTabHash,
          reason,
        })
      )

      postNativeMessage(nativePort, {
        action: TAB_ACTION.DISCARD_TAB,
        payload: { groupHash: cleanSourceGroupId, tabHash: targetTabHash },
      })

      if (sourceGroup.tabs.length === 1) {
        thunkAPI.dispatch(removeSuggestedGroup({ sourceGroupId: cleanSourceGroupId }))
      }
    }
  }
)

export const discardSuggestedGroup = createAsyncThunk<
  void,
  { _sender?: any; payload: { sourceGroupId: string; reason?: string; rating?: number } },
  { dispatch: AppDispatch; state: RootState }
>(
  'suggestions/discardSuggestedGroup',
  async ({ payload: { sourceGroupId, reason, rating } }, thunkAPI): Promise<void> => {
    const cleanSourceGroupId = sourceGroupId.replace('suggest-', '')

    thunkAPI.dispatch(removeSuggestedGroup(cleanSourceGroupId))

    postNativeMessage(nativePort, {
      action: TAB_ACTION.DISCARD_GROUP,
      payload: { groupHash: cleanSourceGroupId, reason, rating },
    })
  }
)

export const refreshSuggestedGroups = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>('suggestions/refreshSuggestedGroups', async (_, thunkAPI) => {
  const state = thunkAPI.getState()

  let heuristicsConfig = {}
  try {
    heuristicsConfig = state.settings.heuristicsConfigs[state.settings.heuristicsActiveConfig]
  } catch (e) {
    console.error(e)
  }

  console.log(`[background] Forcing suggestions refresh with parameters`, heuristicsConfig)

  postNativeMessage(nativePort, {
    action: TAB_ACTION.REFRESH_GROUPS,
    payload: heuristicsConfig,
  })
})

// ALIASES
export const acceptSuggestedTabAlias = createAction<{
  sourceGroupId: string
  targetTabHash: string
  targetGroupId: string
}>('suggestions/acceptSuggestedTabAlias')
export const acceptSuggestedGroupAlias = createAction<string>(
  'suggestions/acceptSuggestedGroupAlias'
)
export const discardSuggestedGroupAlias = createAction<{
  sourceGroupId: string
  rating?: number
  reason?: string
}>('suggestions/discardSuggestedGroupAlias')
export const discardSuggestedTabAlias = createAction<{
  sourceGroupId: string
  targetTabHash: string
  reason?: string
}>('suggestions/discardSuggestedTabAlias')

export const refreshSuggestedGroupsAlias = createAction('suggestions/refreshSuggestedGroupsAlias')

export const suggestionsAliases = {
  [acceptSuggestedTabAlias.type]: acceptSuggestedTab,
  [acceptSuggestedGroupAlias.type]: acceptSuggestedGroup,
  [discardSuggestedGroupAlias.type]: discardSuggestedGroup,
  [discardSuggestedTabAlias.type]: discardSuggestedTab,
  [refreshSuggestedGroupsAlias.type]: refreshSuggestedGroups,
}
