import { Tabs } from 'webextension-polyfill-ts'
import { createTab } from '@src/state/currentTabs'

export default function onTabCreated({ dispatch }) {
  return (tabData: Tabs.CreateCreatePropertiesType): void => {
    dispatch(createTab({ tabData }))
  }
}
