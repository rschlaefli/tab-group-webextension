import React from 'react'

import { MenuItem, Typography } from '@material-ui/core'
import useOpenTab from './useOpenTab'
import Tab from './Tab'

interface IProps {
  isOpen?: boolean
  id: string
  index: number
  title: string
  url: string
  onDiscardTab: () => void
  onCloseTab: () => void
  onOpenCurrentTab: () => void
}

function AdditionalTab({
  isOpen,
  id,
  index,
  title,
  url,
  onDiscardTab,
  onOpenCurrentTab,
  onCloseTab,
}: IProps): React.ReactElement {
  const handleOpenTab = useOpenTab()

  const contextMenuItems = [
    isOpen && [
      <MenuItem dense key="switch" onClick={onOpenCurrentTab}>
        Switch To &quot;
        <Typography noWrap variant="inherit">
          {title}
        </Typography>
        &quot;
      </MenuItem>,
      <MenuItem dense key="close" onClick={onCloseTab}>
        Close &quot;
        <Typography noWrap variant="inherit">
          {title}
        </Typography>
        &quot;
      </MenuItem>,
    ],
    !isOpen &&
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
    </MenuItem>,
  ]

  return (
    <Tab
      draggableId={`additional-${id}`}
      draggableIndex={index}
      contextMenuItems={contextMenuItems}
    >
      {({ provided, snapshot, handleOpenContextMenu }) => (
        <Tab.Container
          isOpen={isOpen}
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

export default AdditionalTab
