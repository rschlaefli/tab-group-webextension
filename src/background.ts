// https://github.com/fregante/webext-storage-cache
// import cache from 'webext-storage-cache'
import { wrapStore } from 'webext-redux'

import configureStore from './state/configureStore'
import { initializeCurrentTabs } from './state/currentTabs'
import { processSettings } from './lib/listeners'

// setup a redux store
const { store, persistor } = configureStore({ persistence: true })
export { persistor }

export type AppDispatch = typeof store.dispatch

// wrap the redux store for webext communication
wrapStore(store, { portName: 'tabGrouping' })

// initialize the state for current tabs
store.dispatch(initializeCurrentTabs() as any)

export const bootstrap = processSettings(store)
