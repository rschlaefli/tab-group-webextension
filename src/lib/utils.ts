import md5 from 'blueimp-md5'
import { Browser, Runtime } from 'webextension-polyfill-ts'
import { TAB_ACTION, ITab } from '@src/types/Extension'

export const debug = (options: any) => (...content: any[]): void => {
  if (!options || options.debugLogging) console.log(...content)
}

/**
 * Check whether a string is a valid URL
 * @param input an arbitrary string
 */
export function isURL(input: string): boolean {
  const regex = RegExp(
    '(https?:\\/\\/)((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+@]*)*(\\?[;&a-z\\d%_.~+=-@]*)?(\\#[-a-z\\d_@]*)?$',
    'i'
  )

  try {
    return regex.test(input)
  } catch (e) {
    return false
  }
}

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
  baseUrl: string
}

/**
 * Derive the unique hash of a tab given its url and title (if available)
 * @param url the url of a tab
 * @param title the title of a tab
 */
export function computeTabHash(url: string, title?: string): IHashResult {
  let result: Partial<IHashResult> = {}

  const { origin, pathname } = new URL(url)
  result = { origin, baseUrl: origin + pathname }

  if (typeof title !== 'undefined') {
    result['hash'] = md5(result.baseUrl + ' ' + normalizeStringForHashing(title))
  } else {
    result['hash'] = result.hash
  }

  return result as IHashResult
}

/**
 * Augment tab data with extra properties (e.g., hash)
 * @param tabData
 */
export function augmentTabExtras(tabData: Partial<ITab>): ITab {
  const augmentedTabData: Partial<ITab> = { ...tabData }

  // ensure that no query params can ever be in the title
  if (typeof tabData.title !== 'undefined') {
    if (isURL(tabData.title)) {
      const { origin, pathname } = new URL(tabData.title)
      augmentedTabData.title = origin + pathname
    } else {
      augmentedTabData.title = tabData.title
    }
  }

  if (!tabData.hash && tabData.url) {
    const { hash, origin, baseUrl } = computeTabHash(tabData.url, augmentedTabData.title)
    augmentedTabData.hash = hash
    augmentedTabData.origin = origin
    augmentedTabData.baseUrl = baseUrl
  }

  return augmentedTabData as ITab
}

/**
 * Post a message over a native port
 * @param nativePort
 * @param message
 */
export async function postNativeMessage(
  nativePort: Runtime.Port,
  message: { action: TAB_ACTION; payload: any }
): Promise<void> {
  if (!nativePort) {
    console.warn('> Missing native port')
    return Promise.resolve()
  }

  try {
    nativePort.postMessage(message)
    return Promise.resolve()
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}
