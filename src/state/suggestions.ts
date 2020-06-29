import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import { findIndex, remove } from 'ramda'

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
      return action.payload.map(({ name, tabs }) => ({
        id: uuidv4(),
        name: name ?? 'xyz',
        tabs,
        readOnly: true,
        collapsed: false,
      }))
    },
    removeSuggestedTab(state, action): void {
      const groupIndex = findIndex((group) => group.id === action.payload.sourceGroupId, state)
      state[groupIndex].tabs = remove(action.payload.targetTabIndex, 1, state[groupIndex].tabs)
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

    const groupId = sourceGroupId.replace('suggest-', '')
    const selectedGroup = state.suggestions.find((suggestion) => suggestion.id === groupId)

    thunkAPI.dispatch(updateGroup({ ...selectedGroup, readOnly: false, collapsed: false }))
    thunkAPI.dispatch(removeSuggestedGroup(groupId))

    postNativeMessage(nativePort, {
      action: TAB_ACTION.ACCEPT_GROUP,
      payload: { groupId: 1 },
    })
  }
)

export const discardSuggestedTab = createAsyncThunk<
  void,
  { _sender?: any; payload: { sourceGroupId: string; targetTabIndex: number } },
  { dispatch: AppDispatch; state: RootState }
>(
  'suggestions/discardSuggestedTab',
  async ({ payload: { sourceGroupId, targetTabIndex } }, thunkAPI) => {
    const state = thunkAPI.getState()

    const cleanSourceGroupId = sourceGroupId.replace('suggest-', '')
    const sourceGroup = state.suggestions.find((group) => group.id === cleanSourceGroupId)

    if (sourceGroup?.tabs?.length === 1) {
      thunkAPI.dispatch(discardSuggestedGroup({ payload: sourceGroupId }) as any)

      postNativeMessage(nativePort, {
        action: TAB_ACTION.DISCARD_GROUP,
        payload: { groupId: 1 },
      })
    } else {
      thunkAPI.dispatch(
        removeSuggestedTab({
          sourceGroupId: cleanSourceGroupId,
          targetTabIndex,
        })
      )

      postNativeMessage(nativePort, {
        action: TAB_ACTION.DISCARD_TAB,
        payload: { groupId: 1, tabHash: 2 },
      })
    }
  }
)

export const discardSuggestedGroup = createAsyncThunk<
  void,
  { _sender?: any; payload: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'suggestions/discardSuggestedGroup',
  async ({ payload: sourceGroupId }, thunkAPI): Promise<void> => {
    const groupId = sourceGroupId.replace('suggest-', '')

    thunkAPI.dispatch(removeSuggestedGroup(groupId))

    postNativeMessage(nativePort, {
      action: TAB_ACTION.DISCARD_GROUP,
      payload: { groupId: 1 },
    })
  }
)

// ALIASES
export const acceptSuggestedGroupAlias = createAction<string>(
  'suggestions/acceptSuggestedGroupAlias'
)
export const discardSuggestedGroupAlias = createAction<string>(
  'suggestions/discardSuggestedGroupAlias'
)
export const discardSuggestedTabAlias = createAction<{
  sourceGroupId: string
  targetTabIndex: number
}>('suggestions/discardSuggestedTabAlias')

export const suggestionsAliases = {
  [acceptSuggestedGroupAlias.type]: acceptSuggestedGroup,
  [discardSuggestedGroupAlias.type]: discardSuggestedGroup,
  [discardSuggestedTabAlias.type]: discardSuggestedTab,
}
