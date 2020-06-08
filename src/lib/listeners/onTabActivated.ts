import { Tabs } from 'webextension-polyfill-ts'
import { activateTabAndNotify } from '@src/state/currentTabs'

export default function onTabActivated({ dispatch }, nativePort) {
  return (activeInfo: Tabs.OnActivatedActiveInfoType): void => {
    dispatch(activateTabAndNotify({ activeInfo, nativePort }) as any)
  }
}