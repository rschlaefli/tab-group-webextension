import React, { useState } from 'react'
import {
  Button,
  Stepper,
  Step,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  StepLabel,
  ExpansionPanel as MuiExpansionPanel,
  ExpansionPanelSummary as MuiExpansionPanelSummary,
  FormControlLabel,
  Checkbox,
  ExpansionPanelDetails as MuiExpansionPanelDetails,
} from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles'
import { useDispatch, useSelector } from 'react-redux'

import Layout from '@src/components/common/Layout'
import Markdown from '@src/components/common/Markdown'
import { RootState } from '@src/state/configureStore'
import {
  updateProgress,
  updateHeuristicsInstallationStep,
  establishHeuristicsConnectionAlias,
} from '@src/state/tutorial'
import { useBrowserAndOS } from '@src/lib/utils'
import TUTORIAL_CONTENTS from '@src/docs/tutorial'

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

  const {
    progress,
    heuristicsRequirementsSatisfied,
    heuristicsSetupCompleted,
    heuristicsConnectionEstablished,
    heuristicsConnectionError,
  } = useSelector((state: RootState) => state.tutorial)

  const { browser, os, setBrowser, setOS } = useBrowserAndOS()

  const { Introduction, DataCollection, Conclusion } = TUTORIAL_CONTENTS
  const { Introduction: OSIntroduction, Requirements, Setup } = TUTORIAL_CONTENTS[os]

  return (
    <Layout>
      <Container className="p-4">
        <div className="p-4 bg-gray-100 border border-gray-300 border-solid min-h-64 dark:border-none">
          {progress === 0 && (
            <div>
              <Markdown content={Introduction} />
              <Button color="primary" onClick={() => dispatch(updateProgress(1))}>
                Next Step
              </Button>
            </div>
          )}

          {progress === 1 && (
            <div>
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
                    <ExpansionPanelDetails>
                      <Markdown content={Requirements} />
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
                    <ExpansionPanelDetails>
                      <Markdown content={Setup} />
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
                      {heuristicsConnectionEstablished &&
                        'Connection established. Please continue with the final step.'}

                      {heuristicsConnectionError &&
                        `Encountered an issue while trying to connect: ${heuristicsConnectionError}`}

                      {!heuristicsConnectionEstablished && (
                        <div>
                          <p>
                            Connection not ready. If you have only just installed the heuristics
                            engine, please restart your browser.
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

              <div className="flex justify-between">
                <Button onClick={() => dispatch(updateProgress(0))}>Previous Step</Button>
                <Button
                  color="primary"
                  disabled={
                    !heuristicsRequirementsSatisfied ||
                    !heuristicsSetupCompleted ||
                    !heuristicsConnectionEstablished
                  }
                  onClick={() => dispatch(updateProgress(2))}
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {progress === 2 && (
            <div>
              <Markdown content={DataCollection} />

              <Button onClick={() => dispatch(updateProgress(1))}>Previous Step</Button>
              <Button color="primary" onClick={() => dispatch(updateProgress(3))}>
                Finish Tutorial
              </Button>
            </div>
          )}

          {progress === 3 && (
            <div>
              <Markdown content={Conclusion} />
            </div>
          )}
        </div>

        <Stepper activeStep={progress}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Container>
    </Layout>
  )
}

export default Tutorial
