// https://github.com/fregante/webext-storage-cache
// import cache from 'webext-storage-cache'
import { wrapStore } from 'webext-redux'
import { browser, Tabs, Runtime } from 'webextension-polyfill-ts'
import { any, keys } from 'ramda'

import {
  TAB_ACTION,
  IHeuristicsAction,
  HEURISTICS_ACTION,
  ITab,
  // TAB_GROUP_ACTION
} from './types/Extension'
import configureStore from './state/configureStore'
import optionsStorage from './optionsStorage'
import {
  createTab,
  initializeCurrentTabs,
  updateTabAndNotify,
  activateTabAndNotify,
  removeTabAndNotify,
} from './state/currentTabs'
import { updateSuggestedGroups } from './state/suggestions'
import { postNativeMessage } from './lib/utils'

const RELEVANT_TAB_PROPS = ['pinned', 'title', 'status', 'favIconUrl', 'url']

// setup a redux store
const { store, persistor } = configureStore({})
export { persistor }

export type AppDispatch = typeof store.dispatch

// wrap the redux store for webext communication
wrapStore(store, { portName: 'tabGrouping' })

// initialize the state for current tabs
store.dispatch(initializeCurrentTabs() as any)

const onTabCreated = (tabData: Tabs.CreateCreatePropertiesType): void => {
  store.dispatch(createTab({ tabData }))
}

const onTabUpdated = (nativePort) => (tabId, changeInfo, tab): void => {
  store.dispatch(
    updateTabAndNotify({ id: tabId, changeData: changeInfo, nativePort, newTab: tab }) as any
  )
}

const onTabMoved = (nativePort) => (tabId: number, moveInfo: Tabs.OnMovedMoveInfoType): void => {
  store.dispatch(updateTabAndNotify({ id: tabId, changeData: moveInfo, nativePort }) as any)
}

const onTabActivated = (nativePort) => (activeInfo: Tabs.OnActivatedActiveInfoType): void => {
  store.dispatch(activateTabAndNotify({ activeInfo, nativePort }) as any)
}

const onTabAttached = (nativePort) => (
  tabId: number,
  attachInfo: Tabs.OnAttachedAttachInfoType
): void => {
  store.dispatch(updateTabAndNotify({ id: tabId, changeData: attachInfo, nativePort }) as any)
}

const onTabRemoved = (nativePort) => (
  tabId: number,
  removeInfo: Tabs.OnRemovedRemoveInfoType
): void => {
  store.dispatch(removeTabAndNotify({ tabId, removeInfo, nativePort }) as any)
}

const onNativeMessage = (nativePort) => (messageFromHeuristics: IHeuristicsAction): void => {
  console.log('[background] Received message over native port:', messageFromHeuristics)

  switch (messageFromHeuristics.action) {
    case HEURISTICS_ACTION.UPDATE_GROUPS:
      store.dispatch(updateSuggestedGroups(messageFromHeuristics.payload))
      break

    case HEURISTICS_ACTION.NEW_TAB:
      browser.tabs.create({ url: messageFromHeuristics.payload.url })
      break

    case HEURISTICS_ACTION.NOTIFY:
      browser.notifications.create('heuristics-notify', {
        title: 'New Event',
        type: 'basic',
        message: messageFromHeuristics.payload.message,
        iconUrl:
          'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
      })
      break

    case HEURISTICS_ACTION.QUERY_TABS:
      const currentTabs = store.getState().currentTabs?.tabs as ITab[]
      console.log('[background] Initializing current tabs in heuristics:', currentTabs)
      postNativeMessage(nativePort, {
        action: TAB_ACTION.INIT_TABS,
        payload: { currentTabs },
      })
      break
  }
}

const onNativeDisconnect = (...params): void => {
  console.warn('[background] Disconnected the native port', params)
}

function setupListeners(nativePort?: Runtime.Port): void {
  console.log('[background] Preparing listeners', nativePort)

  // setup the listener for the onCreated event
  browser.tabs.onCreated.addListener(onTabCreated)

  // setup the listener for the onUpdated event
  // available properties that we can filter updates for (in FF):
  // "attention", "audible", "discarded", "favIconUrl", "hidden", "isArticle",
  // "mutedInfo", "pinned", "sharingState", "status", "title"
  try {
    browser.tabs.onUpdated.addListener(onTabUpdated(nativePort), {
      properties: RELEVANT_TAB_PROPS as any,
    })
  } catch (e) {
    browser.tabs.onUpdated.addListener(onTabUpdated(nativePort))
  }

  // setup the listener for the onMoved event
  browser.tabs.onMoved.addListener(onTabMoved(nativePort))

  // setup the listener for the onActivated event
  browser.tabs.onActivated.addListener(onTabActivated(nativePort))

  // setup the listener for the onAttached event
  browser.tabs.onAttached.addListener(onTabAttached(nativePort))

  // setup the listener for the onRemoved event
  browser.tabs.onRemoved.addListener(onTabRemoved(nativePort))

  if (nativePort) {
    nativePort.onMessage.addListener(onNativeMessage(nativePort))

    nativePort.onDisconnect.addListener(onNativeDisconnect)
  }
}

// function removeListeners(nativePort?: Runtime.Port): void {
//   browser.tabs.onCreated.removeListener(onTabCreated)
//   browser.tabs.onUpdated.removeListener(onTabUpdated)
//   browser.tabs.on
// }

// connect to the native port
optionsStorage
  .getAll()
  .then((opt) => {
    console.log('[background] Fetched user options', opt)

    if (opt.enableHeuristics) {
      try {
        const nativePort = browser.runtime.connectNative('tabs')
        console.log('[background] Opened native port:', nativePort.name)

        setupListeners(nativePort)
      } catch (e) {
        console.error('[background] Failed to connect to the native backend', e)
      }
    } else {
      setupListeners()
    }

    if (opt.tutorialProgress < 3) {
      browser.tabs.create({ url: 'tutorial.html' })
    }
  })
  .catch((e) => {
    console.error('[background] Failed to read from options storage', e)
  })

// setup a listener for communication from the popup
browser.runtime.onMessage.addListener(async (message: any) => {
  console.log('[background] received message in background', message)

  // if (message.type === 'SIDEBAR') {
  //   const currentTab = (
  //     await browser.tabs.query({
  //       active: true,
  //       currentWindow: true,
  //     })
  //   )[0]

  //   await browser.tabs.executeScript(currentTab.id, {
  //     file: '/sidebar.bundle.js',
  //     runAt: 'document_start',
  //     matchAboutBlank: true,
  //   })
  // }
})

// setup context menu entries
// browser.contextMenus.create({ title: 'group this', contexts: ['tab'] }, () => null)
// browser.contextMenus.removeAll()
