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
  },
})

const { actions, reducer } = suggestionsSlice
export const { updateSuggestedGroups } = actions
export default reducer

export const acceptSuggestedGroup = createAsyncThunk<
  void,
  { _sender?: any; payload: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'suggestions/acceptSuggestedGroup',
  async ({ payload: sourceGroupId }, thunkAPI): Promise<void> => {
    const state = thunkAPI.getState()
    const selectedGroup = state.suggestions.find(
      (suggestion) => suggestion.id === sourceGroupId.replace('suggest-', '')
    )
    thunkAPI.dispatch(updateGroup({ ...selectedGroup, readOnly: false, collapsed: false }))
  }
)

export const discardSuggestedGroup = createAsyncThunk<
  void,
  { _sender?: any; payload: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'suggestions/discardSuggestedGroup',
  async ({ payload }, thunkAPI): Promise<void> => {
    console.log('discard a group')
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
