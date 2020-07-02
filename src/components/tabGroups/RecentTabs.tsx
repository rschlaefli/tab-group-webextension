import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import TabGroup from './TabGroup'
import { RootState } from '@src/state/configureStore'
import { collapseRecentTabs, openCurrentTabAlias } from '@src/state/currentTabs'
import CuratedTab from '../tabs/CuratedTab'

function RecentTabs(): React.ReactElement {
  const dispatch = useDispatch()

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
    <TabGroup>
      {({ handleOpenContextMenu }) => (
        <>
          <TabGroup.Header onOpenContextMenu={handleOpenContextMenu}>
            <TabGroup.Collapser
              isCollapsed={recentTabsCollapsed}
              numTabs={recentTabs.length}
              onCollapseGroup={handleCollapseRecentTabs}
            />
            <TabGroup.Title isReadOnly value="Recent Tabs" />
          </TabGroup.Header>

          <TabGroup.Tabs isReadOnly isCollapsed={recentTabsCollapsed} id="recent">
            {recentTabs.map((tab, ix) => {
              const uniqueId = `recent-${tab.hash}`
              return (
                <CuratedTab
                  isReadOnly
                  key={uniqueId}
                  id={uniqueId}
                  index={ix}
                  title={tab.title}
                  url={tab.url}
                  onOpenCurrentTab={handleOpenCurrentTab(tab.hash as string)}
                />
              )
            })}
          </TabGroup.Tabs>
        </>
      )}
    </TabGroup>
  )
}

export default RecentTabs
