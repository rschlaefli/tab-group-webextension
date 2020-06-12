import { openExtensionUI } from '@src/state/settings'

export default function onBrowserActionClicked({ dispatch }) {
  return function onBrowserActionClickedListener(): void {
    dispatch(openExtensionUI())
  }
}
