/* eslint-disable react/prop-types */
import React from 'react'
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd'

import useContextMenu from '@src/lib/useContextMenu'
import { makeStyles } from '@material-ui/core/styles'
import { Menu, Typography } from '@material-ui/core'
import clsx from 'clsx'
import { Close, Delete } from '@material-ui/icons'

interface IChildrenParams {
  handleOpenContextMenu: () => void
  provided: DraggableProvided
  snapshot: DraggableStateSnapshot
}

interface IProps {
  children: (params: IChildrenParams) => React.ReactElement
  contextMenuItems?: any[]
  draggableId: string
  draggableIndex: number
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
  contextMenu: { maxWidth: 400 },
})

function Tab({
  children,
  draggableId,
  draggableIndex,
  contextMenuItems,
}: IProps): React.ReactElement {
  const styles = useStyles()

  const {
    isContextMenuOpen,
    handleOpenContextMenu,
    handleCloseContextMenu,
    contextAnchorPosition,
  } = useContextMenu()

  return (
    <>
      <Draggable
        key={draggableId}
        draggableId={draggableId}
        index={draggableIndex}
        isDragDisabled={!draggableId}
      >
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot): React.ReactElement =>
          children({ handleOpenContextMenu, provided, snapshot })
        }
      </Draggable>

      {typeof contextMenuItems !== 'undefined' && (
        <Menu
          onClickCapture={handleCloseContextMenu}
          className={styles.contextMenu}
          open={isContextMenuOpen}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={contextAnchorPosition}
        >
          {contextMenuItems.flat().filter((item) => !!item)}
        </Menu>
      )}
    </>
  )
}

interface IContainerProps {
  isReadOnly?: boolean
  isOpen?: boolean
  provided: DraggableProvided
  snapshot: DraggableStateSnapshot
  onOpenContextMenu: () => void
  children: React.ReactNode
}
Tab.Container = function Container({
  isReadOnly,
  isOpen,
  provided,
  snapshot,
  onOpenContextMenu,
  children,
}: IContainerProps): React.ReactElement {
  return (
    <div
      className={clsx(
        'h-6 flex flex-row items-center justify-start px-2 py-1 text-xs leading-3 border-b dark:border-gray-700 last:border-0',
        !isReadOnly && isOpen && 'bg-orange-200 dark:bg-gray-700'
      )}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
      onContextMenu={onOpenContextMenu}
    >
      {children}
    </div>
  )
}

interface IFavIconProps {
  favIconUrl?: string
}
Tab.FavIcon = function FavIcon({ favIconUrl }: IFavIconProps): React.ReactElement {
  return (
    <div className="flex-none w-3 h-3 mr-2">
      <img src={favIconUrl} />
    </div>
  )
}

interface ITitleProps {
  title: string
  url?: string
  isOpen?: boolean
  onOpenCurrentTab?: () => void
  onOpenTab: (url: string, newTab?: boolean) => () => void
}
Tab.Title = function Title({
  title,
  url,
  isOpen,
  onOpenCurrentTab,
  onOpenTab,
}: ITitleProps): React.ReactElement {
  return (
    <div className="flex-auto w-40 leading-tight">
      <Typography noWrap display="block" variant="inherit" title={title}>
        {isOpen && (
          <a role="button" onClick={onOpenCurrentTab}>
            {title}
          </a>
        )}
        {!isOpen &&
          (url ? (
            <a role="button" onClick={onOpenTab(url)}>
              {title}
            </a>
          ) : (
            title
          ))}
      </Typography>
    </div>
  )
}

interface ICloseButtonProps {
  isOpen?: boolean
  onCloseTab: () => void
}
Tab.Close = function CloseButton({ isOpen, onCloseTab }: ICloseButtonProps) {
  return (
    <button
      disabled={!isOpen}
      className={clsx(
        'flex-auto ml-2 text-right ',
        isOpen ? 'tab-icon' : 'text-xs text-gray-300 dark:text-gray-700'
      )}
      onClick={onCloseTab}
      title="close tab"
    >
      <Close fontSize="inherit" />
    </button>
  )
}

interface IDiscardButtonProps {
  onDiscardTab: () => void
}
Tab.Discard = function DiscardButton({ onDiscardTab }: IDiscardButtonProps) {
  return (
    <button
      className="flex-auto ml-2 text-right tab-icon"
      onClick={onDiscardTab}
      title="discard tab"
    >
      <Delete fontSize="inherit" />
    </button>
  )
}

export default Tab
