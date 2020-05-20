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
import { postNativeMessage, debug } from './lib/utils'

const RELEVANT_TAB_PROPS = ['pinned', 'title', 'status', 'favIconUrl']

// setup a redux store
const { store } = configureStore({})

// wrap the redux store for webext communication
wrapStore(store, { portName: 'tabGrouping' })

// initialize the state for current tabs
store.dispatch(initializeCurrentTabs() as any)

// connect to the native port
let options: any
let nativePort: Runtime.Port
optionsStorage.getAll().then((opt) => {
  options = opt
  const log = debug(opt)
  if (opt.enableHeuristics) {
    log('> Attempting to open native port')
    nativePort = browser.runtime.connectNative('tabs')
    log('> Opened native port: ', nativePort)

    // setup a listener for native communcation
    if (nativePort) {
      nativePort.onMessage.addListener(async (messageFromHeuristics: IHeuristicsAction) => {
        log(`> Received message over native port:`, messageFromHeuristics)

        try {
          switch (messageFromHeuristics.action) {
            case HEURISTICS_ACTION.UPDATE_GROUPS:
              store.dispatch(updateSuggestedGroups(messageFromHeuristics.payload))
              break

            case HEURISTICS_ACTION.NEW_TAB:
              await browser.tabs.create({ url: messageFromHeuristics.payload.url })
              break

            case HEURISTICS_ACTION.NOTIFY:
              await browser.notifications.create('heuristics-notify', {
                title: 'New Event',
                type: 'basic',
                message: messageFromHeuristics.payload.message,
                iconUrl:
                  'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
              })
              break

            case HEURISTICS_ACTION.QUERY_TABS:
              const currentTabs = store.getState().currentTabs?.tabs as ITab[]
              log(`> Initializing current tabs in heuristics:`, currentTabs)
              postNativeMessage(nativePort, {
                action: TAB_ACTION.INIT_TABS,
                payload: { currentTabs },
              })
              break
          }
        } catch (e) {
          console.error(e)
        }
      })
      log('> Prepared a listener for native communication events')
    }
  }
  if (opt.tutorialProgress < 3) {
    browser.tabs.create({ url: 'tutorial.html' })
  }
})

// setup a listener for communication from the popup
browser.runtime.onMessage.addListener(async (message: any) => {
  debug(options)('received message in background', message)

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

// setup the listener for the onCreated event
browser.tabs.onCreated.addListener((tabData: Tabs.CreateCreatePropertiesType) => {
  store.dispatch(createTab({ tabData }))
})

// setup the listener for the onUpdated event
// available properties that we can filter updates for (in FF):
// "attention", "audible", "discarded", "favIconUrl", "hidden", "isArticle",
// "mutedInfo", "pinned", "sharingState", "status", "title"
function onTabUpdate(tabId: number, changeInfo: Tabs.OnUpdatedChangeInfoType, tab: Tabs.Tab): void {
  store.dispatch(
    updateTabAndNotify({ id: tabId, changeData: changeInfo, nativePort, newTab: tab }) as any
  )
}
try {
  browser.tabs.onUpdated.addListener(onTabUpdate, {
    properties: RELEVANT_TAB_PROPS as any,
  })
} catch (e) {
  browser.tabs.onUpdated.addListener(onTabUpdate)
}

// setup the listener for the onMoved event
browser.tabs.onMoved.addListener((tabId: number, moveInfo: Tabs.OnMovedMoveInfoType) => {
  store.dispatch(updateTabAndNotify({ id: tabId, changeData: moveInfo, nativePort }) as any)
})

// setup the listener for the onActivated event
browser.tabs.onActivated.addListener((activeInfo: Tabs.OnActivatedActiveInfoType) => {
  store.dispatch(activateTabAndNotify({ activeInfo, nativePort }) as any)
})

// setup the listener for the onAttached event
browser.tabs.onAttached.addListener((tabId: number, attachInfo: Tabs.OnAttachedAttachInfoType) => {
  store.dispatch(updateTabAndNotify({ id: tabId, changeData: attachInfo, nativePort }) as any)
})

// setup the listener for the onRemoved event
browser.tabs.onRemoved.addListener((tabId: number, removeInfo: Tabs.OnRemovedRemoveInfoType) => {
  store.dispatch(removeTabAndNotify({ tabId, removeInfo, nativePort }) as any)
})

// setup context menu entries
// browser.contextMenus.create({ title: 'group this', contexts: ['tab'] }, () => null)
// browser.contextMenus.removeAll()
