// https://github.com/fregante/webext-storage-cache
// import cache from 'webext-storage-cache'
import { wrapStore } from 'webext-redux'
import { browser, Tabs, Runtime } from 'webextension-polyfill-ts'

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
  updateTab,
  activateTab,
  removeTab,
  initializeCurrentTabs,
} from './state/currentTabs'
import { postNativeMessage, augmentTabExtras } from './lib/utils'
import OptionsSync from 'webext-options-sync'

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
  if (opt.enableHeuristics) {
    nativePort = browser.runtime.connectNative('tabs')
    console.log('> Opened native port: ', nativePort)

    // setup a listener for native communcation
    if (nativePort) {
      nativePort.onMessage.addListener(async (messageFromHeuristics: IHeuristicsAction) => {
        console.log(`> Received message over native port:`, messageFromHeuristics)

        try {
          switch (messageFromHeuristics.action) {
            case HEURISTICS_ACTION.NEW_TAB:
              await browser.tabs.create({ url: messageFromHeuristics.payload.url })

            case HEURISTICS_ACTION.NOTIFY:
              await browser.notifications.create('heuristics-notify', {
                title: 'New Event',
                type: 'basic',
                message: messageFromHeuristics.payload.message,
                iconUrl:
                  'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
              })

            case HEURISTICS_ACTION.QUERY_TABS:
              const currentTabs = store.getState().currentTabs?.tabs as ITab[]
              console.log(`> Initializing current tabs in heuristics: ${currentTabs}`)
              postNativeMessage(nativePort, {
                action: TAB_ACTION.INIT_TABS,
                payload: { currentTabs },
              })
          }
        } catch (e) {
          console.error(e)
        }
      })
      console.log('> Prepared a listener for native communication events')
    }
  }
})

export function debug(...content: any[]): void {
  if (!options || options.debugLogging) console.log(...content)
}

async function performTabUpdate(tab: Partial<ITab>): Promise<void> {
  const augmentedTabData = augmentTabExtras(tab)

  store.dispatch(updateTab({ tabId: tab.id, tabData: augmentedTabData }))

  if (tab.status !== 'loading') {
    postNativeMessage(nativePort, {
      action: TAB_ACTION.UPDATE,
      payload: augmentedTabData,
    })
  }
}

function onTabCreate(tabData: Tabs.CreateCreatePropertiesType): void {
  const augmentedTabData = augmentTabExtras(tabData)

  debug('CREATE', augmentedTabData)

  store.dispatch(createTab({ tabData: augmentedTabData }))
}

function onTabUpdate(tabId: number, changeInfo: Tabs.OnUpdatedChangeInfoType, tab: Tabs.Tab): void {
  debug('UPDATE', tabId, changeInfo, tab)

  if (
    options.openSidebarByDefault &&
    !tab.url?.startsWith('moz-extension:') &&
    !tab.url?.startsWith('chrome:') &&
    tab.status === 'complete'
  ) {
    browser.tabs.executeScript(tab.id, {
      file: '/sidebar.bundle.js',
      runAt: 'document_start',
      matchAboutBlank: true,
    })
  }

  performTabUpdate(tab)
}

function onTabMoved(tabId: number, moveInfo: Tabs.OnMovedMoveInfoType): void {
  debug('MOVED', tabId, moveInfo)

  performTabUpdate({ id: tabId, ...moveInfo })
}

function onTabActivated(activeInfo: Tabs.OnActivatedActiveInfoType): void {
  debug('ACTIVATED', activeInfo)

  store.dispatch(activateTab({ tabId: activeInfo.tabId, previousTabId: activeInfo.previousTabId }))

  // TODO: lookup hashes of new and previous active tab and send to the heuristics engine?

  postNativeMessage(nativePort, {
    action: TAB_ACTION.ACTIVATE,
    payload: { id: activeInfo.tabId, ...activeInfo },
  })
}

function onTabAttached(tabId: number, attachInfo: Tabs.OnAttachedAttachInfoType): void {
  debug('ATTACHED', tabId, attachInfo)

  performTabUpdate({ id: tabId, ...attachInfo })
}

function onTabRemoved(tabId: number, removeInfo: Tabs.OnRemovedRemoveInfoType): void {
  debug('REMOVED', tabId, removeInfo)

  store.dispatch(removeTab({ tabId }))

  postNativeMessage(nativePort, {
    action: TAB_ACTION.REMOVE,
    payload: { id: tabId, ...removeInfo },
  })
}

// setup a listener for communication from the popup
browser.runtime.onMessage.addListener(async (message: any) => {
  debug('received message in background', message)

  if (message.type === 'SIDEBAR') {
    const currentTab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0]

    await browser.tabs.executeScript(currentTab.id, {
      file: '/sidebar.bundle.js',
      runAt: 'document_start',
      matchAboutBlank: true,
    })
  }
})

// setup the listener for the onCreated event
browser.tabs.onCreated.addListener(onTabCreate)

// setup the listener for the onUpdated event
// available properties that we can filter updates for (in FF):
// "attention", "audible", "discarded", "favIconUrl"
// "hidden", "isArticle", "mutedInfo", "pinned"
// "sharingState", "status", "title"
try {
  browser.tabs.onUpdated.addListener(onTabUpdate, { properties: ['pinned', 'title', 'status'] })
} catch (e) {
  browser.tabs.onUpdated.addListener(onTabUpdate)
}

// setup the listener for the onMoved event
browser.tabs.onMoved.addListener(onTabMoved)

// setup the listener for the onActivated event
browser.tabs.onActivated.addListener(onTabActivated)

// setup the listener for the onAttached event
browser.tabs.onAttached.addListener(onTabAttached)

// setup the listener for the onRemoved event
browser.tabs.onRemoved.addListener(onTabRemoved)

// setup context menu entries
browser.contextMenus.create({ title: 'group this', contexts: ['tab'] }, () => null)
// browser.contextMenus.removeAll()
