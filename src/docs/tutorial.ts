import Introduction from './Introduction.md'
import DataCollection from './DataCollection.md'
import Conclusion from './Conclusion.md'

import MacIntro from './mac/Introduction.md'
import MacRequirements from './mac/Requirements.md'
import MacSetup from './mac/Setup.md'

import LinuxIntro from './linux/Introduction.md'
import LinuxRequirements from './linux/Requirements.md'
import LinuxSetup from './linux/Setup.md'

import WindowsIntro from './windows/Introduction.md'
import WindowsRequirements from './windows/Requirements.md'
import WindowsSetup from './windows/Setup.md'

const MacOS = {
  Introduction: MacIntro,
  Requirements: MacRequirements,
  Setup: MacSetup,
}

const Windows = {
  Introduction: WindowsIntro,
  Requirements: WindowsRequirements,
  Setup: WindowsSetup,
}

const Linux = {
  Introduction: LinuxIntro,
  Requirements: LinuxRequirements,
  Setup: LinuxSetup,
}

export default {
  Introduction,
  DataCollection,
  Conclusion,
  'Mac OS': MacOS,
  Windows,
  Linux,
  Other: MacOS,
}
