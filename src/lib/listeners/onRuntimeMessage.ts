import { sendMessageToActiveContentScript } from '../utils'

export enum RuntimeMessage {
  TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
  PIN_SIDEBAR = 'PIN_SIDEBAR',
}

export default function onRuntimeMessage({ dispatch, nativePort }) {
  return function onRuntimeMessageListener(message): void {
    console.log('[background] received message in background', message)

    if (message === RuntimeMessage.TOGGLE_SIDEBAR) {
      browser.tabs.executeScript({ file: 'sidebar.bundle.js' })
      sendMessageToActiveContentScript('TOGGLE_SIDEBAR')
    }

    if (message === RuntimeMessage.PIN_SIDEBAR) {
      sendMessageToActiveContentScript('TOGGLE_PINNED')
    }
  }
}
