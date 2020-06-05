import {
  IHeuristicsAction,
  HEURISTICS_ACTION,
  ITab,
  TAB_ACTION,
  ITabGroup,
} from '@src/types/Extension'
import { updateSuggestedGroups } from '@src/state/suggestions'
import { postNativeMessage, pickRelevantProperties } from '../utils'

export default function onNativeMessage({ dispatch, getState }, nativePort) {
  return function onNativeMessageListener(messageFromHeuristics: IHeuristicsAction) {
    console.log('[background] Received message over native port:', messageFromHeuristics)

    switch (messageFromHeuristics.action) {
      case HEURISTICS_ACTION.UPDATE_GROUPS:
        dispatch(updateSuggestedGroups(messageFromHeuristics.payload))
        break

      case HEURISTICS_ACTION.NEW_TAB:
        browser.tabs.create({ url: messageFromHeuristics.payload.url })
        break

      case HEURISTICS_ACTION.NOTIFY:
        browser.notifications.create('heuristics-notify', {
          title: 'New Event',
          type: 'basic',
          message: messageFromHeuristics.payload.message,
          iconUrl:
            'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
        })
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
    }
  }
}
