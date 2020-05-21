// ref: https://github.com/ssorallen/redux-persist-webextension-storage/blob/master/src/createStorage.js

import { browser } from 'webextension-polyfill-ts'
import { Storage } from 'redux-persist'

function createStorageAPI(type: 'sync' | 'local'): Storage {
  return {
    async getItem(key: string): Promise<string> {
      const value = await browser.storage[type].get(key)
      if (browser.runtime.lastError == null) {
        // Chrome Storage returns the value in an Object of with its original key. Unwrap the
        // value from the returned Object to match the `getItem` API.
        return value[key]
      } else {
        throw new Error()
      }
    },
    async removeItem(key: string): Promise<any> {
      await browser.storage[type].remove(key)
      if (browser.runtime.lastError == null) {
        return
      } else {
        throw new Error()
      }
    },
    async setItem(key: string, value: any): Promise<void> {
      await browser.storage[type].set({ [key]: value })
      if (browser.runtime.lastError == null) {
        return
      } else {
        throw new Error()
      }
    },
  }
}

export default {
  local: createStorageAPI('local'),
  sync: createStorageAPI('sync'),
}
