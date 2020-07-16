import React, { useState } from 'react'
import { Snooze } from '@material-ui/icons'
import { Typography, MenuItem } from '@material-ui/core'

import Tab from './Tab'
import useOpenTab from './useOpenTab'

interface IProps {
  isReadOnly?: boolean
  isStale?: boolean
  id: string
  index: number
  title: string
  displayTitle?: string
  url: string
  isOpen?: boolean
  // favIconUrl?: string
  onCloseTab?: () => void
  onOpenCurrentTab?: () => void
  onRemoveTab?: () => void
  onEditTab?: (title: string, url?: string) => void
}

function CuratedTab({
  isReadOnly,
  isStale,
  id,
  index,
  title,
  displayTitle,
  url,
  isOpen,
  // favIconUrl,
  onCloseTab,
  onOpenCurrentTab,
  onRemoveTab,
  onEditTab,
}: IProps): React.ReactElement {
  const handleOpenTab = useOpenTab()

  const [isEditModeActive, setIsEditModeActive] = useState(false)

  const contextMenuItems = [
    isOpen && [
      onOpenCurrentTab && (
        <MenuItem dense key="switch" onClick={onOpenCurrentTab}>
          Switch To &quot;
          <Typography noWrap variant="inherit">
            {title}
          </Typography>
          &quot;
        </MenuItem>
      ),
      onCloseTab && (
        <MenuItem dense key="close" onClick={onCloseTab}>
          Close &quot;
          <Typography noWrap variant="inherit">
            {title}
          </Typography>
          &quot;
        </MenuItem>
      ),
    ],
    !isOpen &&
      !isReadOnly &&
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
      ],
    onRemoveTab && !isReadOnly && (
      <MenuItem dense key="remove" onClick={onRemoveTab}>
        Remove &quot;
        <Typography noWrap variant="inherit">
          {title}
        </Typography>
        &quot; From Group
      </MenuItem>
    ),
  ]

  return (
    <Tab draggableId={`curated-${id}`} draggableIndex={index} contextMenuItems={contextMenuItems}>
      {({ provided, snapshot, handleOpenContextMenu }) => (
        <Tab.Container
          provided={provided}
          snapshot={snapshot}
          isReadOnly={isReadOnly}
          isOpen={isOpen}
          onOpenContextMenu={handleOpenContextMenu}
        >
          <Tab.Title
            isOpen={isOpen}
            title={displayTitle || title}
            url={url}
            onOpenCurrentTab={onOpenCurrentTab}
            onOpenTab={handleOpenTab}
          />
          {onEditTab && (
            <>
              <Tab.Edit onActivateEditMode={() => setIsEditModeActive(true)} />
              <Tab.EditDialog
                isOpen={isEditModeActive}
                currentTitle={displayTitle || title}
                currentUrl={url}
                onClose={() => setIsEditModeActive(false)}
                onSave={onEditTab}
              />
            </>
          )}
          {isStale && <Snooze fontSize="inherit" />}
          {onCloseTab && <Tab.Close isOpen={isOpen} onCloseTab={onCloseTab} />}
        </Tab.Container>
      )}
    </Tab>
  )
}

export default CuratedTab
