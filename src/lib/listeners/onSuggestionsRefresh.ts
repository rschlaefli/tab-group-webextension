import { postNativeMessage } from '../utils'
import { TAB_ACTION } from '@src/types/Extension'
import { Runtime } from 'webextension-polyfill-ts'
import { RootState } from '@src/state/configureStore'

export default function onSuggestionsRefresh({ getState }, nativePort: Runtime.Port) {
  return function onSuggestionsRefreshListener(): void {
    const state: RootState = getState()

    let heuristicsConfig = {}
    try {
      heuristicsConfig = state.settings.heuristicsConfigs[state.settings.heuristicsActiveConfig]
    } catch (e) {
      console.error(e)
    }

    console.log(`[background] Forcing suggestions refresh with parameters`, heuristicsConfig)

    postNativeMessage(nativePort, {
      action: TAB_ACTION.REFRESH_GROUPS,
      payload: heuristicsConfig,
    })
  }
}
