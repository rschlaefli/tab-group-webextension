import { Tabs, Runtime, browser } from 'webextension-polyfill-ts'
import {
  createTab,
  updateTabAndNotify,
  activateTabAndNotify,
  removeTabAndNotify,
} from '@src/state/currentTabs'
import {
  IHeuristicsAction,
  HEURISTICS_ACTION,
  ITab,
  TAB_ACTION,
  ITabGroup,
} from '@src/types/Extension'
import { updateSuggestedGroups } from '@src/state/suggestions'
import { postNativeMessage, pickRelevantProperties } from './utils'
import { RootState } from '@src/state/configureStore'
import { openExtensionUI } from '@src/state/settings'

const RELEVANT_TAB_PROPS = ['pinned', 'title', 'status', 'favIconUrl', 'url']

const onBrowserActionClicked = ({ dispatch }) => () => {
  dispatch(openExtensionUI())
}

const onTabCreated = ({ dispatch }) => (tabData: Tabs.CreateCreatePropertiesType): void => {
  dispatch(createTab({ tabData }))
}

const onTabUpdated = ({ dispatch }, nativePort) => (
  tabId: number,
  changeInfo: Tabs.OnUpdatedChangeInfoType,
  tab: Tabs.Tab
): void => {
  dispatch(
    updateTabAndNotify({ id: tabId, changeData: changeInfo, nativePort, newTab: tab }) as any
  )
}

// const onTabMoved = ({ dispatch }, nativePort) => (
//   tabId: number,
//   moveInfo: Tabs.OnMovedMoveInfoType
// ): void => {
//   dispatch(updateTabAndNotify({ id: tabId, changeData: moveInfo, nativePort }) as any)
// }

const onTabActivated = ({ dispatch }, nativePort) => (
  activeInfo: Tabs.OnActivatedActiveInfoType
): void => {
  dispatch(activateTabAndNotify({ activeInfo, nativePort }) as any)
}

const onTabAttached = ({ dispatch }, nativePort) => (
  tabId: number,
  attachInfo: Tabs.OnAttachedAttachInfoType
): void => {
  dispatch(updateTabAndNotify({ id: tabId, changeData: attachInfo, nativePort }) as any)
}

const onTabRemoved = ({ dispatch }, nativePort) => (
  tabId: number,
  removeInfo: Tabs.OnRemovedRemoveInfoType
): void => {
  dispatch(removeTabAndNotify({ tabId, removeInfo, nativePort }) as any)
}

const onNativeMessage = ({ dispatch, getState }, nativePort) => (
  messageFromHeuristics: IHeuristicsAction
): void => {
  console.log('[background] Received message over native port:', messageFromHeuristics)

  switch (messageFromHeuristics.action) {
    case HEURISTICS_ACTION.UPDATE_GROUPS:
      dispatch(updateSuggestedGroups(messageFromHeuristics.payload))
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

    case HEURISTICS_ACTION.QUERY_TABS: {
      const currentTabs = getState().currentTabs?.tabs as ITab[]
      console.log('[background] Initializing current tabs in heuristics:', currentTabs)
      postNativeMessage(nativePort, {
        action: TAB_ACTION.INIT_TABS,
        payload: { currentTabs: currentTabs.map(pickRelevantProperties) },
      })
      break
    }

    case HEURISTICS_ACTION.QUERY_GROUPS: {
      const tabGroups = getState().tabGroups as ITabGroup[]
      console.log('[background] Initializing tab groups in heuristics:', tabGroups)
      postNativeMessage(nativePort, {
        action: TAB_ACTION.INIT_GROUPS,
        payload: {
          tabGroups: tabGroups.map((group) => ({
            ...group,
            tabs: group.tabs.map(pickRelevantProperties),
          })),
        },
      })
      break
    }
  }
}

const onNativeDisconnect = (...params): void => {
  console.warn('[background] Disconnected the native port', params)
}

function setupListeners({ dispatch, getState }, nativePort?: Runtime.Port): void {
  console.log('[background] Preparing listeners', nativePort)

  // setup a listener for the browser action (opening the ui)
  browser.browserAction.onClicked.addListener(onBrowserActionClicked({ dispatch }))

  // setup the listener for the onCreated event
  browser.tabs.onCreated.addListener(onTabCreated({ dispatch }))

  // setup the listener for the onUpdated event
  // available properties that we can filter updates for (in FF):
  // "attention", "audible", "discarded", "favIconUrl", "hidden", "isArticle",
  // "mutedInfo", "pinned", "sharingState", "status", "title"
  try {
    browser.tabs.onUpdated.addListener(onTabUpdated({ dispatch }, nativePort), {
      properties: RELEVANT_TAB_PROPS as any,
    })
  } catch (e) {
    browser.tabs.onUpdated.addListener(onTabUpdated({ dispatch }, nativePort))
  }

  // setup the listener for the onMoved event
  // browser.tabs.onMoved.addListener(onTabMoved({ dispatch }, nativePort))

  // setup the listener for the onActivated event
  browser.tabs.onActivated.addListener(onTabActivated({ dispatch }, nativePort))

  // setup the listener for the onAttached event
  browser.tabs.onAttached.addListener(onTabAttached({ dispatch }, nativePort))

  // setup the listener for the onRemoved event
  browser.tabs.onRemoved.addListener(onTabRemoved({ dispatch }, nativePort))

  if (nativePort) {
    nativePort.onMessage.addListener(onNativeMessage({ dispatch, getState }, nativePort))
    nativePort.onDisconnect.addListener(onNativeDisconnect)
  }
}

function removeListeners({ dispatch, getState }, nativePort?: Runtime.Port): void {
  browser.browserAction.onClicked.removeListener(onBrowserActionClicked({ dispatch }))
  browser.tabs.onCreated.removeListener(onTabCreated({ dispatch }))
  browser.tabs.onUpdated.removeListener(onTabUpdated({ dispatch }, nativePort))
  // browser.tabs.onMoved.removeListener(onTabMoved({ dispatch }, nativePort))
  browser.tabs.onActivated.removeListener(onTabActivated({ dispatch }, nativePort))
  browser.tabs.onAttached.removeListener(onTabAttached({ dispatch }, nativePort))
  browser.tabs.onRemoved.removeListener(onTabRemoved({ dispatch }, nativePort))
  if (nativePort) {
    nativePort.onMessage.removeListener(onNativeMessage({ dispatch, getState }, nativePort))
    nativePort.onDisconnect.removeListener(onNativeDisconnect)
  }
}

let nativePort: Runtime.Port
export const processSettings = ({ dispatch, getState }) => (settings?: unknown) => {
  const currentState: RootState = getState()
  const options: any = settings || currentState.settings

  console.log('[background] Processing options', options)

  if (typeof options.isHeuristicsBackendEnabled !== 'undefined') {
    if (options.isHeuristicsBackendEnabled) {
      try {
        nativePort = browser.runtime.connectNative('tabs')
        console.log('[background] Opened native port:', nativePort.name)

        setupListeners({ dispatch, getState }, nativePort)
      } catch (e) {
        console.error('[background] Failed to connect to the native backend', e)
      }
    } else {
      // if there is a native port, but the heuristics have been disabled, close the port
      if (typeof nativePort !== 'undefined') {
        removeListeners({ dispatch, getState }, nativePort)
        nativePort.disconnect()
      }
      setupListeners({ dispatch, getState })
    }
  }

  const tutorial = currentState.tutorial
  if (tutorial?.progress < 3) {
    browser.tabs.create({ url: 'tutorial.html' })
  }
}
