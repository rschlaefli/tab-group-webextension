import React from 'react'
import { Container, Stepper, Step, StepLabel, Button } from '@material-ui/core'

import Layout from '../common/Layout'

interface IProps {
  activeStep: number
  steps: string[]
  children: React.ReactNode
}

function DocStepper({ activeStep, steps, children }: IProps): React.ReactElement {
  return (
    <Layout>
      <Container className="p-4">
        <div className="p-4 bg-gray-100 border border-gray-300 border-solid dark:bg-gray-700 min-h-64 dark:border-none">
          {children}
        </div>

        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Container>
    </Layout>
  )
}

interface IStepProps {
  activeStep: number
  currentStep: number
  hasPrev?: boolean
  hasNext?: boolean
  onChangeStep: (newStep: number) => void
  children: React.ReactNode
}
DocStepper.Step = function Step({
  activeStep,
  currentStep,
  children,
  hasPrev,
  hasNext,
  onChangeStep,
}: IStepProps) {
  if (currentStep !== activeStep) {
    return null
  }

  return (
    <div>
      {children}
      <div className="flex justify-between">
        {hasPrev ? (
          <Button onClick={() => onChangeStep(currentStep - 1)}>Previous Step</Button>
        ) : (
          <div />
        )}
        {hasNext ? (
          <Button onClick={() => onChangeStep(currentStep + 1)}>Next Step</Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}

export default DocStepper
