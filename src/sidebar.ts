// ref: https://github.com/lusakasa/saka/blob/master/src/content_script/toggle_saka.js

import { browser } from 'webextension-polyfill-ts'

const sidebar = document.createElement('iframe')
sidebar.id = 'tabs-sidebar'
sidebar.src = browser.runtime.getURL('ui.html')

const sidebarWrapper = document.createElement('div')
sidebarWrapper.id = 'tabs-sidebar-wrapper'
sidebarWrapper.appendChild(sidebar)

const sidebarToggle = document.createElement('button')
sidebarToggle.id = 'tabs-sidebar-toggle'
sidebarToggle.addEventListener('click', (e) => {
  e.preventDefault()
  if (sidebarWrapper.className.includes('open')) {
    sidebarWrapper.setAttribute('class', '')
  } else {
    sidebarWrapper.setAttribute('class', 'open')
  }
})

sidebarWrapper.appendChild(sidebarToggle)

document.body.appendChild(sidebarWrapper)
