import { combineReducers } from 'redux'
import { persistReducer, createMigrate } from 'redux-persist'

import createCompressor from '@src/lib/compress'
import syncStorage from '@src/lib/syncStorage'
import currentTabs from './currentTabs'
import tabGroups from './tabGroups'
import suggestions from './suggestions'
import settings from './settings'
import tutorial from './tutorial'
import migrations from './migrations'

const compressor = createCompressor({ whitelist: ['tabGroups'] } as any)

export default persistReducer(
  {
    key: 'root',
    storage: syncStorage(),
    blacklist: ['currentTabs'],
    transforms: [compressor],
    throttle: 500,
    version: 2,
    migrate: createMigrate(migrations, { debug: false }),
  },
  combineReducers({
    currentTabs,
    suggestions,
    tabGroups,
    settings,
    tutorial,
  })
)
