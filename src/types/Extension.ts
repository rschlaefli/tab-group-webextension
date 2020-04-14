import { Tabs } from 'webextension-polyfill-ts'

export enum TAB_ACTION {
  'CREATE' = 'CREATE',
  'UPDATE' = 'UPDATE',
  'MOVE' = 'MOVE',
  'ACTIVATE' = 'ACTIVATE',
  'ATTACH' = 'ATTACH',
  'REMOVE' = 'REMOVE',
  'QUERY_TABS' = 'QUERY_TABS'
}

export enum HEURISTICS_ACTION {
  'NEW_TAB' = 'NEW_TAB',
  'NOTIFY' = 'NOTIFY'
}

export interface ITabGroup {
  id: string
  name: string
  tabs: ITab[]
  readOnly?: boolean
}

export interface IHeuristicsAction {
  action: HEURISTICS_ACTION
  payload: any
}

export interface ITab extends Tabs.Tab {
  baseUrl: string
  hash: string
  uuid?: string
}
