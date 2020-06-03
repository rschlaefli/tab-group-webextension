// https://github.com/fregante/webext-storage-cache
// import cache from 'webext-storage-cache'
import { wrapStore } from 'webext-redux'
import { browser } from 'webextension-polyfill-ts'

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

// setup a listener for communication from the popup
browser.runtime.onMessage.addListener(async (message: any) => {
  console.log('[background] received message in background', message)

  if (message.type === 'RELOAD_SETTINGS') {
    bootstrap()
  }
})

browser.commands.onCommand.addListener(async (command) => {
  console.log('[background] received command in background', command)

  if (command === 'toggle_sidebar') {
    const activeTabs = await browser.tabs.query({ currentWindow: true, active: true })
    if (activeTabs.length === 1 && activeTabs[0].id) {
      await browser.tabs.sendMessage(activeTabs[0].id, 'TOGGLE_SIDEBAR')
    }
  }
})

// setup context menu entries
// browser.contextMenus.create({ title: 'group this', contexts: ['tab'] }, () => null)
// browser.contextMenus.removeAll()
