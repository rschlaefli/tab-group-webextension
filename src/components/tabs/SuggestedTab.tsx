import React from 'react'

import Tab from './Tab'
import { MenuItem, Typography } from '@material-ui/core'
import useOpenTab from './useOpenTab'

interface IProps {
  id: string
  index: number
  title: string
  url: string
  onDiscardTab: () => void
}

function SuggestedTab({ id, index, title, url, onDiscardTab }: IProps): React.ReactElement {
  const handleOpenTab = useOpenTab()

  const contextMenuItems = [
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
    <MenuItem dense key="discard" onClick={onDiscardTab}>
      Discard &quot;
      <Typography noWrap variant="inherit">
        {title}
      </Typography>
      &quot;
    </MenuItem>,
  ]

  return (
    <Tab draggableId={`suggested-${id}`} draggableIndex={index} contextMenuItems={contextMenuItems}>
      {({ provided, snapshot, handleOpenContextMenu }) => (
        <Tab.Container
          provided={provided}
          snapshot={snapshot}
          onOpenContextMenu={handleOpenContextMenu}
        >
          <Tab.Title title={title} url={url} onOpenTab={handleOpenTab} />
          <Tab.Discard onDiscardTab={onDiscardTab} />
        </Tab.Container>
      )}
    </Tab>
  )
}

export default SuggestedTab
