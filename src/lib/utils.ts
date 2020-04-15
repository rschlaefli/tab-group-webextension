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
  origin: string
  originHash: string
  baseUrl: string
  baseHash: string
}
export function computeUrlHash(url: string): IHashResult {
  const { origin, pathname } = new URL(url)
  return {
    origin,
    originHash: md5(origin),
    baseUrl: origin + pathname,
    baseHash: md5(origin + pathname)
  }
}

export function augmentTabExtras(tabData: Partial<ITab>): ITab {
  const augmentedTabData: Partial<ITab> = { ...tabData }

  // ensure that no query params can ever be in the title
  if (typeof tabData.title !== 'undefined') {
    try {
      const { origin, pathname } = new URL(tabData.title)
      augmentedTabData.title = origin + pathname
    } catch {}
  }

  if (typeof tabData.baseHash === 'undefined' && tabData.url) {
    const { origin, originHash, baseUrl, baseHash } = computeUrlHash(tabData.url)
    augmentedTabData.origin = origin
    augmentedTabData.originHash = originHash
    augmentedTabData.baseUrl = baseUrl
    augmentedTabData.baseHash = baseHash
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
