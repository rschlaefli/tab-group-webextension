import React, { useState, useEffect } from 'react'
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ExpansionPanel as MuiExpansionPanel,
  ExpansionPanelSummary as MuiExpansionPanelSummary,
  FormControlLabel,
  Checkbox,
  ExpansionPanelDetails as MuiExpansionPanelDetails,
} from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'

import Markdown from '@src/components/common/Markdown'
import { RootState } from '@src/state/configureStore'
import {
  updateProgress,
  updateHeuristicsInstallationStep,
  establishHeuristicsConnectionAlias,
} from '@src/state/tutorial'
import { useBrowserAndOS } from '@src/lib/utils'
import TUTORIAL_CONTENTS from '@src/docs/setupInstructions/index'
import DocStepper from '@src/components/tutorial/DocStepper'

const STEPS = ['Introduction', 'Heuristics Setup', 'Data Collection']

const ExpansionPanel = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiExpansionPanel)

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    // minHeight: 56,
    // '&$expanded': {
    //   minHeight: 56,
    // },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary)

const ExpansionPanelDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiExpansionPanelDetails)

function Tutorial(): React.ReactElement {
  const dispatch = useDispatch()

  const [heuristicsVersion, setHeuristicsVersion] = useState<string>()

  const {
    progress,
    heuristicsRequirementsSatisfied,
    heuristicsSetupCompleted,
    heuristicsConnectionEstablished,
    heuristicsConnectionError,
  } = useSelector((state: RootState) => state.tutorial)

  useEffect(() => {
    const fetchHeuristicsVersion = async () => {
      const { data } = await axios.get(
        'https://tabs.fra1.digitaloceanspaces.com/heuristics/heuristics-version.json'
      )
      setHeuristicsVersion(data.latest)
    }
    fetchHeuristicsVersion()
  }, [])

  const { browser, os, setBrowser, setOS } = useBrowserAndOS()

  const { Introduction, DataCollection, Conclusion } = TUTORIAL_CONTENTS
  const { Introduction: OSIntroduction, Requirements, Setup } = TUTORIAL_CONTENTS[os]

  return (
    <DocStepper activeStep={progress} steps={STEPS}>
      <DocStepper.Step
        activeStep={progress}
        currentStep={0}
        hasNext
        onChangeStep={(newStep) => dispatch(updateProgress(newStep))}
      >
        <Markdown content={Introduction} />
      </DocStepper.Step>

      <DocStepper.Step
        activeStep={progress}
        currentStep={1}
        hasNext
        hasPrev
        onChangeStep={(newStep) => dispatch(updateProgress(newStep))}
      >
        <div className="flex flex-row justify-end -mb-12">
          <FormControl>
            <InputLabel>Browser</InputLabel>
            <Select value={browser} onChange={(e: any) => setBrowser(e.target.value)}>
              <MenuItem value="Chrome">Google Chrome</MenuItem>
              <MenuItem value="Firefox">Mozilla Firefox</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>OS</InputLabel>
            <Select value={os} onChange={(e: any) => setOS(e.target.value)}>
              <MenuItem value="Windows">Windows</MenuItem>
              <MenuItem value="Mac OS">Mac OS</MenuItem>
              <MenuItem value="Linux">Linux</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </div>

        {(os !== 'Other' && browser !== 'Other' && (
          <>
            <div className="pb-4">
              <Markdown content={OSIntroduction} />
            </div>

            <ExpansionPanel expanded={!heuristicsRequirementsSatisfied}>
              <ExpansionPanelSummary
                expandIcon={<ExpandMore />}
                aria-label="Expand"
                aria-controls="additional-actions3-content"
                id="additional-actions3-header"
              >
                <FormControlLabel
                  aria-label="requirements"
                  onClick={(event) => event.stopPropagation()}
                  onFocus={(event) => event.stopPropagation()}
                  control={
                    <Checkbox
                      checked={heuristicsRequirementsSatisfied}
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch(
                            updateHeuristicsInstallationStep({
                              heuristicsRequirementsSatisfied: true,
                            })
                          )
                        } else {
                          dispatch(
                            updateHeuristicsInstallationStep({
                              heuristicsRequirementsSatisfied: false,
                            })
                          )
                        }
                      }}
                    />
                  }
                  label="System Requirements"
                />
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ display: 'flex', flexDirection: 'column' }}>
                <Markdown content={Requirements} />
                <Button
                  style={{ marginTop: '1rem' }}
                  onClick={() => {
                    dispatch(
                      updateHeuristicsInstallationStep({
                        heuristicsRequirementsSatisfied: true,
                      })
                    )
                  }}
                >
                  Continue
                </Button>
              </ExpansionPanelDetails>
            </ExpansionPanel>

            <ExpansionPanel
              disabled={!heuristicsRequirementsSatisfied}
              expanded={heuristicsRequirementsSatisfied && !heuristicsSetupCompleted}
            >
              <ExpansionPanelSummary
                expandIcon={<ExpandMore />}
                aria-label="Expand"
                aria-controls="additional-actions3-content"
                id="additional-actions3-header"
              >
                <FormControlLabel
                  aria-label="setup"
                  onClick={(event) => event.stopPropagation()}
                  onFocus={(event) => event.stopPropagation()}
                  control={
                    <Checkbox
                      disabled={!heuristicsRequirementsSatisfied}
                      checked={heuristicsSetupCompleted}
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch(
                            updateHeuristicsInstallationStep({
                              heuristicsSetupCompleted: true,
                            })
                          )
                          dispatch(establishHeuristicsConnectionAlias())
                        } else {
                          dispatch(
                            updateHeuristicsInstallationStep({
                              heuristicsSetupCompleted: false,
                            })
                          )
                        }
                      }}
                    />
                  }
                  label="Heuristics Setup"
                />
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ display: 'flex', flexDirection: 'column' }}>
                <Markdown
                  content={Setup}
                  replace={{ key: '__VERSION__', value: heuristicsVersion || 'X.X.X' }}
                />
                <Button
                  style={{ marginTop: '1rem' }}
                  onClick={() => {
                    dispatch(updateHeuristicsInstallationStep({ heuristicsSetupCompleted: true }))
                    dispatch(establishHeuristicsConnectionAlias())
                  }}
                >
                  Continue
                </Button>
              </ExpansionPanelDetails>
            </ExpansionPanel>

            <ExpansionPanel
              disabled={!heuristicsRequirementsSatisfied || !heuristicsSetupCompleted}
              expanded={heuristicsRequirementsSatisfied && heuristicsSetupCompleted}
            >
              <ExpansionPanelSummary
                expandIcon={<ExpandMore />}
                aria-label="Expand"
                aria-controls="additional-actions3-content"
                id="additional-actions3-header"
              >
                <FormControlLabel
                  aria-label="connection"
                  onClick={(event) => event.stopPropagation()}
                  onFocus={(event) => event.stopPropagation()}
                  control={
                    <Checkbox
                      disabled={!heuristicsConnectionEstablished}
                      checked={heuristicsConnectionEstablished}
                    />
                  }
                  label="Heuristics Connection"
                />
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                {heuristicsConnectionEstablished && (
                  <div>Connection established. Please continue with the final step.</div>
                )}

                {heuristicsConnectionError && (
                  <div>
                    Encountered an issue while trying to connect: {heuristicsConnectionError}
                  </div>
                )}

                {!heuristicsConnectionEstablished && (
                  <div>
                    <p>
                      Connection not ready. If you have only just installed the heuristics engine,
                      please try to restart your browser.
                    </p>

                    <Button onClick={() => dispatch(establishHeuristicsConnectionAlias())}>
                      Try again
                    </Button>

                    <a href="troubleshooting.html">Troubleshooting</a>
                  </div>
                )}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </>
        )) || (
          <div className="markdown">
            <h1>Error</h1>
            <p>Unsupported browser or OS.</p>
          </div>
        )}
      </DocStepper.Step>

      <DocStepper.Step
        activeStep={progress}
        currentStep={2}
        hasNext
        hasPrev
        onChangeStep={(newStep) => dispatch(updateProgress(newStep))}
      >
        <Markdown content={DataCollection} />
      </DocStepper.Step>

      <DocStepper.Step
        activeStep={progress}
        currentStep={3}
        hasPrev
        onChangeStep={(newStep) => dispatch(updateProgress(newStep))}
      >
        <Markdown content={Conclusion} />
      </DocStepper.Step>
    </DocStepper>
  )
}

export default Tutorial
