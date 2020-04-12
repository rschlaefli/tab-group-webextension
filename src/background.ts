// https://github.com/fregante/webext-storage-cache
// import cache from 'webext-storage-cache'
import { wrapStore } from 'webext-redux'
import { browser, Tabs, Runtime } from 'webextension-polyfill-ts'

import {
  TAB_ACTION,
  IHeuristicsAction,
  HEURISTICS_ACTION
  // TAB_GROUP_ACTION
} from './types/Extension'
import configureStore from './state/configureStore'

import './optionsStorage'
import { createTab, updateTab, activateTab, removeTab } from './state/currentTabs'

// setup a redux store
const { store } = configureStore({})

// wrap the redux store for webext communication
wrapStore(store, { portName: 'tabGrouping' })

// connect to the native port
const nativePort: Runtime.Port = browser.runtime.connectNative('tabs')
console.log('> Opened native port: ', nativePort)

// setup a listener for native communcation
nativePort.onMessage.addListener(async (response: IHeuristicsAction) => {
  console.log(`Received message over native port:`, response)

  try {
    if (response.action === HEURISTICS_ACTION.NEW_TAB) {
      await browser.tabs.create({ url: response.payload.url })
    }

    if (response.action === HEURISTICS_ACTION.NOTIFY) {
      await browser.notifications.create('heuristics-notify', {
        title: 'New Event',
        type: 'basic',
        message: response.payload.message,
        iconUrl:
          'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7'
      })
    }
  } catch (e) {
    console.error(e)
  }
})

// setup a listener for communication from the popup
browser.runtime.onMessage.addListener(async (message: any) => {
  console.log('received message in background', message)

  if (message.type === 'SIDEBAR') {
    const currentTab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true
      })
    )[0]

    await browser.tabs.executeScript(currentTab.id, {
      file: '/sidebar.bundle.js',
      runAt: 'document_start',
      matchAboutBlank: true
    })
  }
})

async function performTabUpdate(tab: Partial<Tabs.Tab>): Promise<void> {
  store.dispatch(updateTab({ tabId: tab.id, tabData: tab }))

  try {
    if (tab.status !== 'loading') {
      nativePort.postMessage({ action: TAB_ACTION.UPDATE, payload: tab })
    }
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}

function onTabCreate(tabData: Tabs.CreateCreatePropertiesType): void {
  console.log('CREATE', tabData)

  store.dispatch(createTab({ tabData }))

  try {
    nativePort.postMessage({ action: TAB_ACTION.CREATE, payload: tabData })
  } catch (e) {
    console.error(e)
  }
}

function onTabUpdate(tabId: number, changeInfo: Tabs.OnUpdatedChangeInfoType, tab: Tabs.Tab): void {
  console.log('UPDATE', tabId, changeInfo, tab)

  performTabUpdate(tab)
}

function onTabMoved(tabId: number, moveInfo: Tabs.OnMovedMoveInfoType): void {
  console.log('MOVED', tabId, moveInfo)

  // store.dispatch(createTab({ tabData }))

  performTabUpdate({ id: tabId, ...moveInfo })
}

function onTabActivated(activeInfo: Tabs.OnActivatedActiveInfoType): void {
  console.log('ACTIVATED', activeInfo)

  store.dispatch(activateTab({ tabId: activeInfo.tabId, previousTabId: activeInfo.previousTabId }))

  try {
    nativePort.postMessage({
      action: TAB_ACTION.ACTIVATE,
      payload: { id: activeInfo.tabId, ...activeInfo }
    })
  } catch (e) {
    console.error(e)
  }
}

function onTabAttached(tabId: number, attachInfo: Tabs.OnAttachedAttachInfoType): void {
  console.log('ATTACHED', tabId, attachInfo)

  // store.dispatch(createTab({ tabData }))

  performTabUpdate({ id: tabId, ...attachInfo })
}

function onTabRemoved(tabId: number, removeInfo: Tabs.OnRemovedRemoveInfoType): void {
  console.log('REMOVED', tabId, removeInfo)

  store.dispatch(removeTab({ tabId }))

  try {
    nativePort.postMessage({
      action: TAB_ACTION.REMOVE,
      payload: { id: tabId, ...removeInfo }
    })
  } catch (e) {
    console.error(e)
  }
}

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
