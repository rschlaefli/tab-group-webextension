// ref: https://github.com/ssorallen/redux-persist-webextension-storage/blob/master/src/createStorage.js

import { browser } from 'webextension-polyfill-ts'
import { Storage } from 'redux-persist'

import StorageAPI from './storageAPI'
import { persistor } from '@src/background'

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

export default function syncStorage(): Storage {
  browser.storage.sync
    .get()
    .then(async (data) => {
      console.log('[syncStorage] sync storage available', data)

      const lastUpdate = await StorageAPI.local.getItem('lastUpdate')

      if (!lastUpdate || (data.lastUpdate && lastUpdate < data.lastUpdate)) {
        await Promise.all([
          StorageAPI.local.setItem('persist:root', data['persist:root']),
          StorageAPI.local.setItem('lastUpdate', data.lastUpdate),
        ])

        console.log('[syncStorage] hydrated latest state from sync data')
      }

      console.log('[syncStorage] resuming redux persistor')
      persistor?.persist()

      // setup a listener to watch for sync storage changes
      // browser.storage.onChanged.addListener(async (changes, areaName) => {
      //   console.log('> browser storage changed', areaName, changes)

      //   // if lastUpdate changed in the sync storage after initialization, evaluate further
      //   if (areaName === 'sync' && changes['lastUpdate']) {
      //     const lastSync = localForage.getItem('lastSync')

      //     // if the last sync was before the last update, override the local storage
      //     if (!lastSync || data.lastUpdate < changes['lastUpdate'] || lastSync < changes['lastUpdate']) {
      //       await localForage.clear()
      //       await localForage.setItem('persist:root', data['persist:root'])
      //       await localForage.setItem('lastSync', Date.now())
      //     }
      //   }
      // })
    })
    .catch((e) => {
      console.log('[syncStorage] fallback to local storage', e)
      return StorageAPI.local
    })

  // mirror local storage to sync on a regular schedule
  async function syncLocalStorage(): Promise<void> {
    const lastUpdateLocal: number = await StorageAPI.local.getItem('lastUpdate')
    const lastUpdate = await StorageAPI.sync.getItem('lastUpdate')

    console.log('[syncStorage] triggering local<->sync update')

    // if the local version is more current than the one on sync
    // we want to upload our changes
    if (lastUpdateLocal > lastUpdate) {
      const localData = await StorageAPI.local.getItem('persist:root')

      await Promise.all([
        StorageAPI.sync.setItem('persist:root', localData),
        StorageAPI.sync.setItem('lastUpdate', lastUpdateLocal),
      ])

      console.log('[syncStorage] updated sync storage with local changes')

      return
    }

    // if the sync version is more current than the one locally
    // we want to download remote changes
    if (lastUpdateLocal < lastUpdate) {
      const syncData = await StorageAPI.sync.getItem('persist:root')

      await Promise.all([
        StorageAPI.local.setItem('persist:root', syncData),
        StorageAPI.local.setItem('lastUpdate', lastUpdate),
      ])

      console.log('[syncStorage] updated local storage with remote changes')

      return
    }

    // TODO: evaluate the risk of inconsistencies (if groups edited on two devices simultaneously)
    // if the update timestamps are the same, we could either compare hashes and merge states
    // or we could simply do nothing and wait for the next update (could get inconsistencies)
  }
  setInterval(() => window.requestIdleCallback(syncLocalStorage, { timeout: 5000 }), 30000)

  return {
    getItem: StorageAPI.local.getItem,
    async removeItem(key: string): Promise<void> {
      await Promise.all([
        StorageAPI.local.removeItem(key),
        StorageAPI.local.setItem('lastUpdate', Date.now()),
      ])
    },
    async setItem(key: string, value: any): Promise<void> {
      if (key === 'persist:root') {
        await Promise.all([
          StorageAPI.local.setItem(key, value),
          StorageAPI.local.setItem('lastUpdate', Date.now()),
        ])
      } else {
        StorageAPI.local.setItem(key, value)
      }
    },
  }
}
