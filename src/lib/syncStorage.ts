// ref: https://github.com/ssorallen/redux-persist-webextension-storage/blob/master/src/createStorage.js

import { browser } from 'webextension-polyfill-ts'
import { Storage } from 'redux-persist'
import { omit } from 'ramda'

import StorageAPI from './storageAPI'
import { persistor, bootstrap } from '@src/background'

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
  // browser.storage.sync.clear()
  browser.storage.sync
    .get()
    .then(async (data: any) => {
      const currentState = JSON.parse(await StorageAPI.local.getItem('persist:root')) || {}
      const lastUpdate = await StorageAPI.local.getItem('lastUpdate')

      console.log(
        `[syncStorage] sync data available (local: ${lastUpdate}, sync: ${data.lastUpdate})`,
        data
      )

      if (data.lastUpdate && lastUpdate < data.lastUpdate) {
        const { tabGroups, settings, _persist: persistState } = data

        const mergedData = Object.assign({}, currentState, {
          tabGroups,
          settings,
          _persist: persistState,
        })

        await StorageAPI.local.setItem('persist:root', mergedData)
        await StorageAPI.local.setItem('lastUpdate', data.lastUpdate)

        console.log('[syncStorage] hydrated latest state from sync data', mergedData)
      }

      console.log('[syncStorage] resuming redux persistor')
      persistor?.persist()

      bootstrap()

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
    const lastUpdateSync = await StorageAPI.sync.getItem('lastUpdate')

    console.log(
      `[syncStorage] triggering local<->sync update (local: ${lastUpdateLocal}, sync: ${lastUpdateSync}`
    )

    // if the local version is more current than the one on sync
    // we want to upload our changes
    const localData = JSON.parse(await StorageAPI.local.getItem('persist:root'))
    if (typeof lastUpdateSync === 'undefined' || lastUpdateLocal > lastUpdateSync) {
      console.log('[syncStorage] persisting data', localData)

      const { tabGroups, settings, _persist: persistState } = localData

      await Promise.all([
        StorageAPI.sync.setItem('tabGroups', tabGroups),
        StorageAPI.sync.setItem('settings', settings),
        StorageAPI.sync.setItem('persistState', persistState),
      ])

      await StorageAPI.sync.setItem('lastUpdate', lastUpdateLocal)

      console.log('[syncStorage] updated sync storage with local changes')

      return
    }

    // if the sync version is more current than the one locally
    // we want to download remote changes
    if (typeof lastUpdateLocal === 'undefined' || lastUpdateLocal < lastUpdateSync) {
      const [settings, tabGroups, persistState] = await Promise.all([
        StorageAPI.sync.getItem('settings'),
        StorageAPI.sync.getItem('tabGroups'),
        StorageAPI.sync.getItem('persistState'),
      ])

      const mergedData = Object.assign({}, localData, {
        settings,
        tabGroups,
        _persist: persistState,
      })

      await StorageAPI.local.setItem('persist:root', mergedData)
      await StorageAPI.local.setItem('lastUpdate', lastUpdateSync)

      console.log('[syncStorage] updated local storage with remote changes')

      return
    }

    // TODO: evaluate the risk of inconsistencies (if groups edited on two devices simultaneously)
    // if the update timestamps are the same, we could either compare hashes and merge states
    // or we could simply do nothing and wait for the next update (could get inconsistencies)
  }
  setInterval(() => window.requestIdleCallback(syncLocalStorage, { timeout: 5000 }), 10000)

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
