import { browser } from 'webextension-polyfill-ts'
import {
  IHeuristicsAction,
  HEURISTICS_ACTION,
  ITab,
  TAB_ACTION,
  ITabGroup,
} from '@src/types/Extension'
import { updateSuggestedGroups } from '@src/state/suggestions'
import { postNativeMessage, pickRelevantProperties } from '../utils'
import { updateHeuristicsStatus } from '@src/state/settings'
import { updateStaleTabs } from '@src/state/currentTabs'

export default function onNativeMessage({ dispatch, getState }, nativePort) {
  return function onNativeMessageListener(messageFromHeuristics: IHeuristicsAction): void {
    console.log('[background] Received message over native port:', messageFromHeuristics)

    switch (messageFromHeuristics.action) {
      case HEURISTICS_ACTION.REQUEST_INTERACTION:
        browser.tabs.query({ title: 'Tab Groups' }).then((existingTabs) => {
          const extensionTabs = existingTabs.filter((tab) => tab.url?.includes('ui.html'))
          if (extensionTabs.length > 0) {
            browser.tabs.remove(extensionTabs.map((tab) => tab.id).filter((id) => !!id) as number[])
          }
          browser.tabs.create({ url: 'ui.html?interactionRequest=1' })
        })
        break

      case HEURISTICS_ACTION.UPDATE_GROUPS:
        dispatch(updateSuggestedGroups(messageFromHeuristics.payload))
        break

      case HEURISTICS_ACTION.STALE_TABS:
        dispatch(updateStaleTabs(messageFromHeuristics.payload))
        break

      case HEURISTICS_ACTION.NEW_TAB:
        browser.tabs.create({ url: messageFromHeuristics.payload.url })
        break

      case HEURISTICS_ACTION.QUERY_TABS: {
        const currentTabs = getState().currentTabs?.tabs as ITab[]
        console.log('[background] Initializing current tabs in heuristics:', currentTabs)
        postNativeMessage(nativePort, {
          action: TAB_ACTION.INIT_TABS,
          payload: { currentTabs: currentTabs.map(pickRelevantProperties) },
        })
        break
      }

      case HEURISTICS_ACTION.QUERY_GROUPS: {
        const tabGroups = getState().tabGroups as ITabGroup[]
        console.log('[background] Initializing tab groups in heuristics:', tabGroups)
        postNativeMessage(nativePort, {
          action: TAB_ACTION.INIT_GROUPS,
          payload: {
            tabGroups: tabGroups.map((group) => ({
              ...group,
              tabs: group.tabs.map(pickRelevantProperties),
            })),
          },
        })
        break
      }

      case HEURISTICS_ACTION.HEURISTICS_STATUS: {
        console.log(
          '[background] Received status update from heuristics',
          messageFromHeuristics.payload
        )
        dispatch(updateHeuristicsStatus(messageFromHeuristics.payload?.message))
        break
      }
    }
  }
}
