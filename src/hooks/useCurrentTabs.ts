import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Tabs, Browser } from 'webextension-polyfill-ts'

import { getBrowserSafe } from '@src/lib/utils'
import { updateGroup } from '@src/state/tabGroups'

function useCurrentTabs(): void {
  const dispatch = useDispatch()

  useEffect(() => {
    async function queryTabs(browser: Browser): Promise<void> {
      // query for all browser tabs that are currently open
      const tabs = await browser.tabs.query({})

      // filter tabs to only get visible ones
      // firefox can hide tabs that have been closed but might be reopened soon
      const visibleTabs = tabs.filter((tab: Tabs.Tab) => !tab.hidden)

      // initialize the current tabs group
      dispatch(
        updateGroup({
          sourceGroupId: 'current',
          name: 'Current Tabs',
          tabs: visibleTabs,
          readOnly: true,
        })
      )
    }

    // try querying for tabs
    getBrowserSafe().then(queryTabs)
  }, [dispatch])
}

export default useCurrentTabs
