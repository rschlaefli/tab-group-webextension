import { openTabGroupAlias } from '@src/state/tabGroups'
import { performBrowserActionSafe } from '../utils'

export default function onOmniboxEnter({ dispatch }) {
  return function onOmniboxEnterListener(action: string): void {
    if (action.startsWith('group-open')) {
      dispatch(openTabGroupAlias({ tabGroupId: action.replace('group-open-', '') }))
    } else if (action.startsWith('tab-open')) {
      performBrowserActionSafe(async (browser) => {
        browser.tabs.update({
          active: true,
          url: action.replace('tab-open-', ''),
        })
      })
    }
  }
}
