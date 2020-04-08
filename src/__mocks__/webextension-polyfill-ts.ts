/* eslint-disable @typescript-eslint/no-explicit-any */

import { Tabs, Browser } from 'webextension-polyfill-ts'

export const browser: Partial<Browser> = {
  tabs: {
    query(): Promise<Tabs.Tab[]> {
      return Promise.resolve([])
    }
  } as any
}

export const chrome: any = {
  runtime: { id: 'test' }
}
