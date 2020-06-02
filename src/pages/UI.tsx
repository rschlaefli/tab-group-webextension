import React from 'react'
import { DragDropContext, DropResult, Droppable, DroppableProvided } from 'react-beautiful-dnd'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Switch, Typography, FormControlLabel, Tooltip } from '@material-ui/core'
import { Add, Settings, InfoRounded } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'

import TabGroup from '@src/components/tabs/TabGroup'
import { ITabGroup } from '@src/types/Extension'
import Layout from '@src/components/common/Layout'
import {
  removeTab,
  moveTab,
  reorderTab,
  removeGroup,
  updateGroup,
  moveCurrentTab,
  collapseGroup,
  openTabGroupAlias,
  closeTabGroupAlias,
  closeTabsOutsideGroupAlias,
} from '@src/state/tabGroups'
import {
  collapseCurrentTabs,
  closeCurrentTabAlias,
  openCurrentTabAlias,
  collapseRecentTabs,
} from '@src/state/currentTabs'
import { RootState } from '@src/state/configureStore'
import { toggleFocusMode, openOptionsPageAlias } from '@src/state/settings'
import clsx from 'clsx'

const extractDragEventProperties = (dragEvent: DropResult): any => ({
  sourceGroupId: dragEvent.source.droppableId,
  targetGroupId: dragEvent?.destination?.droppableId,
  sourceTabIndex: dragEvent.source.index,
  targetTabIndex: dragEvent?.destination?.index,
})

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.type === 'dark' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    marginBottom: '0.5rem',
    '&:hover': {
      background: theme.palette.type === 'dark' ? 'rgba(0, 0, 0, 0.01)' : 'rgba(0, 0, 0, 0.01)',
    },
  },
}))

function UI(): React.ReactElement {
  const styles = useStyles()

  const dispatch = useDispatch()

  const currentTabs = useSelector((state: RootState) => state.currentTabs)
  const tabGroups = useSelector((state: RootState) => state.tabGroups)
  const suggestions = useSelector((state: RootState) => state.suggestions)
  const focusModeEnabled = useSelector((state: RootState) => state.settings.isFocusModeEnabled)
  const heuristicsEnabled = useSelector(
    (state: RootState) => state.settings.isHeuristicsBackendEnabled
  )

  const handleDragEnd = async (dragEvent: DropResult): Promise<any> => {
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
    dispatch(openOptionsPageAlias())
  }

  const handleOpenTabGroup = (sourceGroupId: string) => async (): Promise<void> => {
    dispatch(openTabGroupAlias(sourceGroupId))
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

  const handleCollapseRecentTabs = (): void => {
    dispatch(collapseRecentTabs())
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

  const handleToggleFocusMode = async (): Promise<void> => {
    dispatch(toggleFocusMode())
  }

  if (!tabGroups) {
    return <div>Loading</div>
  }

  return (
    <Layout>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="w-full h-auto p-2 min-h-64 min-w-64">
          <div className="flex flex-row justify-between pb-2 dark:text-gray-100">
            <span>
              <FormControlLabel
                control={
                  <Switch
                    checked={focusModeEnabled}
                    onChange={handleToggleFocusMode}
                    name="focusModeEnabled"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                  />
                }
                label="Focus Mode"
              />
              <Tooltip
                title="Focus Mode: On opening of a tab group, close all tabs belonging to other groups"
                aria-label="Focus Mode: On opening of a tab group, close all tabs belonging to other groups"
              >
                <InfoRounded className="text-blue-400" fontSize="inherit" />
              </Tooltip>
            </span>
            <button
              className="text-lg text-gray-600 dark:text-gray-100"
              onClick={handleOpenOptions}
              title="open settings"
            >
              <Settings fontSize="small" />
            </button>
          </div>

          <div className="flex flex-col md:flex-wrap md:flex-row">
            <TabGroup
              isReadOnly
              isDragDisabled
              isDropDisabled
              id="recent"
              name="Recent Tabs"
              tabs={currentTabs.recentTabs}
              currentTabs={currentTabs.tabHashes}
              isCollapsed={currentTabs.recentTabsCollapsed}
              onCollapseGroup={handleCollapseRecentTabs}
              onOpenCurrentTab={handleOpenCurrentTab}
            />

            <TabGroup
              isReadOnly
              isDropDisabled
              id="current"
              name="Current Tabs"
              tabs={currentTabs.tabs}
              currentTabs={currentTabs.tabHashes}
              isCollapsed={currentTabs.collapsed}
              onCollapseGroup={handleCollapseCurrentTabs}
              onCloseTab={handleCloseCurrentTab}
              onOpenCurrentTab={handleOpenCurrentTab}
            />

            {tabGroups.map((tabGroup: ITabGroup) => (
              <TabGroup
                key={tabGroup.id}
                id={tabGroup.id}
                name={tabGroup.name}
                tabs={tabGroup.tabs}
                currentTabs={currentTabs.tabHashes}
                isCollapsed={tabGroup.collapsed}
                isReadOnly={tabGroup.readOnly}
                onCollapseGroup={handleCollapseTabGroup(tabGroup.id)}
                onRemoveTab={handleRemoveTab(tabGroup.id)}
                onRemoveTabGroup={handleRemoveTabGroup(tabGroup.id)}
                onOpenTabGroup={handleOpenTabGroup(tabGroup.id)}
                onChangeGroupName={handleRenameTabGroup(tabGroup.id)}
                onOpenCurrentTab={handleOpenCurrentTab}
                onCloseTab={handleCloseCurrentTab}
                onCloseTabGroup={handleCloseTabGroup(tabGroup.id)}
                onCloseTabsOutsideGroup={handleCloseTabsOutsideGroup(tabGroup.id)}
              />
            ))}

            <Droppable ignoreContainerClipping droppableId="newGroup">
              {(provided: DroppableProvided): React.ReactElement => (
                <Button
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={clsx(styles.root, 'w-full min-h-8 md:w-56')}
                  onClick={handleAddTabGroup}
                  title="add group"
                >
                  <Add />
                </Button>
              )}
            </Droppable>
          </div>

          {heuristicsEnabled && (
            <div>
              <Typography variant="body1">Suggestions</Typography>
              <div className="flex flex-col md:flex-wrap md:flex-row">
                {suggestions.length === 0 && (
                  <Typography variant="body2">Collecting more data...</Typography>
                )}
                {suggestions.map((tabGroup: ITabGroup) => (
                  <TabGroup
                    // TODO: pass down current tabs and mark tabs that are open
                    // TODO: disable window display for tabs that are not open
                    isSuggested
                    isDropDisabled
                    isDragDisabled
                    isReadOnly
                    key={tabGroup.id}
                    id={tabGroup.id}
                    name={tabGroup.name}
                    tabs={tabGroup.tabs}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DragDropContext>
    </Layout>
  )
}

export default UI
