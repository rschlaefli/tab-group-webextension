import { Tabs } from 'webextension-polyfill-ts'
import { updateTabAndNotify } from '@src/state/currentTabs'

export default function onTabAttached({ dispatch }, nativePort) {
  return (tabId: number, attachInfo: Tabs.OnAttachedAttachInfoType): void => {
    dispatch(updateTabAndNotify({ id: tabId, changeData: attachInfo, nativePort }) as any)
  }
}
