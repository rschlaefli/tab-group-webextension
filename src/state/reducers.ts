import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'

import createCompressor from '@src/lib/compress'
import syncStorage from './syncStorage'
import currentTabs from './currentTabs'
import tabGroups from './tabGroups'
import suggestions from './suggestions'

const compressor = createCompressor({ whitelist: ['tabGroups'] } as any)

export default persistReducer(
  {
    key: 'root',
    storage: syncStorage(),
    blacklist: ['currentTabs', 'suggestions'],
    transforms: [compressor],
  },
  combineReducers({
    currentTabs,
    suggestions,
    tabGroups,
  })
)
