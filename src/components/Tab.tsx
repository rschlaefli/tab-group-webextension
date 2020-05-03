import React from 'react'
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

const getItemStyle = (
  isDragging: boolean,
  draggableStyle?: DraggingStyle | NotDraggingStyle
): {} => ({
  userSelect: 'none',
  border: isDragging && '1px solid lightgrey',
  ...draggableStyle,
})

interface IProps {
  index: number
  uuid: string
  title?: string
  url?: string
  windowId?: number
  isReadOnly?: boolean
  faviconUrl?: string
  onRemoveTab?: (() => void) | false
}

function Tab({
  index,
  uuid,
  title,
  url,
  isReadOnly,
  windowId,
  faviconUrl,
  onRemoveTab,
}: IProps): React.ReactElement {
  return (
    <Draggable key={uuid} draggableId={`draggable-${uuid}`} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot): React.ReactElement => (
        <div
          className="flex flex-row items-center justify-between p-1 text-xs border-b dark:border-gray-700 last:border-0"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
        >
          <div className="w-4 ml-1 mr-2">
            <img src={faviconUrl} />
          </div>

          <div className="flex-1">
            {!isReadOnly && url ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {title}
              </a>
            ) : (
              title
            )}
            {windowId && ` (${windowId})`}
          </div>

          {onRemoveTab && !isReadOnly && (
            <button className="p-1" onClick={onRemoveTab}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      )}
    </Draggable>
  )
}

export default Tab
