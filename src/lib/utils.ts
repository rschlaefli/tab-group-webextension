import md5 from 'blueimp-md5'
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

export function computeUrlHash(url?: string): string {
  if (typeof url === 'undefined') return ''
  const { origin, pathname } = new URL(url)
  return md5(origin + pathname)
}
