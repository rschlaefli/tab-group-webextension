// ref: https://github.com/ssorallen/redux-persist-webextension-storage/blob/master/src/createStorage.js

import { browser } from 'webextension-polyfill-ts'
import storage from 'redux-persist/lib/storage'

export default function syncStorage(): any {
  browser.storage.sync
    .get()
    .then((data) => console.log('sync storage', data))
    .catch((e) => {
      console.log('local storage', e)
      return storage
    })

  return {
    async getItem(key: string): Promise<string> {
      const value = await browser.storage.sync.get(key)
      if (browser.runtime.lastError == null) {
        console.log(`key ${key} retrieved`, value)
        // Chrome Storage returns the value in an Object of with its original key. Unwrap the
        // value from the returned Object to match the `getItem` API.
        return value[key]
      } else {
        throw new Error()
      }
    },
    async removeItem(key: string): Promise<any> {
      await browser.storage.sync.remove(key)
      if (browser.runtime.lastError == null) {
        console.log(`key ${key} removed`)
        return
      } else {
        throw new Error()
      }
    },
    async setItem(key: string, value: any): Promise<any> {
      await browser.storage.sync.set({ [key]: value })
      if (browser.runtime.lastError == null) {
        console.log(`key ${key} set`, value)
        return
      } else {
        throw new Error()
      }
    },
  }
}
