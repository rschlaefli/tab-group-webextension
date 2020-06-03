// ref: https://github.com/lusakasa/saka/blob/master/src/content_script/toggle_saka.js

import { browser } from 'webextension-polyfill-ts'

const sidebarWrapper = document.getElementById('tabs-sidebar-wrapper')
const existingSidebar = document.getElementById('tabs-sidebar')

if (sidebarWrapper) {
  if (existingSidebar) {
    sidebarWrapper.removeChild(existingSidebar)
  } else {
    const sidebar = document.createElement('iframe')
    sidebar.id = 'tabs-sidebar'
    sidebar.src = browser.runtime.getURL('ui.html')
    sidebarWrapper.appendChild(sidebar)
  }
}
