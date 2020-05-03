// ref: https://github.com/lusakasa/saka/blob/master/src/content_script/toggle_saka.js

import { browser } from 'webextension-polyfill-ts'

function setupSidebar(): any {
  const newSidebar = document.createElement('iframe')
  newSidebar.id = 'grouping-ui'
  newSidebar.src = browser.runtime.getURL('ui.html')
  newSidebar.setAttribute(
    'style',
    `
      flex: 0 0 250px;
      // border-right: 2px solid grey;
    `
  )
  return newSidebar
}

const oldSidebar = document.querySelector('#grouping-ui')

if (oldSidebar) {
  oldSidebar.remove()
} else {
  let newRoot = document.querySelector('#document-wrapper')
  if (!newRoot) {
    newRoot = document.createElement('div')
    newRoot.id = 'document-wrapper'
    newRoot.setAttribute(
      'style',
      `
        height: 100%;
        display: flex;
        flex-flow: row nowrap;

        @media (max-width: 768px) {
          #grouping-ui {
            display: none !important;
          }
        }
      `
    )

    const currentBody = document.body
    currentBody.setAttribute(
      'style',
      `
      flex: 1;
    `
    )

    const newSidebar = setupSidebar()

    newRoot.appendChild(newSidebar)
    newRoot.appendChild(currentBody)

    document.documentElement.appendChild(newRoot)
  } else {
    const newSidebar = setupSidebar()
    newRoot.prepend(newSidebar)
  }
}
