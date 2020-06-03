import React from 'react'
import clsx from 'clsx'
import { Droppable, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd'
import { Save, Delete, Launch, ArrowDropDown, ArrowDropUp, Close } from '@material-ui/icons'

import Input from '../common/Input'
import Tab from './Tab'
import { ITab } from '@src/types/Extension'
import useContextMenu from '@src/lib/useContextMenu'
import { Menu, MenuItem } from '@material-ui/core'

interface IProps {
  id: string
  name: string
  tabs: ITab[]
  currentTabs?: (string | null)[]
  isReadOnly?: boolean
  isCollapsed?: boolean
  isSuggested?: boolean
  isDropDisabled?: boolean
  isDragDisabled?: boolean
  onCollapseGroup?: () => void
  onRemoveTab?: (tabIndex: number) => () => void
  onRemoveTabGroup?: () => void
  onChangeGroupName?: (newName: string) => void
  onOpenTabGroup?: (newWindow?: boolean) => () => void
  onCloseTab?: (tabHash: string) => () => void
  onSaveSuggestion?: () => void
  onOpenCurrentTab?: (tabHash: string) => () => void
  onCloseTabGroup?: () => void
  onCloseTabsOutsideGroup?: () => void
}

const getListStyle = (isDraggingOver: boolean): any => ({
  backgroundColor: isDraggingOver && '#CFDAFC',
})

function TabGroup({
  id,
  name,
  tabs,
  currentTabs,
  isReadOnly,
  isCollapsed,
  isSuggested,
  isDropDisabled,
  isDragDisabled,
  onCollapseGroup,
  onChangeGroupName,
  onOpenTabGroup,
  onRemoveTab,
  onRemoveTabGroup,
  onCloseTab,
  onSaveSuggestion,
  onOpenCurrentTab,
  onCloseTabGroup,
  onCloseTabsOutsideGroup,
}: IProps): React.ReactElement {
  const {
    isContextMenuOpen,
    contextAnchorPosition,
    handleOpenContextMenu,
    handleCloseContextMenu,
  } = useContextMenu()

  return (
    <>
      <Droppable
        ignoreContainerClipping
        droppableId={id}
        isDropDisabled={isSuggested || isDropDisabled}
      >
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot): React.ReactElement => (
          <div
            className={clsx(
              'flex-initial mb-2 border border-solid md:mr-2 md:last:mr-0 md:w-56 dark:border-gray-500',
              isSuggested && ''
            )}
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            <div
              className="flex flex-row items-center justify-between h-6 px-2 py-1 bg-gray-100 dark:text-gray-900 dark:bg-gray-700"
              onContextMenu={handleOpenContextMenu}
            >
              <button
                className={clsx(
                  'mr-2 text-sm md:hidden text-gray-600 dark:text-gray-400',
                  tabs.length === 0 && 'text-gray-400 dark:text-gray-600 cursor-default',
                  isSuggested && 'hidden'
                )}
                disabled={tabs.length === 0}
                onClick={onCollapseGroup}
              >
                {isCollapsed ? (
                  <ArrowDropDown fontSize="inherit" />
                ) : (
                  <ArrowDropUp fontSize="inherit" />
                )}
              </button>

              <h1 className="w-full mr-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                {isReadOnly ? (
                  `${name} (${tabs.length})`
                ) : (
                  <Input fullWidth value={name} onChange={onChangeGroupName} />
                )}
              </h1>

              <div className="flex flex-row">
                {(!isReadOnly || isSuggested) && (
                  <button
                    key="open"
                    className="text-sm text-gray-600 dark:text-gray-400"
                    onClick={onOpenTabGroup && onOpenTabGroup()}
                    title="open group"
                  >
                    <Launch fontSize="inherit" />
                  </button>
                )}

                {!isReadOnly && [
                  <button
                    key="close"
                    className="ml-2 text-sm text-gray-600 dark:text-gray-400"
                    onClick={onCloseTabGroup}
                    title="close group"
                  >
                    <Close fontSize="inherit" />
                  </button>,
                  // <button
                  //   key="remove"
                  //   className="ml-2 text-sm text-gray-600 dark:text-gray-400"
                  //   onClick={onRemoveTabGroup}
                  //   title="remove group"
                  // >
                  //   <Delete fontSize="inherit" />
                  // </button>,
                ]}

                {isSuggested && [
                  <button
                    disabled
                    key="discard"
                    className="ml-2 mr-2 text-sm text-gray-400 dark:text-gray-600"
                    onClick={() => null}
                    title="discard suggestion"
                  >
                    <Delete fontSize="inherit" />
                  </button>,
                  <button
                    key="save"
                    className="text-sm text-gray-600 dark:text-gray-400"
                    onClick={onSaveSuggestion}
                    title="save suggestion"
                  >
                    <Save fontSize="inherit" />
                  </button>,
                ]}
              </div>
            </div>

            <div
              className={clsx('min-h-8', tabs.length > 0 && isCollapsed && 'hidden', 'md:block')}
            >
              {tabs
                .filter((tab) => typeof tab.id !== 'undefined')
                .map((tab: ITab, index: number) => {
                  const uniqueId = `${tab.id}-${tab.hash}-${id}`
                  return (
                    <Tab
                      uniqueId={uniqueId}
                      key={uniqueId}
                      title={tab.title}
                      index={index}
                      url={tab.url}
                      faviconUrl={tab.favIconUrl}
                      windowId={tab.windowId}
                      isDragDisabled={isDragDisabled}
                      isReadOnly={isReadOnly}
                      isOpen={!!tab.hash && currentTabs && currentTabs.includes(tab.hash)}
                      isSuggested={isSuggested}
                      onRemoveTab={onRemoveTab && onRemoveTab(index)}
                      onCloseTab={!!tab.hash && onCloseTab && onCloseTab(tab.hash)}
                      onOpenCurrentTab={
                        !!tab.hash && onOpenCurrentTab && onOpenCurrentTab(tab.hash)
                      }
                    />
                  )
                })}
            </div>

            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Menu
        onClickCapture={handleCloseContextMenu}
        open={isContextMenuOpen}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextAnchorPosition}
      >
        {(!isReadOnly || isSuggested) && [
          <MenuItem dense key="openGroup" onClick={onOpenTabGroup && onOpenTabGroup()}>
            Open Tab Group
          </MenuItem>,
          <MenuItem dense key="openGroupInWindow" onClick={onOpenTabGroup && onOpenTabGroup(true)}>
            Open Tab Group in New Window
          </MenuItem>,
        ]}

        {!isReadOnly && [
          <MenuItem dense key="close" onClick={onCloseTabGroup}>
            Close Tab Group
          </MenuItem>,
          <MenuItem dense key="closeOutside" onClick={onCloseTabsOutsideGroup}>
            Close All Except Group
          </MenuItem>,
          <MenuItem dense key="remove" onClick={onRemoveTabGroup}>
            Remove Tab Group
          </MenuItem>,
        ]}
      </Menu>
    </>
  )
}

export default TabGroup
