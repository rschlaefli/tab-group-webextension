// ref: https://github.com/lusakasa/saka/blob/master/src/content_script/toggle_saka.js

import { browser } from 'webextension-polyfill-ts'

const sidebarWrapper =
  document.getElementById('tabs-sidebar-wrapper') || document.createElement('div')
sidebarWrapper.id = 'tabs-sidebar-wrapper'

const togglePinned = (): void => {
  if (sidebarWrapper.className.includes('pinned')) {
    sidebarWrapper.className = sidebarWrapper.className.replace('pinned', '').trim()
    document.body.className = document.body.className.replace('tabGroupsPinned', '').trim()
  } else {
    sidebarWrapper.className = sidebarWrapper.className + ' pinned'
    document.body.className = document.body.className + ' tabGroupsPinned'
  }
}

const toggleSidebar = (): void => {
  if (sidebarWrapper.className.includes('open')) {
    if (sidebarWrapper.className.includes('pinned')) {
      togglePinned()
    }
    sidebarWrapper.className = sidebarWrapper.className.replace('open', '').trim()
  } else {
    sidebarWrapper.className = sidebarWrapper.className + ' open'
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

const sidebarToggle =
  document.getElementById('tabs-sidebar-toggle') || document.createElement('button')
sidebarToggle.id = 'tabs-sidebar-toggle'
sidebarToggle.addEventListener('click', (e) => {
  e.preventDefault()
  browser.runtime.sendMessage('TOGGLE_SIDEBAR')
})

const sidebarPin = document.getElementById('tabs-sidebar-pin') || document.createElement('pin')
sidebarPin.id = 'tabs-sidebar-pin'
sidebarPin.addEventListener('click', (e) => {
  e.preventDefault()
  browser.runtime.sendMessage('TOGGLE_PINNED')
})

sidebarWrapper.appendChild(sidebarToggle)
sidebarWrapper.appendChild(sidebarPin)

document.body.appendChild(sidebarWrapper)
