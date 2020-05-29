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
  toggleDebugLoggingAlias,
  toggleHeuristicsBackendAlias,
  reloadExtensionAlias,
} from '@src/state/settings'
import { resetProgress } from '@src/state/tutorial'

function Options(): React.ReactElement {
  const dispatch = useDispatch()

  const { isDebugLoggingEnabled, isHeuristicsBackendEnabled } = useSelector(
    (state: RootState) => state.settings
  )
  const { progress } = useSelector((state: RootState) => state.tutorial)

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
            <Button disabled={progress === 0} onClick={() => dispatch(resetProgress())}>
              Reset Tutorial
            </Button>
            <Button onClick={() => dispatch(reloadExtensionAlias())}>Reload Extension</Button>
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
