import React from 'react'
import { Droppable, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd'
import { Delete, Launch } from '@material-ui/icons'

import Tab from './Tab'
import { ITab } from '@src/types/Extension'

interface IProps {
  id: string
  name: string
  tabs: ITab[]
  isReadOnly?: boolean
  onRemoveTab?: (tabIndex: number) => () => void
  onRemoveTabGroup?: () => void
  onChangeGroupName?: (newName: string) => void
  onOpenTabGroup?: () => void
}

const getListStyle = (isDraggingOver: boolean): {} => ({
  backgroundColor: isDraggingOver && '#CFDAFC',
})

function TabGroup({
  id,
  name,
  tabs,
  onChangeGroupName,
  onOpenTabGroup,
  onRemoveTab,
  onRemoveTabGroup,
  isReadOnly,
}: IProps): React.ReactElement {
  return (
    <Droppable ignoreContainerClipping droppableId={id}>
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot): React.ReactElement => (
        <div
          className="flex-1 mb-1 border border-solid min-h-32 md:mr-2 md:last:mr-0 md:max-w-xs"
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={getListStyle(snapshot.isDraggingOver)}
        >
          <h1 className="flex flex-row justify-between p-1 bg-gray-300 dark:bg-gray-100 dark:text-gray-900">
            <div className="text-sm font-bold">
              {isReadOnly ? (
                name
              ) : (
                <input
                  className="pl-1 text-sm font-bold border-b"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    onChangeGroupName && onChangeGroupName(e.target.value)
                  }
                />
              )}
            </div>

            {!isReadOnly && (
              <div className="flex flex-row">
                <button className="mr-3" onClick={onOpenTabGroup}>
                  <Launch fontSize="inherit" />
                </button>

                <button className="mr-1" onClick={onRemoveTabGroup}>
                  <Delete fontSize="inherit" />
                </button>
              </div>
            )}
          </h1>

          <div>
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
                />,
              ])}
          </div>

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

export default TabGroup
