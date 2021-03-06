// import { Tabs } from 'webextension-polyfill-ts'

export enum TAB_ACTION {
  'CREATE' = 'CREATE',
  'UPDATE' = 'UPDATE',
  'MOVE' = 'MOVE',
  'ACTIVATE' = 'ACTIVATE',
  'ATTACH' = 'ATTACH',
  'REMOVE' = 'REMOVE',
  'INIT_TABS' = 'INIT_TABS',
  'INIT_GROUPS' = 'INIT_GROUPS',
  'REFRESH_GROUPS' = 'REFRESH_GROUPS',
  'PAUSE' = 'PAUSE',
  'RESUME' = 'RESUME',
  'DISCARD_TAB' = 'DISCARD_TAB',
  'DISCARD_GROUP' = 'DISCARD_GROUP',
  'ACCEPT_GROUP' = 'ACCEPT_GROUP',
  'ACCEPT_TAB' = 'ACCEPT_TAB',
  'OPEN_GROUP' = 'OPEN_GROUP',
  'CLOSE_GROUP' = 'CLOSE_GROUP',
  'STOP' = 'STOP',
}

export enum HEURISTICS_ACTION {
  'NEW_TAB' = 'NEW_TAB',
  'NOTIFY' = 'NOTIFY',
  'QUERY_TABS' = 'QUERY_TABS',
  'UPDATE_GROUPS' = 'UPDATE_GROUPS',
  'QUERY_GROUPS' = 'QUERY_GROUPS',
  'HEURISTICS_STATUS' = 'HEURISTICS_STATUS',
  'REQUEST_INTERACTION' = 'REQUEST_INTERACTION',
  'STALE_TABS' = 'STALE_TABS',
}

export enum HEURISTICS_STATUS {
  'STARTING' = 'STARTING',
  'ACTIVE' = 'ACTIVE',
  'FAILED' = 'FAILED',
  'DISABLED' = 'DISABLED',
  'RUNNING' = 'RUNNING',
  'ALREADY_RUNNING' = 'ALREADY_RUNNING',
  'STOPPED' = 'STOPPED',
}

export interface ITabGroup {
  id: string
  name: string
  tabs: ITab[]
  readOnly?: boolean
  collapsed: boolean
}

export interface IHeuristicsAction {
  action: HEURISTICS_ACTION
  payload: any
}

export interface ITab {
  // Tabs.Tab properties that are important for grouping
  favIconUrl?: string
  id?: number
  index?: number
  lastAccessed?: number
  openerTabId?: number
  pinned?: boolean
  sessionId?: string
  status?: 'loading' | 'complete'
  successorTabId?: number
  title: string
  url: string
  windowId?: number

  // derived properties
  normalizedTitle?: string
  hash: string | null
  origin?: string
  baseUrl?: string
  displayTitle?: string
}
