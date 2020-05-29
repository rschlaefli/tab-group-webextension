import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'

import createCompressor from '@src/lib/compress'
import syncStorage from '@src/lib/syncStorage'
import currentTabs from './currentTabs'
import tabGroups from './tabGroups'
import suggestions from './suggestions'
import settings from './settings'
import tutorial from './tutorial'

const compressor = createCompressor({ whitelist: ['tabGroups'] } as any)

export default persistReducer(
  {
    key: 'root',
    storage: syncStorage(),
    blacklist: ['currentTabs'],
    transforms: [compressor],
  },
  combineReducers({
    currentTabs,
    suggestions,
    tabGroups,
    settings,
    tutorial,
  })
)
