import React, { useState } from 'react'

import DocStepper from '@src/components/tutorial/DocStepper'

const STEPS = ['Introduction', 'Manual Grouping', 'Suggestions']

function Features(): React.ReactElement {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <DocStepper activeStep={activeStep} steps={STEPS}>
      <DocStepper.Step activeStep={activeStep} currentStep={0} hasNext onChangeStep={setActiveStep}>
        hello world
      </DocStepper.Step>
      <DocStepper.Step
        activeStep={activeStep}
        currentStep={1}
        hasNext
        hasPrev
        onChangeStep={setActiveStep}
      >
        hello world
      </DocStepper.Step>
      <DocStepper.Step activeStep={activeStep} currentStep={2} hasPrev onChangeStep={setActiveStep}>
        hello world
      </DocStepper.Step>
    </DocStepper>
  )
}

export default Features
