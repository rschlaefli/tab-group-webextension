import React, { useEffect } from 'react'
import { DragDropContext, DropResult, Droppable, DroppableProvided } from 'react-beautiful-dnd'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Input } from '@material-ui/core'
import { Add, Settings } from '@material-ui/icons'

import optionsStorage from '@src/optionsStorage'
import TabGroup from '@src/components/tabs/TabGroup'
import { ITabGroup } from '@src/types/Extension'
import { getBrowserSafe } from '@src/lib/utils'
import Layout from '@src/lib/Layout'
import {
  removeTab,
  moveTab,
  reorderTab,
  removeGroup,
  updateGroup,
  openTabGroup,
  moveCurrentTab,
  collapseGroup,
} from '@src/state/tabGroups'
import { collapseCurrentTabs, closeCurrentTab } from '@src/state/currentTabs'

const extractDragEventProperties = (dragEvent: DropResult): any => ({
  sourceGroupId: dragEvent.source.droppableId,
  targetGroupId: dragEvent?.destination?.droppableId,
  sourceTabIndex: dragEvent.source.index,
  targetTabIndex: dragEvent?.destination?.index,
})

function UI(): React.ReactElement {
  const dispatch = useDispatch()
  const currentTabs = useSelector((state: any) => state.currentTabs)
  const tabGroups = useSelector((state: any) => state.tabGroups)
  const suggestions = useSelector((state: any) => state.suggestions)

  useEffect(() => {
    const init = async (): Promise<void> => {
      // initialize options data
      const result = await optionsStorage.getAll()
      console.log(result)
    }
    init()
  }, [dispatch])

  const handleDragEnd = async (dragEvent: DropResult): Promise<any> => {
    console.log(dragEvent)

    const properties = extractDragEventProperties(dragEvent)

    // if the destination is empty, return
    if (!properties.targetGroupId) return

    // if we are reordering within a droppable
    if (properties.sourceGroupId === properties.targetGroupId) {
      // do not allow reordering in current tabs
      if (properties.sourceGroupId === 'current') return

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

  const handleOpenOptions = async (): Promise<void> => {
    const browser = await getBrowserSafe()
    browser.runtime.openOptionsPage()
  }

  const handleOpenTabGroup = (sourceGroupId: string) => async (): Promise<void> => {
    dispatch(openTabGroup(sourceGroupId))
  }

  const handleRenameTabGroup = (sourceGroupId: string) => (name: string): void => {
    dispatch(updateGroup({ sourceGroupId, name }))
  }

  const handleCollapseTabGroup = (sourceGroupId: string) => (): void => {
    dispatch(collapseGroup({ sourceGroupId }))
  }

  const handleCollapseCurrentTabs = (): void => {
    dispatch(collapseCurrentTabs())
  }

  const handleCloseCurrentTab = (tabId: number) => (): void => {
    dispatch(closeCurrentTab(tabId))
  }

  if (!tabGroups) {
    return <div>Loading</div>
  }

  return (
    <Layout>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="w-full h-auto p-1 min-h-64 min-w-64">
          <div className="pb-1 dark:text-gray-100">
            <Input
              fullWidth
              disabled
              placeholder="Search..."
              value=""
              onChange={(): void => undefined}
            />
          </div>

          <div className="flex flex-col md:flex-wrap md:flex-row">
            <TabGroup
              isReadOnly
              id="current"
              name="Current Tabs"
              tabs={currentTabs.tabs}
              isCollapsed={currentTabs.collapsed}
              onCollapseGroup={handleCollapseCurrentTabs}
              onCloseTab={handleCloseCurrentTab}
            />

            {tabGroups.map((tabGroup: ITabGroup) => (
              <TabGroup
                // TODO: pass down current tabs and mark tabs that are open
                // TODO: disable window display for tabs that are not open
                key={tabGroup.id}
                id={tabGroup.id}
                name={tabGroup.name}
                tabs={tabGroup.tabs}
                isCollapsed={tabGroup.collapsed}
                isReadOnly={tabGroup.readOnly}
                onCollapseGroup={handleCollapseTabGroup(tabGroup.id)}
                onRemoveTab={handleRemoveTab(tabGroup.id)}
                onRemoveTabGroup={handleRemoveTabGroup(tabGroup.id)}
                onOpenTabGroup={handleOpenTabGroup(tabGroup.id)}
                onChangeGroupName={handleRenameTabGroup(tabGroup.id)}
              />
            ))}

            <Droppable ignoreContainerClipping droppableId="newGroup">
              {(provided: DroppableProvided): React.ReactElement => (
                <Button
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  fullWidth
                  className="min-h-8 md:min-w-xs md:max-w-xs"
                  onClick={handleAddTabGroup}
                  title="add group"
                >
                  <Add />
                </Button>
              )}
            </Droppable>
          </div>

          <div className="flex flex-col md:flex-wrap md:flex-row">
            {suggestions.map((tabGroup: ITabGroup) => (
              <TabGroup
                // TODO: pass down current tabs and mark tabs that are open
                // TODO: disable window display for tabs that are not open
                key={tabGroup.id}
                id={tabGroup.id}
                name={tabGroup.name}
                tabs={tabGroup.tabs}
                isCollapsed={tabGroup.collapsed}
                isReadOnly={tabGroup.readOnly}
                onCollapseGroup={handleCollapseTabGroup(tabGroup.id)}
                onRemoveTab={handleRemoveTab(tabGroup.id)}
                onRemoveTabGroup={handleRemoveTabGroup(tabGroup.id)}
                onOpenTabGroup={handleOpenTabGroup(tabGroup.id)}
                onChangeGroupName={handleRenameTabGroup(tabGroup.id)}
              />
            ))}
          </div>

          <div className="flex flex-row justify-end">
            <button
              className="text-lg text-gray-600 dark:text-gray-100"
              onClick={handleOpenOptions}
              title="open settings"
            >
              <Settings fontSize="inherit" />
            </button>
          </div>
        </div>
      </DragDropContext>
    </Layout>
  )
}

export default UI
