import { browser } from 'webextension-polyfill-ts'
import { sendMessageToActiveContentScript } from '../utils'
import { resumeHeuristicsProcessing, pauseHeuristicsProcessing } from '@src/state/settings'

export enum RuntimeMessage {
  TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
  PIN_SIDEBAR = 'PIN_SIDEBAR',
  PAUSE_PROCESSING = 'PAUSE_PROCESSING',
  RESUME_PROCESSING = 'RESUME_PROCESSING',
}

export default function onRuntimeMessage({ dispatch, nativePort }) {
  return function onRuntimeMessageListener(message): void {
    console.log('[background] received message in background', message)

    switch (message) {
      case RuntimeMessage.TOGGLE_SIDEBAR: {
        browser.tabs.executeScript({ file: 'sidebar.bundle.js' })
        sendMessageToActiveContentScript('TOGGLE_SIDEBAR')
        break
      }
      case RuntimeMessage.PIN_SIDEBAR: {
        sendMessageToActiveContentScript('TOGGLE_PINNED')
        break
      }
      case RuntimeMessage.PAUSE_PROCESSING: {
        dispatch(pauseHeuristicsProcessing(nativePort))
        break
      }
      case RuntimeMessage.RESUME_PROCESSING: {
        dispatch(resumeHeuristicsProcessing(nativePort))
        break
      }
    }
  }
}
