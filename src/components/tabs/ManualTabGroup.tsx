import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import TabGroup from './TabGroup'
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

interface IProps {
  selector: (state: RootState) => ITabGroup
}

function ManualTabGroup({ selector }: IProps): React.ReactElement {
  const dispatch = useDispatch()

  const tabHashes = useSelector((state: RootState) => state.currentTabs.tabHashes)

  const { id, name, tabs, collapsed, readOnly } = useSelector(selector)

  const handleCollapseTabGroup = (sourceGroupId: string) => (): void => {
    dispatch(collapseGroup({ sourceGroupId }))
  }

  const handleRemoveTab = (sourceGroupId: string) => (sourceTabIndex: number) => (): void => {
    dispatch(removeTab({ sourceGroupId, sourceTabIndex }))
  }

  const handleRemoveTabGroup = (sourceGroupId: string) => (): void => {
    dispatch(removeGroup({ sourceGroupId }))
  }

  const handleOpenTabGroup = (sourceGroupId: string) => async (): Promise<void> => {
    dispatch(openTabGroupAlias({ tabGroupId: sourceGroupId, newWindow: true }))
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

  return (
    <TabGroup
      id={id}
      name={name}
      tabs={tabs}
      currentTabs={tabHashes}
      isCollapsed={collapsed}
      isReadOnly={readOnly}
      onCollapseGroup={handleCollapseTabGroup(id)}
      onRemoveTab={handleRemoveTab(id)}
      onRemoveTabGroup={handleRemoveTabGroup(id)}
      onOpenTabGroup={handleOpenTabGroup(id)}
      onChangeGroupName={handleRenameTabGroup(id)}
      onOpenCurrentTab={handleOpenCurrentTab}
      onCloseTab={handleCloseCurrentTab}
      onCloseTabGroup={handleCloseTabGroup(id)}
      onCloseTabsOutsideGroup={handleCloseTabsOutsideGroup(id)}
    />
  )
}

export default ManualTabGroup
