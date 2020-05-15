import currentTabsReducer, {
  createTab,
  activateTab,
  updateTab,
  removeTab,
  collapseCurrentTabs,
} from './currentTabs'
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
    hash: 'abcd',
    origin: '',
    originHash: '',
    baseUrl: 'https://qwertz.ch',
    baseHash: '345',
    title: 'test tab 1',
    favIconUrl: 'xyz',
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
    hash: 'bcde',
    origin: '',
    originHash: '',
    baseUrl: 'https://qwertz.ch',
    baseHash: '345',
    title: 'test tab 2',
    favIconUrl: 'abc',
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
    hash: 'cdef',
    origin: '',
    originHash: '',
    baseUrl: 'https://qwertz.ch',
    baseHash: '345',
    title: 'test tab 3',
    favIconUrl: 'qwertz',
  },
]

describe('currentTabsReducer', () => {
  let currentState: {
    previousTabId: number
    activeTab: number
    activeWindow: number
    tabs: ITab[]
    tabHashes: string[]
    collapsed: boolean
  }

  beforeAll(() => {
    currentState = {
      previousTabId: -1,
      activeTab: -1,
      activeWindow: 0,
      tabs: [],
      tabHashes: [],
      collapsed: false,
    }
  })

  it('should return the initial state', () => {
    currentState = currentTabsReducer(currentState, { type: 'DEFAULT' })

    expect(currentState.tabs).toHaveLength(0)
    expect(currentState.tabHashes).toHaveLength(0)
  })

  it('creates a new tab', () => {
    currentState = currentTabsReducer(currentState, createTab({ tabData: TABS[1] }))

    expect(currentState.tabs).toHaveLength(1)
    expect(currentState.tabs[0].title).toEqual('test tab 2')

    expect(currentState.tabHashes).toMatchInlineSnapshot(`
      Array [
        "bcde",
      ]
    `)
  })

  it('activates the new tab', () => {
    currentState = currentTabsReducer(currentState, activateTab({ tabId: 1 }))

    expect(currentState.activeTab).toEqual(1)
  })

  it('updates the new tab to another url', () => {
    currentState = currentTabsReducer(currentState, updateTab({ tabId: 1, tabData: TABS[2] }))

    expect(currentState.tabs).toHaveLength(1)
    expect(currentState.tabs[0].title).toEqual('test tab 3')

    expect(currentState.tabHashes).toMatchInlineSnapshot(`
      Array [
        "cdef",
      ]
    `)
  })

  it('creates another new tab', () => {
    currentState = currentTabsReducer(currentState, createTab({ tabData: TABS[0] }))

    expect(currentState.tabs).toHaveLength(2)
    expect(currentState.tabHashes).toHaveLength(2)
    expect(currentState.tabs[1].title).toEqual('test tab 1')

    expect(currentState.tabHashes).toMatchInlineSnapshot(`
      Array [
        "cdef",
        "abcd",
      ]
    `)
  })

  it('removes the new tab', () => {
    currentState = currentTabsReducer(currentState, removeTab({ tabId: 2 }))

    expect(currentState.tabs).toHaveLength(1)
    expect(currentState.tabHashes).toHaveLength(1)

    expect(currentState.tabHashes).toMatchInlineSnapshot(`
      Array [
        "abcd",
      ]
    `)
  })

  it('can be collapsed', () => {
    currentState = currentTabsReducer(currentState, collapseCurrentTabs())

    expect(currentState.collapsed).toEqual(true)
  })

  it('can be uncollapsed', () => {
    currentState = currentTabsReducer(currentState, collapseCurrentTabs())

    expect(currentState.collapsed).toEqual(false)
  })
})
