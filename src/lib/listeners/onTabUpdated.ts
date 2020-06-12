import { Tabs } from 'webextension-polyfill-ts'
import { updateTabAndNotify } from '@src/state/currentTabs'

export default function onTabUpdated({ dispatch }, nativePort) {
  return function onTabUpdatedListener(
    tabId: number,
    changeInfo: Tabs.OnUpdatedChangeInfoType,
    tab: Tabs.Tab
  ): void {
    dispatch(
      updateTabAndNotify({ id: tabId, changeData: changeInfo, nativePort, newTab: tab }) as any
    )
  }
}
