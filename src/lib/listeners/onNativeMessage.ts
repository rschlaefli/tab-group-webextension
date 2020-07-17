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
import {
  updateHeuristicsStatus,
  processHeuristicsStatusUpdateAlias,
  processHeuristicsStatusUpdate,
} from '@src/state/settings'
import { updateStaleTabs } from '@src/state/currentTabs'
import { RootState } from '@src/state/configureStore'

const ACTIVATION_KEY =
  'e0375d59d9cbd5b262f5a4947958e96017ba50d1abfdd7b7239f0817138724e0340fb6801366bc59ca10640ca608ff524820310bea50e2d088ed72b97192e110'

export default function onNativeMessage(
  { dispatch, getState }: { dispatch: any; getState: () => RootState },
  nativePort
) {
  return function onNativeMessageListener(messageFromHeuristics: IHeuristicsAction): void {
    console.log('[background] Received message over native port:', messageFromHeuristics)

    switch (messageFromHeuristics.action) {
      case HEURISTICS_ACTION.REQUEST_INTERACTION: {
        const activationKey = getState().settings.groupingActivationKey
        if (activationKey === ACTIVATION_KEY) {
          browser.tabs.query({ title: 'Tab Groups' }).then((existingTabs) => {
            const extensionTabs = existingTabs.filter((tab) => tab.url?.includes('ui.html'))
            if (extensionTabs.length > 0) {
              browser.tabs.remove(
                extensionTabs.map((tab) => tab.id).filter((id) => !!id) as number[]
              )
            }
            browser.tabs.create({ url: 'ui.html?interactionRequest=1' })
          })
        }
        break
      }

      case HEURISTICS_ACTION.UPDATE_GROUPS: {
        dispatch(updateSuggestedGroups(messageFromHeuristics.payload))
        break
      }

      case HEURISTICS_ACTION.STALE_TABS: {
        dispatch(updateStaleTabs(messageFromHeuristics.payload))
        break
      }

      case HEURISTICS_ACTION.NEW_TAB: {
        browser.tabs.create({ url: messageFromHeuristics.payload.url })
        break
      }

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
        dispatch(processHeuristicsStatusUpdate(messageFromHeuristics.payload?.message))
        break
      }
    }
  }
}
