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
    id: 0,
    index: 0,
    windowId: 1,
    pinned: false,
    status: 'complete',
    lastAccessed: 1,
    successorTabId: 1,
    hash: 'abcd',
    origin: '',
    url: 'https://qwertz.ch',
    baseUrl: 'https://qwertz.ch',
    title: 'test tab 1',
    normalizedTitle: 'test tab 1',
    favIconUrl: 'xyz',
  },
  {
    id: 1,
    index: 1,
    windowId: 1,
    pinned: false,
    status: 'complete',
    lastAccessed: 1,
    successorTabId: 2,
    url: 'https://abc.ch',
    hash: 'bcde',
    origin: '',
    baseUrl: 'https://qwertz.ch',
    title: 'test tab 2',
    normalizedTitle: 'test tab 2',
    favIconUrl: 'abc',
  },
  {
    id: 2,
    index: 2,
    windowId: 1,
    pinned: false,
    status: 'complete',
    lastAccessed: 1,
    successorTabId: -1,
    url: 'https://qwertz.ch',
    hash: 'cdef',
    origin: '',
    baseUrl: 'https://qwertz.ch',
    title: 'test tab 3',
    normalizedTitle: 'test tab 3',
    favIconUrl: 'qwertz',
  },
]

describe('currentTabsReducer', () => {
  let currentState: {
    previousTabId: number
    activeTab: number
    activeWindow: number
    tabs: ITab[]
    tabHashes: (string | null)[]
    collapsed: boolean
    recentTabs: ITab[]
    recentTabsCollapsed: boolean
  }

  beforeAll(() => {
    currentState = {
      previousTabId: -1,
      activeTab: -1,
      activeWindow: 0,
      tabs: [],
      tabHashes: [],
      collapsed: false,
      recentTabs: [],
      recentTabsCollapsed: true,
    }
  })

  it('should return the initial state', () => {
    currentState = currentTabsReducer(currentState, { type: 'DEFAULT' })

    expect(currentState.tabs).toHaveLength(0)
    expect(currentState.tabHashes).toHaveLength(0)
    expect(currentState.recentTabs).toHaveLength(0)
  })

  it('creates a new tab', () => {
    currentState = currentTabsReducer(currentState, createTab({ tabData: TABS[1] }))

    expect(currentState.tabs).toHaveLength(1)
    expect(currentState.tabs[0].title).toEqual('test tab 2')
    expect(currentState.recentTabs).toHaveLength(0)

    expect(currentState.tabHashes).toMatchInlineSnapshot(`
      Array [
        "85d49141cd0b73f5e6203c8b2e340b70",
      ]
    `)
  })

  it('activates the new tab', () => {
    currentState = currentTabsReducer(currentState, activateTab({ tabId: 1 }))

    expect(currentState.activeTab).toEqual(1)
    expect(currentState.recentTabs).toHaveLength(0)
  })

  it('updates the new tab to another url', () => {
    currentState = currentTabsReducer(currentState, updateTab({ tabId: 1, tabData: TABS[2] }))

    expect(currentState.tabs).toHaveLength(1)
    expect(currentState.tabs[0].title).toEqual('test tab 3')
    expect(currentState.recentTabs).toHaveLength(0)

    expect(currentState.tabHashes).toMatchInlineSnapshot(`
      Array [
        "839fe8e384092f11a81cc1452e214407",
      ]
    `)
  })

  it('creates another new tab', () => {
    currentState = currentTabsReducer(currentState, createTab({ tabData: TABS[0] }))

    expect(currentState.tabs).toHaveLength(2)
    expect(currentState.tabHashes).toHaveLength(2)
    expect(currentState.tabs[1].title).toEqual('test tab 1')
    expect(currentState.recentTabs).toHaveLength(0)

    expect(currentState.tabHashes).toMatchInlineSnapshot(`
      Array [
        "839fe8e384092f11a81cc1452e214407",
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
    expect(currentState.recentTabs).toHaveLength(1)
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
