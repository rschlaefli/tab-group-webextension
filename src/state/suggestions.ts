import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

import { ITabGroup } from '@src/types/Extension'
import { augmentTabExtras } from '@src/lib/utils'

const suggestionsSlice = createSlice({
  name: 'suggestions',
  initialState: [] as ITabGroup[],
  reducers: {
    updateSuggestedGroups(_, action): ITabGroup[] {
      return action.payload.map((tabs) => ({
        id: uuidv4(),
        name: 'xyz',
        tabs: tabs.map(augmentTabExtras),
        readOnly: true,
        collapsed: false,
      }))
    },
  },
})

const { actions, reducer } = suggestionsSlice
export const { updateSuggestedGroups } = actions
export default reducer
