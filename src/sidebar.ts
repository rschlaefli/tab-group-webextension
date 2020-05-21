// ref: https://github.com/lusakasa/saka/blob/master/src/content_script/toggle_saka.js

import { browser } from 'webextension-polyfill-ts'
import Mousetrap from 'mousetrap'

import optionsStorage from './optionsStorage'

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

Mousetrap.bind(['command+shift+x', 'ctrl+shift+x'], function () {
  toggleSidebar()
  return false
})

const sidebarToggle = document.createElement('button')
sidebarToggle.id = 'tabs-sidebar-toggle'
sidebarToggle.addEventListener('click', (e) => {
  e.preventDefault()
  toggleSidebar()
})

sidebarWrapper.appendChild(sidebarToggle)

document.body.appendChild(sidebarWrapper)

// TODO: this does not make sense without a pinning feature
optionsStorage.getAll().then((options) => {
  if (options.openSidebarByDefault) {
    sidebarWrapper.setAttribute('class', 'open')
  }
})
