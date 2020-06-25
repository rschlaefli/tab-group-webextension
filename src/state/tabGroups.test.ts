import { Tabs } from 'webextension-polyfill-ts'

import { ITabGroup, ITab } from '@src/types/Extension'
import tabGroupsReducer, {
  updateGroup,
  removeGroup,
  moveTab,
  reorderTab,
  removeTab,
} from './tabGroups'

function expectIdsInGroups(expectedState: number[][], result: ITabGroup[]): void {
  // expect result to have the correct number of groups
  expect(result).toHaveLength(expectedState.length)

  // expect tab ids and their ordering to match across all groups
  for (let i = 0; i < expectedState.length; i++) {
    expect(result[i].tabs.map((tab: ITab) => tab.id)).toStrictEqual(expectedState[i])
  }
}

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

describe('tabGroupsReducer', () => {
  let currentState: ITabGroup[]
  let newGroupId: string

  beforeAll(() => {
    currentState = [
      {
        id: 'current',
        name: 'Current Tabs',
        tabs: TABS,
        collapsed: false,
      },
    ]
  })

  // afterAll(() => {
  //   currentState = null
  // })

  it('should return the initial state', () => {
    const result = tabGroupsReducer(currentState, { type: 'DEFAULT' })

    // expect ids like [[0, 1, 2]
    expectIdsInGroups([[0, 1, 2]], result)
  })

  it('creates a new group', () => {
    const action = updateGroup({})

    currentState = tabGroupsReducer(currentState, action)

    // expect ids like [[0, 1, 2], []]
    expectIdsInGroups([[0, 1, 2], []], currentState)
    newGroupId = currentState[1].id
  })

  it('can change the name of a group', () => {
    const action = updateGroup({ sourceGroupId: 'current', name: 'Current Tabs v2' })

    expect(currentState[0].name).toEqual('Current Tabs')

    currentState = tabGroupsReducer(currentState, action)

    expectIdsInGroups([[0, 1, 2], []], currentState)
    expect(currentState[0].name).toEqual('Current Tabs v2')
  })

  it('moves a tab from current tabs to the new group', () => {
    const action = moveTab({
      sourceGroupId: 'current',
      targetGroupId: newGroupId,
      sourceTabIndex: 0,
      targetTabIndex: 0,
    })

    currentState = tabGroupsReducer(currentState, action)

    // expect ids like [[0, 1, 2], [0]]
    expectIdsInGroups([[0, 1, 2], [0]], currentState)
  })

  it('moves another tab from current tabs to the new group', () => {
    const action = moveTab({
      sourceGroupId: 'current',
      targetGroupId: newGroupId,
      sourceTabIndex: 1,
      targetTabIndex: 0,
    })

    currentState = tabGroupsReducer(currentState, action)

    // expect ids like [[0, 1, 2], [1, 0]]
    expectIdsInGroups(
      [
        [0, 1, 2],
        [1, 0],
      ],
      currentState
    )
  })

  it('reorders tabs within the new group', () => {
    const action = reorderTab({
      sourceGroupId: newGroupId,
      sourceTabIndex: 1,
      targetTabIndex: 0,
    })

    currentState = tabGroupsReducer(currentState, action)

    // expect ids like [[0, 1, 2], [0, 1]]
    expectIdsInGroups(
      [
        [0, 1, 2],
        [0, 1],
      ],
      currentState
    )
  })

  it('removes a tab from the new group', () => {
    const action = removeTab({
      sourceGroupId: newGroupId,
      sourceTabIndex: 0,
    })

    currentState = tabGroupsReducer(currentState, action)

    // expect ids like [[0, 1, 2], [1]]
    expectIdsInGroups([[0, 1, 2], [1]], currentState)
  })

  it('removes the new tab group', () => {
    const action = removeGroup({
      sourceGroupId: newGroupId,
    })

    currentState = tabGroupsReducer(currentState, action)

    // expect ids like [[0, 1, 2]]
    expectIdsInGroups([[0, 1, 2]], currentState)
  })

  it('updates a tab group with a new state', () => {
    const action = updateGroup({
      sourceGroupId: 'current',
      name: 'Replaced Current Tabs',
      tabs: TABS.slice(0, 2),
    })

    currentState = tabGroupsReducer(currentState, action)

    // expect ids like [[0, 1]]
    expectIdsInGroups([[0, 1]], currentState)
  })

  it('collapses a tab group', () => {
    const action = updateGroup({
      sourceGroupId: 'current',
      collapsed: true,
    })

    currentState = tabGroupsReducer(currentState, action)
  })

  it('uncollapsed a tab group', () => {
    const action = updateGroup({
      sourceGroupId: 'current',
      collapsed: false,
    })

    currentState = tabGroupsReducer(currentState, action)
  })
})
