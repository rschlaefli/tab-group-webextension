import React, { useState } from 'react'
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd'
import { Delete, Close } from '@material-ui/icons'
import { Menu, MenuItem, Typography } from '@material-ui/core'

interface IProps {
  index: number
  uuid: string
  title?: string
  url?: string
  windowId?: number
  isReadOnly?: boolean
  isSuggested?: boolean
  faviconUrl?: string
  onRemoveTab?: (() => void) | false
  onCloseTab?: (() => void) | false
  // onOpenContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  // onCloseContextMenu: () => void
}

interface IMousePosition {
  mouseX: null | number
  mouseY: null | number
}

const getItemStyle = (
  isDragging: boolean,
  draggableStyle?: DraggingStyle | NotDraggingStyle
): {} => ({
  userSelect: 'none',
  border: isDragging && '1px solid lightgrey',
  ...draggableStyle,
})

const initialMousePosition = {
  mouseX: null,
  mouseY: null,
}

function Tab({
  index,
  uuid,
  title,
  url,
  isReadOnly,
  isSuggested,
  faviconUrl,
  onRemoveTab,
  onCloseTab,
}: IProps): React.ReactElement {
  const [mousePosition, setMousePosition] = useState<IMousePosition>(initialMousePosition)

  const handleOpenContextMenu = (event: React.MouseEvent<HTMLDivElement>): void => {
    event.preventDefault()
    setMousePosition({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    })
  }

  const handleCloseContextMenu = (): void => {
    setMousePosition(initialMousePosition)
  }

  return (
    <>
      <Draggable key={uuid} draggableId={`draggable-${uuid}`} index={index}>
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot): React.ReactElement => (
          <div
            className="flex flex-row items-center justify-start px-2 py-1 text-xs border-b dark:border-gray-700 last:border-0"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
            onContextMenu={handleOpenContextMenu}
          >
            {!isSuggested && (
              <div className="flex-initial w-4 h-4 mr-2">
                <img src={faviconUrl} />
              </div>
            )}

            <div className="flex-1 leading-tight max-w-5/6">
              <Typography noWrap display="block" variant="inherit" title={title}>
                {(!isReadOnly || isSuggested) && url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {title}
                  </a>
                ) : (
                  title
                )}
              </Typography>
            </div>

            {onRemoveTab && !isReadOnly && (
              <button
                className="flex-auto ml-2 text-sm text-right text-gray-600 dark:text-gray-400"
                onClick={onRemoveTab}
                title="remove tab"
              >
                <Delete fontSize="inherit" />
              </button>
            )}

            {onCloseTab && (
              <button
                className="flex-auto ml-2 text-sm text-right text-gray-600 dark:text-gray-400"
                onClick={onCloseTab}
                title="close tab"
              >
                <Close fontSize="inherit" />
              </button>
            )}
          </div>
        )}
      </Draggable>
      <Menu
        keepMounted
        open={mousePosition.mouseY !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          mousePosition.mouseY !== null && mousePosition.mouseX !== null
            ? { top: mousePosition.mouseY, left: mousePosition.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleCloseContextMenu}>Do something</MenuItem>
      </Menu>
    </>
  )
}

export default Tab
