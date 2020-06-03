import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import TabGroup from './TabGroup'
import { RootState } from '@src/state/configureStore'
import { collapseRecentTabs, openCurrentTabAlias } from '@src/state/currentTabs'

function RecentTabs(): React.ReactElement {
  const dispatch = useDispatch()

  const tabHashes = useSelector((state: RootState) => state.currentTabs.tabHashes)
  const recentTabs = useSelector((state: RootState) => state.currentTabs.recentTabs)
  const recentTabsCollapsed = useSelector(
    (state: RootState) => state.currentTabs.recentTabsCollapsed
  )

  const handleCollapseRecentTabs = (): void => {
    dispatch(collapseRecentTabs())
  }

  const handleOpenCurrentTab = (tabHash: string) => (): void => {
    dispatch(openCurrentTabAlias(tabHash))
  }

  return (
    <TabGroup
      isReadOnly
      id="recent"
      name="Recent Tabs"
      tabs={recentTabs}
      currentTabs={tabHashes}
      isCollapsed={recentTabsCollapsed}
      onCollapseGroup={handleCollapseRecentTabs}
      onOpenCurrentTab={handleOpenCurrentTab}
    />
  )
}

export default RecentTabs
