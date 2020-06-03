// ref: https://github.com/lusakasa/saka/blob/master/src/content_script/toggle_saka.js

import { browser } from 'webextension-polyfill-ts'

const sidebar = document.createElement('iframe')
sidebar.id = 'tabs-sidebar'
sidebar.src = browser.runtime.getURL('ui.html')

const sidebarWrapper = document.createElement('div')
sidebarWrapper.id = 'tabs-sidebar-wrapper'
sidebarWrapper.appendChild(sidebar)

const togglePinned = (): void => {
  if (sidebarWrapper.className.includes('pinned')) {
    sidebarWrapper.setAttribute('class', sidebarWrapper.className.replace('pinned', ''))
    document.body.setAttribute('class', document.body.className.replace('tabGroupsPinned', ''))
  } else {
    sidebarWrapper.setAttribute('class', sidebarWrapper.className + ' pinned')
    document.body.setAttribute('class', document.body.className + ' tabGroupsPinned')
  }
}

const toggleSidebar = (): void => {
  if (sidebarWrapper.className.includes('open')) {
    if (sidebarWrapper.className.includes('pinned')) {
      togglePinned()
    }
    sidebarWrapper.setAttribute('class', sidebarWrapper.className.replace('open', ''))
  } else {
    sidebarWrapper.setAttribute('class', sidebarWrapper.className + ' open')
  }
}

browser.runtime.onMessage.addListener((message) => {
  console.log('[sidebar] received message in content script', message)

  if (message === 'TOGGLE_SIDEBAR') {
    toggleSidebar()
  }

  if (message === 'TOGGLE_PINNED') {
    togglePinned()
  }
})

const sidebarToggle = document.createElement('button')
sidebarToggle.id = 'tabs-sidebar-toggle'
sidebarToggle.addEventListener('click', (e) => {
  e.preventDefault()
  toggleSidebar()
})

const sidebarPin = document.createElement('pin')
sidebarPin.id = 'tabs-sidebar-pin'
sidebarPin.addEventListener('click', (e) => {
  e.preventDefault()
  togglePinned()
})

sidebarWrapper.appendChild(sidebarToggle)
sidebarWrapper.appendChild(sidebarPin)

document.body.appendChild(sidebarWrapper)
