import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import TabGroup from './TabGroup'
import {
  collapseCurrentTabs,
  openCurrentTabAlias,
  closeCurrentTabAlias,
} from '@src/state/currentTabs'
import { RootState } from '@src/state/configureStore'

function CurrentTabs(): React.ReactElement {
  const dispatch = useDispatch()

  const tabHashes = useSelector((state: RootState) => state.currentTabs.tabHashes)
  const tabs = useSelector((state: RootState) => state.currentTabs.tabs)
  const collapsed = useSelector((state: RootState) => state.currentTabs.collapsed)

  const handleCollapseCurrentTabs = (): void => {
    dispatch(collapseCurrentTabs())
  }

  const handleOpenCurrentTab = (tabHash: string) => (): void => {
    dispatch(openCurrentTabAlias(tabHash))
  }

  const handleCloseCurrentTab = (tabHash: string) => (): void => {
    dispatch(closeCurrentTabAlias(tabHash))
  }

  return (
    <TabGroup
      isReadOnly
      isDropDisabled
      id="current"
      name="Current Tabs"
      tabs={tabs}
      currentTabs={tabHashes}
      isCollapsed={collapsed}
      onCollapseGroup={handleCollapseCurrentTabs}
      onCloseTab={handleCloseCurrentTab}
      onOpenCurrentTab={handleOpenCurrentTab}
    />
  )
}

export default CurrentTabs
