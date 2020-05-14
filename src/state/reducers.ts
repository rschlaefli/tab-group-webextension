import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'

import syncStorage from './syncStorage'
import currentTabs from './currentTabs'
import tabGroups from './tabGroups'
import suggestions from './suggestions'

export default persistReducer(
  { key: 'root', storage: syncStorage(), blacklist: ['currentTabs', 'suggestions'] },
  combineReducers({
    currentTabs,
    suggestions,
    tabGroups,
  })
)
