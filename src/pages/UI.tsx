import React, { useState, useEffect } from 'react'
import { DragDropContext, DropResult, Droppable, DroppableProvided } from 'react-beautiful-dnd'
import { useSelector, useDispatch } from 'react-redux'
import {
  Button,
  Typography,
  Snackbar,
  Input,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@material-ui/core'
import { Add, Save, Sync } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { range } from 'ramda'
import clsx from 'clsx'

import Layout from '@src/components/common/Layout'
import { updateGroup, processDragEventAlias } from '@src/state/tabGroups'
import { RootState } from '@src/state/configureStore'
import RecentTabs from '@src/components/tabGroups/RecentTabs'
import CurrentTabs from '@src/components/tabGroups/CurrentTabs'
import SuggestedTabGroup from '@src/components/tabGroups/SuggestedGroup'
import CuratedGroup from '@src/components/tabGroups/CuratedGroup'
import ConfigBar from '@src/components/ConfigBar'
import { setGroupingActivationKey } from '@src/state/settings'
import { refreshSuggestedGroupsAlias } from '@src/state/suggestions'

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.type === 'dark' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    marginBottom: '0.5rem',
    '&:hover': {
      background: theme.palette.type === 'dark' ? 'rgba(0, 0, 0, 0.01)' : 'rgba(0, 0, 0, 0.01)',
    },
  },
}))

const ACTIVATION_KEY =
  'e0375d59d9cbd5b262f5a4947958e96017ba50d1abfdd7b7239f0817138724e0340fb6801366bc59ca10640ca608ff524820310bea50e2d088ed72b97192e110'

function UI(): React.ReactElement {
  const styles = useStyles()

  const dispatch = useDispatch()

  const [wasInteractionRequested, setWasInteractionRequested] = useState(false)
  const [activationKeyInput, setActivationKeyInput] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const interactionRequest = urlParams.get('interactionRequest')
    if (interactionRequest) setWasInteractionRequested(true)
  }, [])

  const numTabGroups = useSelector((state: RootState) => state.tabGroups.length)
  const newSuggestions = useSelector((state: RootState) =>
    state.suggestions.flatMap((group, ix) => (group.id.includes('suggest-') ? [ix] : []))
  )
  const heuristicsEnabled = useSelector(
    (state: RootState) => state.settings.isHeuristicsBackendEnabled
  )
  const groupingActivationKey = useSelector(
    (state: RootState) => state.settings.groupingActivationKey
  )

  const handleDragEnd = (dragEvent: DropResult): void => {
    dispatch(processDragEventAlias(dragEvent))
  }

  const handleAddTabGroup = (): void => {
    dispatch(updateGroup({}))
  }

  const handleSaveActivationKey = () => {
    dispatch(setGroupingActivationKey(activationKeyInput))
  }

  const handleRefreshSuggestedGroups = () => {
    dispatch(refreshSuggestedGroupsAlias())
  }

  if (!Number.isInteger(numTabGroups)) {
    return <div>Loading</div>
  }

  if (!groupingActivationKey || groupingActivationKey !== ACTIVATION_KEY) {
    return (
      <Layout>
        <div className="w-full h-auto p-2 min-h-64 min-w-64">
          <ConfigBar />

          <div className="flex items-center justify-center">
            <FormControl>
              <InputLabel htmlFor="activation-input">Activation Key</InputLabel>
              <Input
                id="activation-input"
                aria-describedby="activation-text"
                value={activationKeyInput}
                onChange={(e) => setActivationKeyInput(e.target.value)}
              />
              <FormHelperText id="activation-text">
                Please enter an activation key to enable grouping functionality.
              </FormHelperText>
            </FormControl>
            <Button>
              <Save onClick={handleSaveActivationKey} />
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="w-full h-auto p-2 min-h-64 min-w-64">
          <ConfigBar withFocusMode />

          <div className="flex flex-row items-center justify-between">
            <Typography variant="overline">Curated Groups</Typography>
          </div>

          <div className="flex flex-col md:flex-wrap md:flex-row">
            <RecentTabs />
            <CurrentTabs />

            {range(0, numTabGroups).map((tabGroupIndex: number) => (
              <CuratedGroup
                key={tabGroupIndex}
                selector={(state: RootState) => state.tabGroups[tabGroupIndex]}
              />
            ))}

            <Droppable ignoreContainerClipping droppableId="newGroup">
              {(provided: DroppableProvided): React.ReactElement => (
                <Button
                  ref={provided.innerRef}
                  // {...provided.droppableProps}
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
              <div className="flex flex-row items-center justify-start">
                <Typography variant="overline">Suggested Groups</Typography>
                <div className="flex ml-2 text-base text-gray-600">
                  <Sync
                    className="cursor-pointer"
                    fontSize="inherit"
                    onClick={handleRefreshSuggestedGroups}
                  />
                </div>
              </div>

              <div className="flex flex-col md:overflow-x-auto md:flex-row">
                {newSuggestions.length === 0 ? (
                  <Typography variant="body2">Collecting more data...</Typography>
                ) : (
                  newSuggestions.map((suggestionIndex: number) => (
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

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={wasInteractionRequested}
        onClose={() => setWasInteractionRequested(false)}
        message="Do you have a minute to interact with our suggestions?"
      />
    </Layout>
  )
}

export default UI
