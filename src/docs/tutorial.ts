import MacIntro from './mac/Introduction.md'
import MacRequirements from './mac/Requirements.md'
import MacChromeSetup from './mac/SetupChrome.md'
import MacFirefoxSetup from './mac/SetupFirefox.md'

import LinuxIntro from './linux/Introduction.md'
import LinuxRequirements from './linux/Requirements.md'
import LinuxChromeSetup from './linux/SetupChrome.md'
import LinuxFirefoxSetup from './linux/SetupFirefox.md'

import WindowsIntro from './windows/Introduction.md'
import WindowsRequirements from './windows/Requirements.md'
import WindowsChromeSetup from './windows/SetupChrome.md'
import WindowsFirefoxSetup from './windows/SetupFirefox.md'

const MacOS = {
  introduction: MacIntro,
  requirements: MacRequirements,
  Chrome: MacChromeSetup,
  Firefox: MacFirefoxSetup,
}

const Windows = {
  introduction: WindowsIntro,
  requirements: WindowsRequirements,
  Chrome: WindowsChromeSetup,
  Firefox: WindowsFirefoxSetup,
}

const Linux = {
  introduction: LinuxIntro,
  requirements: LinuxRequirements,
  Chrome: LinuxChromeSetup,
  Firefox: LinuxFirefoxSetup,
}

export default {
  'Mac OS': MacOS,
  Windows,
  Linux,
  Other: MacOS,
}
