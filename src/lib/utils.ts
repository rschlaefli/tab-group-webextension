import md5 from 'blueimp-md5'
import { Browser, Runtime } from 'webextension-polyfill-ts'
import { TAB_ACTION, ITab } from '@src/types/Extension'
import { v4 as uuidv4 } from 'uuid'

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

export function augmentTabExtras(tabData: Partial<ITab>): ITab {
  const augmentedTabData: Partial<ITab> = { ...tabData }
  if (typeof tabData.hash === 'undefined' && tabData.url) {
    const { baseUrl, hash } = computeUrlHash(tabData.url)
    augmentedTabData.baseUrl = baseUrl
    augmentedTabData.hash = hash
  }
  if (typeof tabData.uuid === 'undefined') {
    augmentedTabData.uuid = uuidv4()
  }
  return augmentedTabData as ITab
}

export async function postNativeMessage(
  nativePort: Runtime.Port,
  message: { action: TAB_ACTION; payload: any }
): Promise<void> {
  try {
    nativePort.postMessage(message)
    return Promise.resolve()
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}
