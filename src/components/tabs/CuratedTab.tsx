import React from 'react'

import Tab from './Tab'
import { Typography, MenuItem } from '@material-ui/core'
import useOpenTab from './useOpenTab'

interface IProps {
  isReadOnly?: boolean
  id: string
  index: number
  title: string
  url: string
  isOpen?: boolean
  // favIconUrl?: string
  onCloseTab?: () => void
  onOpenCurrentTab?: () => void
  onRemoveTab?: () => void
}

function CuratedTab({
  isReadOnly,
  id,
  index,
  title,
  url,
  isOpen,
  // favIconUrl,
  onCloseTab,
  onOpenCurrentTab,
  onRemoveTab,
}: IProps): React.ReactElement {
  const handleOpenTab = useOpenTab()

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
          {/* <Tab.FavIcon favIconUrl={favIconUrl} /> */}
          <Tab.Title
            isOpen={isOpen}
            title={title}
            url={url}
            onOpenCurrentTab={onOpenCurrentTab}
            onOpenTab={handleOpenTab}
          />
          {onCloseTab && <Tab.Close isOpen={isOpen} onCloseTab={onCloseTab} />}
        </Tab.Container>
      )}
    </Tab>
  )
}

export default CuratedTab
