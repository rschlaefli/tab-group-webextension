import React from 'react'
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
import { updateTutorialProgress } from '@src/state/settings'
import { useBrowserAndOS } from '@src/lib/utils'

import TUTORIAL_CONTENTS from '@src/docs/tutorial'

const STEPS = ['Extension Setup', 'Heuristics Setup', 'Data Collection']

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
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
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

  // const activeStep = useSelector((state: RootState) => state.settings.tutorialProgress)

  const activeStep = 1

  const { browser, os, setBrowser, setOS } = useBrowserAndOS()

  const { introduction, requirements, ...setupSteps } = TUTORIAL_CONTENTS[os]

  return (
    <Layout>
      <Container>
        <div className="p-4 border border-gray-100 border-solid min-h-64 dark:border-none">
          {activeStep === 0 && (
            <div>
              <p>Tune the extension to your liking</p>
              <ul>
                <li>asdasd</li>
              </ul>
              <Button onClick={() => dispatch(updateTutorialProgress(1))}>Next Step</Button>
            </div>
          )}

          {activeStep === 1 && (
            <div className="p-4 bg-gray-100 border border-gray-300">
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
                  <Markdown content={introduction} />
                  <ExpansionPanel>
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
                        control={<Checkbox />}
                        label="System Requirements"
                      />
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <Markdown content={requirements} />
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel>
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
                        control={<Checkbox />}
                        label="Heuristics Setup"
                      />
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <Markdown content={setupSteps[browser]} />
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel>
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
                        control={<Checkbox />}
                        label="Heuristics Connection"
                      />
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>Testing...</ExpansionPanelDetails>
                  </ExpansionPanel>
                </>
              )) || (
                <div className="markdown">
                  <h1>Error</h1>
                  <p>Unsupported browser or OS.</p>
                </div>
              )}

              <div className="flex justify-between">
                <Button onClick={() => () => dispatch(updateTutorialProgress(0))}>
                  Previous Step
                </Button>
                <Button onClick={() => dispatch(updateTutorialProgress(2))}>Next Step</Button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div>
              <p>Start browsing and we will collect data in the background!</p>
              <ul>
                <li>data can be viewed and censored here: xyz ...</li>
                <li>experimental procedures...</li>
                <li>you can modify your groups at will...</li>
              </ul>
              <Button onClick={() => dispatch(updateTutorialProgress(1))}>Previous Step</Button>
              <Button onClick={() => dispatch(updateTutorialProgress(3))}>Finish Tutorial</Button>
            </div>
          )}
          {activeStep === 3 && (
            <div>
              <p>You have finished the tutorial...</p>
              <p>Please send feedback to bla or fill the following form xyz...</p>
            </div>
          )}
        </div>

        <Stepper activeStep={activeStep}>
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
