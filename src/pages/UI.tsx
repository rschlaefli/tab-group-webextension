import React, { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { useSelector, useDispatch } from 'react-redux'

import optionsStorage from '@src/optionsStorage'
import TabGroup from '@src/components/TabGroup'
import Button from '@src/components/Button'
import { ITabGroup } from '@src/types/Extension'
import { getBrowserSafe } from '@src/lib/utils'
import {
  removeTab,
  moveTab,
  reorderTab,
  removeGroup,
  updateGroup,
  openTabGroup,
  moveCurrentTab
} from '@src/state/tabGroups'
import { initializeCurrentTabs } from '@src/state/currentTabs'

const extractDragEventProperties = (dragEvent: DropResult): any => ({
  sourceGroupId: dragEvent.source.droppableId,
  targetGroupId: dragEvent?.destination?.droppableId,
  sourceTabIndex: dragEvent.source.index,
  targetTabIndex: dragEvent?.destination?.index
})

function UI(): React.ReactElement {
  const dispatch = useDispatch()
  const currentTabs = useSelector((state: any) => state.currentTabs)
  const tabGroups = useSelector((state: any) => state.tabGroups)

  const [number, setNumber] = useState(-1)

  useEffect(() => {
    const init = async (): Promise<void> => {
      // initialize current tabs
      await dispatch(initializeCurrentTabs())

      // initialize options data
      const result = await optionsStorage.getAll()
      if (result.number) setNumber(result.number)
    }
    init()
  }, [dispatch])

  const handleDragEnd = (dragEvent: DropResult): any => {
    const properties = extractDragEventProperties(dragEvent)

    // if the destination is empty, return
    if (!properties.targetGroupId) return

    // if we are reordering within a droppable
    if (properties.sourceGroupId === properties.targetGroupId) {
      // if we are reordering to the same position,, return
      if (properties.sourceTabIndex === properties.targetGroupIndex) return

      return dispatch(reorderTab(properties))
    }

    if (properties.sourceGroupId === 'current') {
      const currentTab = currentTabs.tabs[properties.sourceTabIndex]
      return dispatch(moveCurrentTab({ ...properties, currentTab }))
    }

    // if we are moving between groups
    return dispatch(moveTab(properties))
  }

  const handleRemoveTab = (sourceGroupId: string) => (sourceTabIndex: number) => (): void => {
    dispatch(removeTab({ sourceGroupId, sourceTabIndex }))
  }

  const handleRemoveTabGroup = (sourceGroupId: string) => (): void => {
    dispatch(removeGroup({ sourceGroupId }))
  }

  const handleAddTabGroup = (): void => {
    dispatch(updateGroup({}))
  }

  const handleReloadExtension = async (): Promise<void> => {
    const browser = await getBrowserSafe()
    browser.runtime.reload()
  }

  const handleSendMessage = async (): Promise<void> => {
    const browser = await getBrowserSafe()
    browser.runtime.sendMessage({ type: 'SIDEBAR' })
  }

  const handleOpenTabGroup = (sourceGroupId: string) => async (): Promise<void> => {
    dispatch(openTabGroup(sourceGroupId))
  }

  const handleRenameTabGroup = (sourceGroupId: string) => (name: string): void => {
    dispatch(updateGroup({ sourceGroupId, name }))
  }

  if (!tabGroups) {
    return <div>Loading</div>
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="w-full h-auto p-1 min-h-64 min-w-64">
        <div className="flex flex-col md:flex-wrap md:flex-row">
          <TabGroup isReadOnly id="current" name="Current Tabs" tabs={currentTabs.tabs} />
          {tabGroups.map((tabGroup: ITabGroup) => (
            <TabGroup
              // TODO: pass down current tabs and mark tabs that are open
              // TODO: disable window display for tabs that are not open
              key={tabGroup.id}
              id={tabGroup.id}
              name={tabGroup.name}
              tabs={tabGroup.tabs}
              isReadOnly={tabGroup.readOnly}
              onRemoveTab={handleRemoveTab(tabGroup.id)}
              onRemoveTabGroup={handleRemoveTabGroup(tabGroup.id)}
              onOpenTabGroup={handleOpenTabGroup(tabGroup.id)}
              onChangeGroupName={handleRenameTabGroup(tabGroup.id)}
            />
          ))}
        </div>

        <div>hello from synced settings: {number}</div>

        <div className="flex flex-row">
          <Button onClick={handleAddTabGroup}>New Group</Button>
          <Button onClick={handleReloadExtension}>Reload Ext.</Button>
          <Button onClick={handleSendMessage}>Sidebar</Button>
        </div>
      </div>
    </DragDropContext>
  )
}

export default UI
