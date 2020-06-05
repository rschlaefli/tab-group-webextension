import { Tabs } from 'webextension-polyfill-ts'
import { removeTabAndNotify } from '@src/state/currentTabs'

export default function onTabRemoved({ dispatch }, nativePort) {
  return (tabId: number, removeInfo: Tabs.OnRemovedRemoveInfoType): void => {
    dispatch(removeTabAndNotify({ tabId, removeInfo, nativePort }) as any)
  }
}
