import React from 'react'
import { DragDropContext, DropResult, Droppable, DroppableProvided } from 'react-beautiful-dnd'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Typography } from '@material-ui/core'
import { Add, Refresh } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { range } from 'ramda'
import clsx from 'clsx'

import Layout from '@src/components/common/Layout'
import { updateGroup, processDragEventAlias } from '@src/state/tabGroups'
import { RootState } from '@src/state/configureStore'
import RecentTabs from '@src/components/tabs/RecentTabs'
import CurrentTabs from '@src/components/tabs/CurrentTabs'
import SuggestedTabGroup from '@src/components/tabs/SuggestedTabGroup'
import ManualTabGroup from '@src/components/tabs/ManualTabGroup'
import ConfigBar from '@src/components/ConfigBar'

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.type === 'dark' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    marginBottom: '0.5rem',
    '&:hover': {
      background: theme.palette.type === 'dark' ? 'rgba(0, 0, 0, 0.01)' : 'rgba(0, 0, 0, 0.01)',
    },
  },
}))

function UI(): React.ReactElement {
  const styles = useStyles()

  const dispatch = useDispatch()

  const numTabGroups = useSelector((state: RootState) => state.tabGroups.length)
  const numSuggestions = useSelector((state: RootState) => state.suggestions.length)
  const heuristicsEnabled = useSelector(
    (state: RootState) => state.settings.isHeuristicsBackendEnabled
  )

  const handleDragEnd = (dragEvent: DropResult): void => {
    dispatch(processDragEventAlias(dragEvent))
  }

  const handleAddTabGroup = (): void => {
    dispatch(updateGroup({}))
  }

  if (!Number.isInteger(numTabGroups)) {
    return <div>Loading</div>
  }

  return (
    <Layout>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="w-full h-auto p-2 min-h-64 min-w-64">
          <ConfigBar />

          <div className="flex flex-col md:flex-wrap md:flex-row">
            <RecentTabs />
            <CurrentTabs />

            {range(0, numTabGroups).map((tabGroupIndex: number) => (
              <ManualTabGroup
                key={tabGroupIndex}
                selector={(state: RootState) => state.tabGroups[tabGroupIndex]}
              />
            ))}

            <Droppable ignoreContainerClipping droppableId="newGroup">
              {(provided: DroppableProvided): React.ReactElement => (
                <Button
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={clsx(styles.root, 'w-full min-h-8 md:w-56')}
                  onClick={handleAddTabGroup}
                  title="add group"
                >
                  <Add />
                </Button>
              )}
            </Droppable>
          </div>

          {heuristicsEnabled && (
            <div>
              <div className="flex flex-row justify-between">
                <Typography variant="body1">Suggestions</Typography>
                <button className="text-lg">
                  <Refresh fontSize="inherit" />
                </button>
              </div>

              <div className="flex flex-col md:overflow-x-auto md:flex-row">
                {numSuggestions === 0 ? (
                  <Typography variant="body2">Collecting more data...</Typography>
                ) : (
                  range(0, numSuggestions).map((suggestionIndex: number) => (
                    <SuggestedTabGroup
                      key={suggestionIndex}
                      selector={(state: RootState) => state.suggestions[suggestionIndex]}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DragDropContext>
    </Layout>
  )
}

export default UI
