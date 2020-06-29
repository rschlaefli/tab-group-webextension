import { sendMessageToActiveContentScript } from '../utils'

export default function onCommand({ dispatch, nativePort }) {
  return function onCommandListener(command: string): void {
    console.log('[background] received command in background', command)

    if (command === 'toggle_sidebar') {
      browser.tabs.executeScript({ file: 'sidebar.bundle.js' })
      sendMessageToActiveContentScript('TOGGLE_SIDEBAR')
    }
  }
}
