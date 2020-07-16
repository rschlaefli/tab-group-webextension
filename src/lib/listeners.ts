import { Runtime, browser } from 'webextension-polyfill-ts'

import onBrowserActionClicked from './listeners/onBrowserActionClicked'
import onNativeDisconnect from './listeners/onNativeDisconnect'
import onNativeMessage from './listeners/onNativeMessage'
import onTabActivated from './listeners/onTabActivated'
import onTabAttached from './listeners/onTabAttached'
import onTabCreated from './listeners/onTabCreated'
import onTabRemoved from './listeners/onTabRemoved'
import onTabUpdated from './listeners/onTabUpdated'
import { RootState } from '@src/state/configureStore'
import onIdleStateChanged from './listeners/onIdleStateChanged'
import onPauseProcessing from './listeners/onPauseProcessing'
import onResumeProcessing from './listeners/onResumeProcessing'
import onSuggestionsRefresh from './listeners/onSuggestionsRefresh'
import { updateIsHeuristicsBackendEnabled } from '@src/state/settings'
import onRuntimeMessage from './listeners/onRuntimeMessage'
import onCommand from './listeners/onCommand'

const RELEVANT_TAB_PROPS = ['pinned', 'title', 'status', 'favIconUrl', 'url']

const LISTENERS: any = {}

function setupListeners({ dispatch, getState }, nativePort?: Runtime.Port): void {
  console.log('[background] Preparing listeners', nativePort)

  // setup a listener for the browser action (opening the ui)
  LISTENERS.onBrowserActionClicked = onBrowserActionClicked({ dispatch })
  browser.browserAction.onClicked.addListener(LISTENERS.onBrowserActionClicked)

  // setup the listener for the onCreated event
  LISTENERS.onTabCreated = onTabCreated({ dispatch })
  browser.tabs.onCreated.addListener(LISTENERS.onTabCreated)

  // setup the listener for the onUpdated event
  // available properties that we can filter updates for (in FF):
  // "attention", "audible", "discarded", "favIconUrl", "hidden", "isArticle",
  // "mutedInfo", "pinned", "sharingState", "status", "title"
  LISTENERS.onTabUpdated = onTabUpdated({ dispatch }, nativePort)
  try {
    browser.tabs.onUpdated.addListener(LISTENERS.onTabUpdated, {
      properties: RELEVANT_TAB_PROPS as any,
    })
  } catch (e) {
    browser.tabs.onUpdated.addListener(LISTENERS.onTabUpdated)
  }

  // setup the listener for the onActivated event
  LISTENERS.onTabActivated = onTabActivated({ dispatch }, nativePort)
  browser.tabs.onActivated.addListener(LISTENERS.onTabActivated)

  // setup the listener for the onAttached event
  LISTENERS.onTabAttached = onTabAttached({ dispatch }, nativePort)
  browser.tabs.onAttached.addListener(LISTENERS.onTabAttached)

  // setup the listener for the onRemoved event
  LISTENERS.onTabRemoved = onTabRemoved({ dispatch }, nativePort)
  browser.tabs.onRemoved.addListener(LISTENERS.onTabRemoved)

  // setup a listener that tracks window focus changes
  LISTENERS.onWindowFocusChanged = (...params) => console.log(params)
  browser.windows.onFocusChanged.addListener(LISTENERS.onWindowFocusChanged)

  // setup a listener for keyboard shortcuts
  LISTENERS.onCommand = onCommand({ dispatch, nativePort })
  browser.commands.onCommand.addListener(LISTENERS.onCommand)

  // setup a listener for runtime messages
  LISTENERS.onRuntimeMessage = onRuntimeMessage({ dispatch, nativePort })
  browser.runtime.onMessage.addListener(LISTENERS.onRuntimeMessage)

  if (nativePort) {
    LISTENERS.onNativeMessage = onNativeMessage({ dispatch, getState }, nativePort)
    nativePort.onMessage.addListener(LISTENERS.onNativeMessage)

    LISTENERS.onNativeDisconnect = onNativeDisconnect({ dispatch })
    nativePort.onDisconnect.addListener(LISTENERS.onNativeDisconnect)

    // setup a listener to track idle status (5 minutes)
    LISTENERS.onIdleStateChanged = onIdleStateChanged(nativePort)
    browser.idle.onStateChanged.addListener(LISTENERS.onIdleStateChanged)
    browser.idle.setDetectionInterval(60 * 5)

    browser.contextMenus.create({
      id: 'pause',
      title: 'Pause Processing',
      contexts: ['browser_action'],
    })

    browser.contextMenus.create({
      id: 'resume',
      title: 'Resume Processing',
      contexts: ['browser_action'],
    })

    browser.contextMenus.create({
      id: 'refresh',
      title: 'Refresh Suggestions',
      contexts: ['browser_action'],
    })

    LISTENERS.onResumeProcessing = onResumeProcessing({ dispatch }, nativePort)
    LISTENERS.onPauseProcessing = onPauseProcessing({ dispatch }, nativePort)
    LISTENERS.onSuggestionsRefresh = onSuggestionsRefresh({ dispatch })
    LISTENERS.onContextMenuClicked = function ({ menuItemId }) {
      switch (menuItemId) {
        case 'resume':
          LISTENERS.onResumeProcessing()
          break
        case 'pause':
          LISTENERS.onPauseProcessing()
          break
        case 'refresh':
          LISTENERS.onSuggestionsRefresh()
          break
      }
    }

    browser.contextMenus.onClicked.addListener(LISTENERS.onContextMenuClicked)
  }
}

function removeListeners(nativePort?: Runtime.Port): void {
  try {
    browser.browserAction.onClicked.removeListener(LISTENERS.onBrowserActionClicked)
    browser.tabs.onCreated.removeListener(LISTENERS.onTabCreated)
    browser.tabs.onUpdated.removeListener(LISTENERS.onTabUpdated)
    browser.tabs.onActivated.removeListener(LISTENERS.onTabActivated)
    browser.tabs.onAttached.removeListener(LISTENERS.onTabAttached)
    browser.tabs.onRemoved.removeListener(LISTENERS.onTabRemoved)
    browser.windows.onFocusChanged.removeListener(LISTENERS.onWindowFocusChanged)
    browser.idle.onStateChanged.removeListener(LISTENERS.onIdleStateChanged)

    if (nativePort) {
      console.log('[background] Removing native messaging listeners')

      nativePort.onMessage.removeListener(LISTENERS.onNativeMessage)
      nativePort.onDisconnect.removeListener(LISTENERS.onNativeDisconnect)

      browser.idle.onStateChanged.removeListener(LISTENERS.onIdleStateChanged)

      browser.contextMenus.onClicked.removeListener(LISTENERS.onContextMenuClicked)
      browser.contextMenus.remove('pause')
      browser.contextMenus.remove('resume')
      browser.contextMenus.remove('refresh')
    }
  } catch (e) {
    console.error(e)
  }
}

export let nativePort: Runtime.Port | null
export const processSettings = ({ dispatch, getState }) => (settings?: unknown) => {
  const currentState: RootState = getState()
  const options: any = settings || currentState.settings

  const tutorial = currentState.tutorial
  if (tutorial?.progress < 3) {
    browser.tabs.query({ url: 'tutorial.html' }).then((existingTutorialTabs) => {
      browser.tabs.create({ url: 'tutorial.html' })
      if (existingTutorialTabs.length > 0) {
        browser.tabs.remove(existingTutorialTabs.map((tab) => tab.id) as number[])
      }
    })
  }

  console.log('[background] Processing options', options)

  if (options.isHeuristicsBackendEnabled && !nativePort) {
    // remove any listeners that might already exist
    removeListeners()

    try {
      nativePort = browser.runtime.connectNative('tabs')
      console.log('[background] Opened native port:', nativePort.name)
      setupListeners({ dispatch, getState }, nativePort)
    } catch (e) {
      console.error('[background] Failed to connect to the native backend', e)
      dispatch(updateIsHeuristicsBackendEnabled(false))
      setupListeners({ dispatch, getState })
    }
  } else if (!options.isHeuristicsBackendEnabled) {
    // if there is a native port, but the heuristics have been disabled, close the port
    if (nativePort) {
      removeListeners(nativePort)
      nativePort.disconnect()
      nativePort = null
    }
    setupListeners({ dispatch, getState })
  }
}
