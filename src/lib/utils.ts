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

interface IHashResult {
  baseUrl: string
  hash: string
}
export function computeUrlHash(url: string): IHashResult {
  const { origin, pathname } = new URL(url)
  const baseUrl = origin + pathname
  return {
    baseUrl,
    hash: md5(origin + pathname)
  }
}
