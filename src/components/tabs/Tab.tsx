import React from 'react'
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd'
import { Delete, Close } from '@material-ui/icons'
import { Menu, MenuItem, Typography } from '@material-ui/core'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import useContextMenu from '@src/lib/useContextMenu'

interface IProps {
  uniqueId: string
  index: number
  title?: string
  url?: string
  windowId?: number
  isOpen?: boolean
  isReadOnly?: boolean
  isSuggested?: boolean
  faviconUrl?: string
  onRemoveTab?: (() => void) | false
  onCloseTab?: (() => void) | false
  onOpenCurrentTab?: (() => void) | false
  // onOpenContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  // onCloseContextMenu: () => void
}

const getItemStyle = (
  isDragging: boolean,
  draggableStyle?: DraggingStyle | NotDraggingStyle
): any => ({
  userSelect: 'none',
  border: isDragging && '1px solid lightgrey',
  ...draggableStyle,
})

const useStyles = makeStyles({
  contextMenu: {},
})

function Tab({
  uniqueId,
  index,
  title,
  url,
  isOpen,
  isReadOnly,
  isSuggested,
  faviconUrl,
  onRemoveTab,
  onCloseTab,
  onOpenCurrentTab,
}: IProps): React.ReactElement {
  const styles = useStyles()

  const {
    isContextMenuOpen,
    contextAnchorPosition,
    handleOpenContextMenu,
    handleCloseContextMenu,
  } = useContextMenu()

  const handleOpenTab = (url) => () => {
    if (window.location !== window.parent.location) {
      window.parent.location.replace(url)
    } else {
      window.location.replace(url)
    }
  }

  return (
    <>
      <Draggable key={uniqueId} draggableId={`draggable-${uniqueId}`} index={index}>
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot): React.ReactElement => (
          <div
            className={clsx(
              'flex flex-row items-center justify-start px-2 py-1 text-xs border-b dark:border-gray-700 last:border-0',
              !isReadOnly && isOpen && 'bg-orange-200 dark:bg-gray-700'
            )}
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
                {isOpen && onOpenCurrentTab && (
                  <a role="button" onClick={onOpenCurrentTab as any}>
                    {title}
                  </a>
                )}
                {!isOpen &&
                  ((!isReadOnly || isSuggested) && url ? (
                    <a role="button" onClick={handleOpenTab(url)}>
                      {title}
                    </a>
                  ) : (
                    title
                  ))}
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
        className={styles.contextMenu}
        open={isContextMenuOpen}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextAnchorPosition}
      >
        {onRemoveTab && (
          <MenuItem dense onClick={onRemoveTab}>
            Remove &quot;{title}&quot; From Group
          </MenuItem>
        )}
        {onCloseTab && (
          <MenuItem dense onClick={onCloseTab}>
            Close &quot;{title}&quot;
          </MenuItem>
        )}
        {isOpen && onOpenCurrentTab && (
          <MenuItem dense onClick={onOpenCurrentTab}>
            Switch To &quot;{title}&quot;
          </MenuItem>
        )}
        {!isOpen && (!isReadOnly || isSuggested) && url && (
          <MenuItem dense onClick={handleOpenTab(url)}>
            Open &quot;{title}&quot;
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

export default Tab
