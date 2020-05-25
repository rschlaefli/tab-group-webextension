import React from 'react'
import {
  Container,
  FormGroup,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'

import Layout from '../components/common/Layout'
import { RootState } from '@src/state/configureStore'
import {
  resetTutorialProgress,
  toggleDebugLoggingAlias,
  toggleHeuristicsBackendAlias,
  reloadExtensionAlias,
} from '@src/state/settings'

function Options(): React.ReactElement {
  const dispatch = useDispatch()

  const { tutorialProgress, isDebugLoggingEnabled, isHeuristicsBackendEnabled } = useSelector(
    (state: RootState) => state.settings
  )

  return (
    <Layout>
      <Container>
        <FormControl component="fieldset">
          <FormLabel component="legend">Browser Extension</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDebugLoggingEnabled}
                  onChange={() => dispatch(toggleDebugLoggingAlias())}
                />
              }
              label="Enable debug logging"
            />
            <Button
              disabled={tutorialProgress === 0}
              onClick={() => dispatch(resetTutorialProgress())}
            >
              Reset tutorial progress
            </Button>
            <Button onClick={() => dispatch(reloadExtensionAlias())}>Reload extension</Button>
          </FormGroup>
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">Heuristics Engine</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isHeuristicsBackendEnabled}
                  onChange={() => dispatch(toggleHeuristicsBackendAlias())}
                />
              }
              label="Enable grouping heuristics"
            />
          </FormGroup>
        </FormControl>
      </Container>
    </Layout>
  )
}

export default Options
