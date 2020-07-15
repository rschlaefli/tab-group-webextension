import React from 'react'
import clsx from 'clsx'
import useContextMenu from '@src/lib/useContextMenu'
import { Menu, Input } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ArrowDropDown, ArrowDropUp, Launch, Close, Delete, Save } from '@material-ui/icons'
import { Droppable, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd'

interface IChildrenParams {
  handleOpenContextMenu: () => void
}

interface IProps {
  children: (params: IChildrenParams) => React.ReactElement
  contextMenuItems?: any[]
}

const useStyles = makeStyles((theme) => ({
  contextMenu: { maxWidth: 400 },
  input: {
    color: theme.palette.type === 'dark' ? '#cbd5e0' : '#718096',
    fontSize: 'inherit',
    fontWeight: 'bold',
  },
}))

const getListStyle = (isDraggingOver: boolean): any => ({
  backgroundColor: isDraggingOver && '#CFDAFC',
})

function TabGroup({ children, contextMenuItems }: IProps): React.ReactElement {
  const styles = useStyles()

  const {
    isContextMenuOpen,
    handleOpenContextMenu,
    handleCloseContextMenu,
    contextAnchorPosition,
  } = useContextMenu()

  return (
    <>
      <div className="flex flex-col flex-initial mb-2 border border-solid rounded md:mr-2 md:last:mr-0 md:w-56 dark:border-gray-500">
        {children({ handleOpenContextMenu })}
      </div>

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

interface IHeaderProps {
  children: React.ReactNode
  isReadOnly?: boolean
  onOpenContextMenu: () => void
}
TabGroup.Header = function Header({ children, isReadOnly, onOpenContextMenu }: IHeaderProps) {
  return (
    <div
      className="flex flex-row items-center justify-between px-2 py-1 bg-gray-100 border-b rounded shadow-sm min-h-6 dark:text-gray-900 dark:bg-gray-700"
      onContextMenu={!isReadOnly ? onOpenContextMenu : undefined}
    >
      {children}
    </div>
  )
}

interface ICollapserProps {
  isCollapsed?: boolean
  numTabs: number
  onCollapseGroup: () => void
}
TabGroup.Collapser = function Collapser({
  isCollapsed,
  numTabs,
  onCollapseGroup,
}: ICollapserProps) {
  return (
    <button
      className={clsx(
        'mr-2 text-sm md:hidden text-gray-600 dark:text-gray-400',
        numTabs === 0 && 'text-gray-400 dark:text-gray-600 cursor-default'
      )}
      disabled={numTabs === 0}
      onClick={onCollapseGroup}
    >
      {isCollapsed ? <ArrowDropDown fontSize="inherit" /> : <ArrowDropUp fontSize="inherit" />}
    </button>
  )
}

interface ITitleProps {
  value: string
  isReadOnly?: boolean
  onChangeGroupName?: (name: string) => void
}
TabGroup.Title = function Title({ isReadOnly, onChangeGroupName, value }: ITitleProps) {
  const styles = useStyles()

  const [internalValue, updateInternalValue] = React.useState(value)

  return (
    <h1
      className="flex-1 text-xs font-bold text-gray-600 dark:text-gray-400 ellipsis"
      title={value}
    >
      {isReadOnly ? (
        value
      ) : (
        <Input
          fullWidth
          classes={{
            root: styles.input,
          }}
          value={internalValue}
          onChange={(e) => {
            updateInternalValue(e.target.value)
            onChangeGroupName && onChangeGroupName(e.target.value)
          }}
        />
      )}
    </h1>
  )
}

interface IGroupActionProps {
  title: string
  children: React.ReactNode
  onClick: (e) => void
}
TabGroup.GroupAction = function GroupAction({ title, onClick, children }: IGroupActionProps) {
  return (
    <button className="ml-2 header-icon" onClick={onClick} title={title}>
      {children}
    </button>
  )
}

interface IOpenGroupButtonProps {
  onOpenTabGroup: () => void
}
TabGroup.OpenGroup = function OpenGroupButton({ onOpenTabGroup }: IOpenGroupButtonProps) {
  return (
    <TabGroup.GroupAction title="open group" onClick={onOpenTabGroup}>
      <Launch fontSize="inherit" />
    </TabGroup.GroupAction>
  )
}

interface ICloseGroupProps {
  onCloseTabGroup: () => void
}
TabGroup.CloseGroup = function CloseGroupButton({ onCloseTabGroup }: ICloseGroupProps) {
  return (
    <TabGroup.GroupAction title="close group" onClick={onCloseTabGroup}>
      <Close fontSize="inherit" />
    </TabGroup.GroupAction>
  )
}

interface IDiscardSuggestionProps {
  onDiscardSuggestion: (e) => void
}
TabGroup.DiscardGroup = function DiscardGroupButton({
  onDiscardSuggestion,
}: IDiscardSuggestionProps) {
  return (
    <TabGroup.GroupAction title="discard suggestion" onClick={onDiscardSuggestion}>
      <Delete fontSize="inherit" />
    </TabGroup.GroupAction>
  )
}

interface IAcceptGroupProps {
  onAcceptSuggestion: () => void
}
TabGroup.AcceptGroup = function AcceptGroupButton({ onAcceptSuggestion }: IAcceptGroupProps) {
  return (
    <TabGroup.GroupAction title="save suggestion" onClick={onAcceptSuggestion}>
      <Save fontSize="inherit" />
    </TabGroup.GroupAction>
  )
}

interface ITabsProps {
  id: string
  isCollapsed?: boolean
  isReadOnly?: boolean
  children: React.ReactNode | React.ReactNode[]
}
TabGroup.Tabs = function Tabs({ id, isCollapsed, isReadOnly, children }: ITabsProps) {
  return (
    <Droppable ignoreContainerClipping droppableId={id} isDropDisabled={isReadOnly}>
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot): React.ReactElement => (
        <div
          className={clsx(
            'flex-1 min-h-8 max-h-48 overflow-y-auto',
            !!children && isCollapsed && 'hidden',
            'md:block'
          )}
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={getListStyle(snapshot.isDraggingOver)}
        >
          {children}

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

export default TabGroup
