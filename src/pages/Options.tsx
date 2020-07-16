import React from 'react'
import {
  FormGroup,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  Tabs,
  Tab,
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { JsonEditor as Editor } from 'jsoneditor-react'
import ace from 'brace'
import { Add } from '@material-ui/icons'

import Layout from '../components/common/Layout'
import { RootState } from '@src/state/configureStore'
import {
  toggleHeuristicsBackendAlias,
  reloadExtensionAlias,
  addHeuristicsConfig,
  updateActiveHeuristicsConfig,
  updateHeuristicsConfig,
  removeHeuristicsConfig,
} from '@src/state/settings'
import { resetProgress } from '@src/state/tutorial'

import 'jsoneditor-react/es/editor.css'
import 'brace/mode/json'
import 'brace/theme/github'

function Options(): React.ReactElement {
  const dispatch = useDispatch()

  const { isHeuristicsBackendEnabled, heuristicsActiveConfig, heuristicsConfigs } = useSelector(
    (state: RootState) => state.settings
  )
  const { progress } = useSelector((state: RootState) => state.tutorial)

  const handleUpdateActiveHeuristicsConfig = (_, newValue) => {
    dispatch(updateActiveHeuristicsConfig(newValue))
  }

  const handleAddNewHeuristicsConfig = () => {
    dispatch(addHeuristicsConfig())
  }

  const handleUpdateHeuristicsConfig = (ix: number) => (value) => {
    dispatch(updateHeuristicsConfig({ configIndex: ix, configValue: value }))
  }

  const handleRemoveSelectedConfig = (ix: number) => () => {
    dispatch(removeHeuristicsConfig(ix))
  }

  return (
    <Layout>
      <div className="flex flex-col w-full h-auto p-4 md:flex-row">
        <FormControl component="fieldset">
          <FormLabel component="legend">Browser Extension</FormLabel>
          <FormGroup>
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

        <div className="flex-1">
          <FormLabel component="legend">Heuristics Configurations</FormLabel>

          <Tabs value={heuristicsActiveConfig} onChange={handleUpdateActiveHeuristicsConfig}>
            {heuristicsConfigs.map((config, ix) => (
              <Tab key={ix} label={ix + 1} value={ix} title={config.name} />
            ))}
            <Tab icon={<Add />} onClick={() => handleAddNewHeuristicsConfig()} />
          </Tabs>

          {heuristicsConfigs.map((config, ix) => (
            <div key={ix} role="tabpanel" hidden={ix !== heuristicsActiveConfig}>
              {ix === heuristicsActiveConfig && (
                <Editor
                  search={false}
                  theme="ace/theme/github"
                  ace={ace}
                  mode={ix <= 1 ? 'view' : 'code'}
                  value={config}
                  onChange={handleUpdateHeuristicsConfig(ix)}
                />
              )}
            </div>
          ))}
          <Button
            disabled={heuristicsActiveConfig <= 1}
            onClick={handleRemoveSelectedConfig(heuristicsActiveConfig)}
          >
            Remove Selected Configuration
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default Options
