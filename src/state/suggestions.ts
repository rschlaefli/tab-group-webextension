import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

import { ITabGroup } from '@src/types/Extension'
import { AppDispatch } from '@src/background'
import { RootState } from './configureStore'
import { updateGroup } from './tabGroups'

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
    removeSuggestedGroup(state, action): ITabGroup[] {
      return state.filter((tabGroup) => tabGroup.id !== action.payload)
    },
  },
})

const { actions, reducer } = suggestionsSlice
export const { updateSuggestedGroups, removeSuggestedGroup } = actions
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

    // TODO: send the discard action to the heuristics engine
  }
)

// ALIASES
export const acceptSuggestedGroupAlias = createAction<string>(
  'suggestions/acceptSuggestedGroupAlias'
)
export const discardSuggestedGroupAlias = createAction<string>(
  'suggestions/discardSuggestedGroupAlias'
)

export const suggestionsAliases = {
  [acceptSuggestedGroupAlias.type]: acceptSuggestedGroup,
  [discardSuggestedGroupAlias.type]: discardSuggestedGroup,
}
