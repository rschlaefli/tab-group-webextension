import { useState, useEffect } from 'react'
import md5 from 'blueimp-md5'
import { browser, Browser, Runtime } from 'webextension-polyfill-ts'
import { pick } from 'ramda'

import { TAB_ACTION, ITab } from '@src/types/Extension'

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
    return browser
  }

  return Promise.reject('MISSING_EXTENSION_CONTEXT')
}

export async function performBrowserActionSafe(
  func: (browser: Browser) => Promise<void>
): Promise<void> {
  try {
    await func(await getBrowserSafe())
  } catch (e) {
    console.error(e)
  }
}

export function normalizeStringForHashing(input: string): string {
  // replace special characters with spaces
  const normalizedString = input.replace(/[^a-zA-Z ]/g, ' ')

  // replace multiple spaces with single ones
  const compactedString = normalizedString.replace(/\s\s+/g, ' ')

  return compactedString.trim()
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
export function computeTabHash(url?: string, title?: string): IHashResult | null {
  // we only want to hash once we have both the title and url (i.e., after the final UPDATE)
  if (typeof url === 'undefined' || typeof title === 'undefined') {
    return null
  }

  try {
    const { origin, pathname } = new URL(url)
    const baseUrl = origin + pathname

    return {
      origin,
      baseUrl,
      hash: md5(`${baseUrl} ${title}`),
    }
  } catch (e) {
    return {
      origin: 'null',
      baseUrl: 'null',
      hash: md5(`null ${title}`),
    }
  }
}

/**
 * Augment tab data with extra properties (e.g., hash)
 * @param tabData
 */
export function augmentTabExtras(tabData: Partial<ITab>): ITab {
  const augmentedTabData: Partial<ITab> = { ...tabData }

  // ensure that no query params can ever be in the title
  if (tabData.title) {
    if (isURL(tabData.title)) {
      const { origin, pathname } = new URL(tabData.title)
      augmentedTabData.title = origin + pathname
    } else {
      augmentedTabData.title = tabData.title
    }
    augmentedTabData.normalizedTitle = normalizeStringForHashing(augmentedTabData.title)
  }

  const hashResult = computeTabHash(tabData.url, augmentedTabData.normalizedTitle)
  if (hashResult) {
    augmentedTabData.hash = hashResult.hash
    augmentedTabData.origin = hashResult.origin
    augmentedTabData.baseUrl = hashResult.baseUrl
  }

  return augmentedTabData as ITab
}

/**
 * Extract only relevant properties from a tab (to not send favicon etc. to the backend)
 * @param tabData
 */
export function pickRelevantProperties(tabData: Partial<ITab>): Partial<ITab> {
  const relevantProps = [
    'id',
    'index',
    'lastAccessed',
    'openerTabId',
    'pinned',
    'sessionId',
    'successorTabId',
    'title',
    'url',
    'windowId',
    'normalizedTitle',
    'hash',
    'origin',
    'baseUrl',
  ]
  return pick(relevantProps, tabData)
}

/**
 * Post a message over a native port
 * @param nativePort
 * @param message
 */
type MessageContents = { action: TAB_ACTION; payload: any }
type MessageGenerator = () => { action: TAB_ACTION; payload: any }
export async function postNativeMessage(
  nativePort: Runtime.Port,
  message: MessageContents | MessageGenerator
): Promise<void> {
  if (!nativePort) {
    return Promise.resolve()
  }

  try {
    if (typeof message === 'function') {
      const messageContents = message()
      console.info('[currentTabs] Sending lazy message to Heuristics Engine', messageContents)
      nativePort.postMessage(messageContents)
    } else {
      console.info('[currentTabs] Sending message to Heuristics Engine', message)
      nativePort.postMessage(message)
    }
    return Promise.resolve()
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}

type SUPPORTED_BROWSER = 'Chrome' | 'Firefox' | 'Other'
type SUPPORTED_OS = 'Windows' | 'Mac OS' | 'Linux' | 'Other'

export function useBrowserAndOS(): {
  browser: SUPPORTED_BROWSER
  os: SUPPORTED_OS
  setBrowser: (newBrowser: SUPPORTED_BROWSER) => void
  setOS: (newOS: SUPPORTED_OS) => void
} {
  const [browser, setBrowser] = useState<SUPPORTED_BROWSER>('Chrome')
  const [os, setOS] = useState<SUPPORTED_OS>('Windows')

  useEffect(() => {
    if (navigator.userAgent.indexOf('Chrome') != -1) {
      setBrowser('Chrome')
    } else if (navigator.userAgent.indexOf('Firefox') != -1) {
      setBrowser('Firefox')
    } else {
      setBrowser('Other')
    }

    if (navigator.appVersion.indexOf('Win') != -1) {
      setOS('Windows')
    } else if (navigator.appVersion.indexOf('Mac') != -1) {
      setOS('Mac OS')
    } else if (navigator.appVersion.indexOf('X11') != -1 || navigator.appVersion.indexOf('Linux')) {
      setOS('Linux')
    } else {
      setOS('Other')
    }
  }, [])

  return { browser, os, setBrowser, setOS }
}

export async function sendMessageToActiveContentScript(message: string): Promise<void> {
  const activeTabs = await browser.tabs.query({ currentWindow: true, active: true })
  if (activeTabs.length === 1 && activeTabs[0].id) {
    await browser.tabs.sendMessage(activeTabs[0].id, message)
  }
}
