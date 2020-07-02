import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import TabGroup from './TabGroup'
import CuratedTab from '../tabs/CuratedTab'
import { RootState } from '@src/state/configureStore'
import { ITabGroup } from '@src/types/Extension'
import {
  collapseGroup,
  removeGroup,
  removeTab,
  openTabGroupAlias,
  updateGroup,
  closeTabGroupAlias,
  closeTabsOutsideGroupAlias,
} from '@src/state/tabGroups'
import { closeCurrentTabAlias, openCurrentTabAlias } from '@src/state/currentTabs'
import { MenuItem } from '@material-ui/core'

interface IProps {
  selector: (state: RootState) => ITabGroup
}

function CuratedGroup({ selector }: IProps): React.ReactElement {
  const dispatch = useDispatch()

  const tabHashes = useSelector((state: RootState) => state.currentTabs.tabHashes)

  const { id, name, tabs, collapsed } = useSelector(selector)

  const matchingSuggestions = useSelector((state: RootState) =>
    state.suggestions.find((group) => group.id === id)
  )

  const handleCollapseTabGroup = (sourceGroupId: string) => (): void => {
    dispatch(collapseGroup({ sourceGroupId }))
  }

  const handleRemoveTab = (sourceGroupId: string, sourceTabIndex: any) => (): void => {
    dispatch(removeTab({ sourceGroupId, sourceTabIndex }))
  }

  const handleRemoveTabGroup = (sourceGroupId: string) => (): void => {
    dispatch(removeGroup({ sourceGroupId }))
  }

  const handleOpenTabGroup = (sourceGroupId: string) => (newWindow?: boolean) => () => {
    dispatch(openTabGroupAlias({ tabGroupId: sourceGroupId, newWindow }))
  }

  const handleRenameTabGroup = (sourceGroupId: string) => async (name: string): Promise<void> => {
    dispatch(updateGroup({ sourceGroupId, name }))
  }

  const handleCloseCurrentTab = (tabHash: string) => (): void => {
    dispatch(closeCurrentTabAlias(tabHash))
  }

  const handleOpenCurrentTab = (tabHash: string) => (): void => {
    dispatch(openCurrentTabAlias(tabHash))
  }

  const handleCloseTabGroup = (sourceGroupId: string) => (): void => {
    dispatch(closeTabGroupAlias(sourceGroupId))
  }

  const handleCloseTabsOutsideGroup = (sourceGroupId: string) => (): void => {
    dispatch(closeTabsOutsideGroupAlias(sourceGroupId))
  }

  const contextMenuItems = [
    <MenuItem dense key="openGroup" onClick={handleOpenTabGroup(id)()}>
      Open Tab Group
    </MenuItem>,
    <MenuItem dense key="openGroupInWindow" onClick={handleOpenTabGroup(id)(true)}>
      Open Tab Group in New Window
    </MenuItem>,
    <MenuItem dense key="close" onClick={handleCloseTabGroup(id)}>
      Close Tab Group
    </MenuItem>,
    <MenuItem dense key="closeOutside" onClick={handleCloseTabsOutsideGroup(id)}>
      Close All Except Group
    </MenuItem>,
    <MenuItem dense key="remove" onClick={handleRemoveTabGroup(id)}>
      Remove Tab Group
    </MenuItem>,
  ]

  return (
    <TabGroup contextMenuItems={contextMenuItems}>
      {({ handleOpenContextMenu }) => (
        <>
          <TabGroup.Header onOpenContextMenu={handleOpenContextMenu}>
            <TabGroup.Collapser
              isCollapsed={collapsed}
              numTabs={tabs.length}
              onCollapseGroup={handleCollapseTabGroup(id)}
            />
            <TabGroup.Title value={name} onChangeGroupName={handleRenameTabGroup(id)} />
            <div className="flex flex-row">
              <TabGroup.OpenGroup onOpenTabGroup={handleOpenTabGroup(id)} />
              <TabGroup.CloseGroup onCloseTabGroup={handleCloseTabGroup(id)} />
            </div>
          </TabGroup.Header>

          <TabGroup.Tabs isCollapsed={collapsed} id={id}>
            {tabs.map((tab, ix) => {
              const uniqueId = `${tab.hash}-${id}`
              return (
                <CuratedTab
                  isOpen={(tab.hash && tabHashes && tabHashes.includes(tab.hash)) || false}
                  key={uniqueId}
                  id={uniqueId}
                  index={ix}
                  title={tab.title}
                  url={tab.url}
                  onRemoveTab={handleRemoveTab(id, ix)}
                  onOpenCurrentTab={handleOpenCurrentTab(tab.hash as string)}
                  onCloseTab={handleCloseCurrentTab(tab.hash as string)}
                />
              )
            })}
          </TabGroup.Tabs>

          {matchingSuggestions && (
            <TabGroup.Tabs id={`suggest-${id}`}>
              {matchingSuggestions?.tabs.map((tab, ix) => {
                const uniqueId = `suggest-${tab.hash}-${id}`
                return (
                  <CuratedTab
                    isOpen={(tab.hash && tabHashes && tabHashes.includes(tab.hash)) || false}
                    key={uniqueId}
                    id={uniqueId}
                    index={ix}
                    title={tab.title}
                    url={tab.url}
                    onOpenCurrentTab={handleOpenCurrentTab(tab.hash as string)}
                    onCloseTab={handleCloseCurrentTab(tab.hash as string)}
                  />
                )
              })}
            </TabGroup.Tabs>
          )}
        </>
      )}
    </TabGroup>
  )
}

export default CuratedGroup
