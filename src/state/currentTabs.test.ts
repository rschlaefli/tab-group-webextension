import { Tabs } from 'webextension-polyfill-ts'

import currentTabsReducer, { createTab, activateTab, updateTab, removeTab } from './currentTabs'
import { ITab } from '@src/types/Extension'

const TABS: ITab[] = [
  {
    uuid: 'abcd',
    id: 0,
    index: 0,
    windowId: 1,
    highlighted: false,
    active: false,
    attention: false,
    pinned: false,
    status: 'complete',
    hidden: false,
    discarded: false,
    incognito: false,
    width: 1,
    height: 1,
    lastAccessed: 1,
    audible: false,
    mutedInfo: { muted: false },
    isArticle: false,
    isInReaderMode: false,
    sharingState: { camera: false, microphone: false },
    successorTabId: 1,
    url: 'https://xyz.ch',
    baseUrl: 'https://xyz.ch',
    hash: '123',
    title: 'test tab 1',
    favIconUrl: 'xyz'
  },
  {
    uuid: 'bcde',
    id: 1,
    index: 1,
    windowId: 1,
    highlighted: false,
    active: false,
    attention: false,
    pinned: false,
    status: 'complete',
    hidden: false,
    discarded: false,
    incognito: false,
    width: 1,
    height: 1,
    lastAccessed: 1,
    audible: false,
    mutedInfo: { muted: false },
    isArticle: false,
    isInReaderMode: false,
    sharingState: { camera: false, microphone: false },
    successorTabId: 2,
    url: 'https://abc.ch',
    baseUrl: 'https://abc.ch',
    hash: '234',
    title: 'test tab 2',
    favIconUrl: 'abc'
  },
  {
    uuid: 'cdef',
    id: 2,
    index: 2,
    windowId: 1,
    highlighted: false,
    active: false,
    attention: false,
    pinned: false,
    status: 'complete',
    hidden: false,
    discarded: false,
    incognito: false,
    width: 1,
    height: 1,
    lastAccessed: 1,
    audible: false,
    mutedInfo: { muted: false },
    isArticle: false,
    isInReaderMode: false,
    sharingState: { camera: false, microphone: false },
    successorTabId: -1,
    url: 'https://qwertz.ch',
    baseUrl: 'https://qwertz.ch',
    hash: '345',
    title: 'test tab 3',
    favIconUrl: 'qwertz'
  }
]

describe('currentTabsReducer', () => {
  let currentState: {
    previousTabId: number
    activeTab: number
    activeWindow: number
    tabs: ITab[]
  }

  beforeAll(() => {
    currentState = {
      previousTabId: -1,
      activeTab: -1,
      activeWindow: 0,
      tabs: [TABS[0]]
    }
  })

  it('should return the initial state', () => {
    currentState = currentTabsReducer(currentState, { type: 'DEFAULT' })

    expect(currentState.tabs).toHaveLength(1)
  })

  it('creates a new tab', () => {
    currentState = currentTabsReducer(currentState, createTab({ tabData: TABS[1] }))

    expect(currentState.tabs).toHaveLength(2)
    expect(currentState.tabs[1].title).toEqual('test tab 2')
  })

  it('activates the new tab', () => {
    currentState = currentTabsReducer(currentState, activateTab({ tabId: 1 }))

    expect(currentState.activeTab).toEqual(1)
  })

  it('updates the new tab to another url', () => {
    currentState = currentTabsReducer(currentState, updateTab({ tabId: 1, tabData: TABS[2] }))

    expect(currentState.tabs).toHaveLength(2)
    expect(currentState.tabs[1].title).toEqual('test tab 3')
  })

  it('removes the new tab', () => {
    currentState = currentTabsReducer(currentState, removeTab({ tabId: 2 }))

    expect(currentState.tabs).toHaveLength(1)
  })
})
