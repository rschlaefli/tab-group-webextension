import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  collapseCurrentTabs,
  openCurrentTabAlias,
  closeCurrentTabAlias,
  closeStaleTabsAlias,
} from '@src/state/currentTabs'
import { RootState } from '@src/state/configureStore'
import TabGroup from './TabGroup'
import CuratedTab from '../tabs/CuratedTab'
import { groupBy } from 'ramda'
import WindowSeparator from '../tabs/WindowSeparator'
import { ITab } from '@src/types/Extension'
import { DeleteSweep } from '@material-ui/icons'

function injectWindowSeparators(inputTabs: ITab[], mapTab: any) {
  // group tabs by their window
  const windowGroups = groupBy((tab) => tab?.windowId?.toString() ?? '0', inputTabs)

  // inject window separators
  const tabListWithSeparators = Object.entries(
    windowGroups
  ).flatMap(([windowId, windowTabs], ix) => [
    <WindowSeparator key={windowId} index={ix} />,
    ...windowTabs.map(mapTab),
  ])

  // reduce the list of tabs to get an index that ignores separators
  const tabListWithConsistentIndex = tabListWithSeparators.reduce(
    ({ ix, tabs }, tab) => {
      if (typeof tab === 'function') {
        return { ix: ix + 1, tabs: tabs.concat(tab(ix)) }
      }
      return { ix, tabs: tabs.concat(tab) }
    },
    { ix: 0, tabs: [] as any[] }
  )

  return tabListWithConsistentIndex.tabs
}

function CurrentTabs(): React.ReactElement {
  const dispatch = useDispatch()

  const tabs = useSelector((state: RootState) => state.currentTabs.tabs)
  const staleTabs = useSelector((state: RootState) => state.currentTabs.staleTabs)
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

  const handleCloseStaleTabs = () => {
    dispatch(closeStaleTabsAlias())
  }

  return (
    <TabGroup>
      {({ handleOpenContextMenu }) => (
        <>
          <TabGroup.Header onOpenContextMenu={handleOpenContextMenu}>
            <TabGroup.Collapser
              isCollapsed={collapsed}
              numTabs={tabs.length}
              onCollapseGroup={handleCollapseCurrentTabs}
            />
            <TabGroup.Title isReadOnly value="Current Tabs" />
            <TabGroup.GroupAction
              key="cleanup"
              title="close stale tabs"
              onClick={handleCloseStaleTabs}
            >
              <DeleteSweep fontSize="inherit" />
            </TabGroup.GroupAction>
          </TabGroup.Header>

          <TabGroup.Tabs isReadOnly isCollapsed={collapsed} id="current">
            {injectWindowSeparators(tabs, (tab) => (ix) => {
              const uniqueId = `current-${tab.hash}`
              return (
                <CuratedTab
                  isReadOnly
                  isOpen
                  isStale={staleTabs.includes(tab.hash)}
                  key={uniqueId + ix}
                  id={uniqueId}
                  index={ix}
                  title={tab.title}
                  url={tab.url}
                  onCloseTab={handleCloseCurrentTab(tab.hash as string)}
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

export default CurrentTabs
