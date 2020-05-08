import React from 'react'
import clsx from 'clsx'
import { Droppable, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd'
import { Save, Delete, Launch, ArrowDropDown, ArrowDropUp } from '@material-ui/icons'
// import { Rating } from '@material-ui/lab'

import Input from '../common/Input'
import Tab from './Tab'
import { ITab } from '@src/types/Extension'

interface IProps {
  id: string
  name: string
  tabs: ITab[]
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
}

const getListStyle = (isDraggingOver: boolean): {} => ({
  backgroundColor: isDraggingOver && '#CFDAFC',
})

function TabGroup({
  id,
  name,
  tabs,
  onCollapseGroup,
  onChangeGroupName,
  onOpenTabGroup,
  onRemoveTab,
  onRemoveTabGroup,
  onCloseTab,
  onSaveSuggestion,
  isReadOnly,
  isCollapsed,
  isSuggested,
}: IProps): React.ReactElement {
  return (
    <Droppable ignoreContainerClipping droppableId={id} isDropDisabled={isSuggested}>
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot): React.ReactElement => (
        <div
          className={clsx(
            'flex-1 mb-1 border border-solid md:mr-1 md:last:mr-0 md:max-w-xs md:min-w-xs',
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

            <h1 className="w-full text-xs font-bold dark:text-gray-100">
              {isSuggested && 'Suggested: '}
              {isReadOnly ? name : <Input fullWidth value={name} onChange={onChangeGroupName} />}
            </h1>

            <div className="flex flex-row">
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
              {!isReadOnly && [
                <button
                  key="open"
                  className="ml-2 mr-2 text-sm text-gray-600 dark:text-gray-400"
                  onClick={onOpenTabGroup}
                  title="open group"
                >
                  <Launch fontSize="inherit" />
                </button>,
                <button
                  key="remove"
                  className="text-sm text-gray-600 dark:text-gray-400"
                  onClick={onRemoveTabGroup}
                  title="remove group"
                >
                  <Delete fontSize="inherit" />
                </button>,
              ]}
            </div>
          </div>

          <div className={clsx('min-h-2', tabs.length > 0 && isCollapsed && 'hidden', 'md:block')}>
            {tabs
              .filter((tab) => typeof tab.id !== 'undefined')
              .map((tab: ITab, index: number) => [
                <Tab
                  key={tab.uuid}
                  uuid={tab.uuid}
                  title={tab.title}
                  index={index}
                  url={tab.url}
                  faviconUrl={tab.favIconUrl}
                  windowId={tab.windowId}
                  isReadOnly={isReadOnly}
                  onRemoveTab={onRemoveTab && onRemoveTab(index)}
                  onCloseTab={onCloseTab && onCloseTab(tab.id as number)}
                />,
              ])}
          </div>

          {provided.placeholder}

          <div>{/* <Rating value={4} size="small" /> */}</div>
        </div>
      )}
    </Droppable>
  )
}

export default TabGroup
