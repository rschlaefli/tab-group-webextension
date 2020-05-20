import React from 'react'
import clsx from 'clsx'
import { Droppable, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd'
import { Save, Delete, Launch, ArrowDropDown, ArrowDropUp, Close } from '@material-ui/icons'

import Input from '../common/Input'
import Tab from './Tab'
import { ITab } from '@src/types/Extension'

interface IProps {
  id: string
  name: string
  tabs: ITab[]
  currentTabs?: string[]
  isReadOnly?: boolean
  isCollapsed?: boolean
  isSuggested?: boolean
  onCollapseGroup?: () => void
  onRemoveTab?: (tabIndex: number) => () => void
  onRemoveTabGroup?: () => void
  onChangeGroupName?: (newName: string) => void
  onOpenTabGroup?: () => void
  onCloseTab?: (tabId: number) => () => void
  onSaveSuggestion?: () => void
  onOpenCurrentTab?: (tabHash: string) => () => void
  onCloseTabGroup?: () => void
}

const getListStyle = (isDraggingOver: boolean): {} => ({
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
  onCollapseGroup,
  onChangeGroupName,
  onOpenTabGroup,
  onRemoveTab,
  onRemoveTabGroup,
  onCloseTab,
  onSaveSuggestion,
  onOpenCurrentTab,
  onCloseTabGroup,
}: IProps): React.ReactElement {
  return (
    <Droppable ignoreContainerClipping droppableId={id} isDropDisabled={isSuggested}>
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot): React.ReactElement => (
        <div
          className={clsx(
            'flex-1 mb-2 border border-solid md:mr-2 md:last:mr-0 md:max-w-xxs md:min-w-xxs dark:border-gray-500',
            isSuggested && ''
          )}
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={getListStyle(snapshot.isDraggingOver)}
        >
          <div className="flex flex-row items-center justify-between px-2 py-1 bg-gray-100 dark:text-gray-900 dark:bg-gray-700">
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
              {isReadOnly ? name : <Input fullWidth value={name} onChange={onChangeGroupName} />}
            </h1>

            <div className="flex flex-row">
              {(!isReadOnly || isSuggested) && (
                <button
                  key="open"
                  className="text-sm text-gray-600 dark:text-gray-400"
                  onClick={onOpenTabGroup}
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
                <button
                  key="remove"
                  className="ml-2 text-sm text-gray-600 dark:text-gray-400"
                  onClick={onRemoveTabGroup}
                  title="remove group"
                >
                  <Delete fontSize="inherit" />
                </button>,
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

          <div className={clsx('min-h-8', tabs.length > 0 && isCollapsed && 'hidden', 'md:block')}>
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
                    isReadOnly={isReadOnly}
                    isOpen={currentTabs && currentTabs.includes(tab.hash)}
                    isSuggested={isSuggested}
                    onRemoveTab={onRemoveTab && onRemoveTab(index)}
                    onCloseTab={onCloseTab && onCloseTab(tab.id as number)}
                    onOpenCurrentTab={onOpenCurrentTab && onOpenCurrentTab(tab.hash)}
                  />
                )
              })}
          </div>

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

export default TabGroup
