import React from 'react'
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd'
import { Close, Remove, Delete } from '@material-ui/icons'
import { Menu, MenuItem, Typography } from '@material-ui/core'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import useContextMenu from '@src/lib/useContextMenu'
import { useDispatch } from 'react-redux'
import { openInNewTabAlias } from '@src/state/tabGroups'

interface IProps {
  uniqueId: string
  index: number
  title?: string
  url?: string
  windowId?: number
  isOpen?: boolean
  isReadOnly?: boolean
  isSuggested?: boolean
  isDragDisabled?: boolean
  faviconUrl?: string
  onRemoveTab?: (() => void) | false
  onCloseTab?: (() => void) | false
  onOpenCurrentTab?: (() => void) | false
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
  contextMenu: {
    maxWidth: 400,
  },
})

function Tab({
  uniqueId,
  index,
  title,
  url,
  isOpen,
  isReadOnly,
  isSuggested,
  isDragDisabled,
  faviconUrl,
  onRemoveTab,
  onCloseTab,
  onOpenCurrentTab,
}: IProps): React.ReactElement {
  const dispatch = useDispatch()
  const styles = useStyles()

  const {
    isContextMenuOpen,
    contextAnchorPosition,
    handleOpenContextMenu,
    handleCloseContextMenu,
  } = useContextMenu()

  const handleOpenTab = (url, newTab = false) => () => {
    if (newTab) {
      dispatch(openInNewTabAlias(url))
    } else {
      if (window.location !== window.parent.location) {
        window.parent.location.replace(url)
      } else {
        window.location.replace(url)
      }
    }
  }

  return (
    <>
      <Draggable
        key={uniqueId}
        draggableId={`draggable-${uniqueId}`}
        index={index}
        isDragDisabled={isDragDisabled}
      >
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot): React.ReactElement => (
          <div
            className={clsx(
              'flex flex-row h-6 items-center justify-start px-2 py-1 text-xs border-b dark:border-gray-700 last:border-0',
              !isReadOnly && isOpen && 'bg-orange-200 dark:bg-gray-700'
            )}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
            onContextMenu={handleOpenContextMenu}
          >
            {!isSuggested && (
              <div className="flex-none w-3 h-3 mr-2">
                <img src={faviconUrl} />
              </div>
            )}

            <div className="flex-auto w-40 leading-tight">
              <Typography noWrap display="block" variant="inherit" title={title}>
                {isOpen && onOpenCurrentTab && (
                  <a role="button" onClick={onOpenCurrentTab as any}>
                    {title}
                  </a>
                )}
                {!isOpen &&
                  (url ? (
                    <a role="button" onClick={handleOpenTab(url)}>
                      {title}
                    </a>
                  ) : (
                    title
                  ))}
              </Typography>
            </div>

            {onCloseTab && (
              <button
                disabled={!isOpen}
                className={clsx(
                  'flex-auto ml-2 text-xs text-right ',
                  isOpen ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'
                )}
                onClick={onCloseTab}
                title="close tab"
              >
                <Close fontSize="inherit" />
              </button>
            )}

            {isSuggested && onRemoveTab && (
              <button
                className="flex-auto ml-2 text-xs text-right text-gray-600 dark:text-gray-400"
                onClick={onRemoveTab}
                title="discard tab"
              >
                <Delete fontSize="inherit" />
              </button>
            )}
          </div>
        )}
      </Draggable>

      <Menu
        onClickCapture={handleCloseContextMenu}
        className={styles.contextMenu}
        open={isContextMenuOpen}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextAnchorPosition}
      >
        {isOpen && onOpenCurrentTab && (
          <MenuItem dense onClick={onOpenCurrentTab}>
            Switch To &quot;
            <Typography noWrap variant="inherit">
              {title}
            </Typography>
            &quot;
          </MenuItem>
        )}

        {!isOpen &&
          (!isReadOnly || isSuggested) &&
          url && [
            <MenuItem dense key="open" onClick={handleOpenTab(url)}>
              Open &quot;
              <Typography noWrap variant="inherit">
                {title}
              </Typography>
              &quot;
            </MenuItem>,
            <MenuItem dense key="openBlank" onClick={handleOpenTab(url, true)}>
              Open &quot;
              <Typography noWrap variant="inherit">
                {title}
              </Typography>
              &quot; in New Tab
            </MenuItem>,
          ]}
        {isOpen && onCloseTab && (
          <MenuItem dense onClick={onCloseTab}>
            Close &quot;
            <Typography noWrap variant="inherit">
              {title}
            </Typography>
            &quot;
          </MenuItem>
        )}

        {!isReadOnly && onRemoveTab && (
          <MenuItem dense onClick={onRemoveTab}>
            Remove &quot;
            <Typography noWrap variant="inherit">
              {title}
            </Typography>
            &quot; From Group
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

export default Tab
