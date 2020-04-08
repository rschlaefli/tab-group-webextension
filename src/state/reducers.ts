import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'

import currentTabs from './currentTabs'
import tabGroups from './tabGroups'

export default persistReducer(
  { key: 'root', storage, blacklist: ['currentTabs'] },
  combineReducers({
    currentTabs,
    tabGroups
  })
)
