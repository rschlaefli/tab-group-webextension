// ref: https://github.com/ssorallen/redux-persist-webextension-storage/blob/master/src/createStorage.js

import { browser } from 'webextension-polyfill-ts'
import localForage from 'localforage'

// shim requestIdleCallback in case of it not being available
// ref: https://developer.mozilla.org/en-US/docs/Web/API/Background_Tasks_API
window.requestIdleCallback =
  window.requestIdleCallback ||
  function (handler): any {
    const startTime = Date.now()

    return setTimeout(function () {
      handler({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50.0 - (Date.now() - startTime))
        },
      })
    }, 1)
  }

// localForage.config({
//   driver: [localForage.INDEXEDDB],
// })

export default function syncStorage(): any {
  browser.storage.sync
    .get()
    .then(async (data) => {
      console.log('sync storage', data)

      // initialize the local storage from sync
      await localForage.clear()
      await localForage.setItem('persist:root', data['persist:root'])
    })
    .catch((e) => {
      console.log('local storage', e)
      return localForage
    })

  // mirror local storage to sync on a regular schedule
  async function syncLocalStorage(): Promise<void> {
    const localData = await localForage.getItem('persist:root')
    await browser.storage.sync.set({ 'persist:root': localData })
    console.log('> mirrored local storage to sync')
  }
  setInterval(() => window.requestIdleCallback(syncLocalStorage, { timeout: 5000 }), 10000)

  return localForage
}
