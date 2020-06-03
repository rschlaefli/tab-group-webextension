// ref: https://github.com/lusakasa/saka/blob/master/src/content_script/toggle_saka.js

import { browser } from 'webextension-polyfill-ts'

const sidebar = document.createElement('iframe')
sidebar.id = 'tabs-sidebar'
sidebar.src = browser.runtime.getURL('ui.html')

const sidebarWrapper = document.createElement('div')
sidebarWrapper.id = 'tabs-sidebar-wrapper'
sidebarWrapper.appendChild(sidebar)

const toggleSidebar = (): void => {
  if (sidebarWrapper.className.includes('open')) {
    sidebarWrapper.setAttribute('class', '')
  } else {
    sidebarWrapper.setAttribute('class', 'open')
  }
}

browser.runtime.onMessage.addListener((message) => {
  console.log('[sidebar] received message in content script', message)

  if (message === 'TOGGLE_SIDEBAR') {
    toggleSidebar()
  }
})

const sidebarToggle = document.createElement('button')
sidebarToggle.id = 'tabs-sidebar-toggle'
sidebarToggle.addEventListener('click', (e) => {
  e.preventDefault()
  toggleSidebar()
})

sidebarWrapper.appendChild(sidebarToggle)

document.body.appendChild(sidebarWrapper)
