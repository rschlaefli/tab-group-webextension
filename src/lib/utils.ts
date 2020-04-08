import { Browser } from 'webextension-polyfill-ts'

export function hasExtensionContext(): boolean {
  return !(typeof chrome != 'object' || !chrome || !chrome.runtime || !chrome.runtime.id)
}

export async function getBrowserSafe(): Promise<Browser> {
  if (hasExtensionContext()) {
    const { browser } = await require('webextension-polyfill-ts')
    return Promise.resolve(browser)
  }

  return Promise.reject('MISSING_EXTENSION_CONTEXT')
}
