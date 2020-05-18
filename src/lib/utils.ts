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

export function performBrowserActionSafe(func: (browser: Browser) => void): Function {
  return async (): Promise<void> => {
    try {
      func(await getBrowserSafe())
    } catch (e) {}
  }
}

export function normalizeStringForHashing(input: string): string {
  // replace special characters with spaces
  const normalizedString = input.replace(/[^a-zA-Z ]/g, ' ')

  // replace multiple spaces with single ones
  const compactedString = normalizedString.replace(/\s\s+/g, ' ')

  return compactedString
}

interface IHashResult {
  hash: string
  origin: string
  originHash: string
  baseUrl: string
  baseHash: string
}
export function computeTabHash(url: string, title?: string): IHashResult {
  let result: Partial<IHashResult> = {}

  const { origin, pathname } = new URL(url)
  result = {
    origin,
    originHash: md5(origin),
    baseUrl: origin + pathname,
    baseHash: md5(origin + pathname),
  }

  if (typeof title !== 'undefined') {
    result['hash'] = md5(result.baseUrl + ' ' + normalizeStringForHashing(title))
  } else {
    result['hash'] = result.hash
  }

  return result as IHashResult
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
    const { hash, origin, originHash, baseUrl, baseHash } = computeTabHash(
      tabData.url,
      tabData.title
    )
    augmentedTabData.hash = hash
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
  if (!nativePort) return Promise.resolve()
  try {
    nativePort.postMessage(message)
    return Promise.resolve()
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}
