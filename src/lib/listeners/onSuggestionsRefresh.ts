import { postNativeMessage } from '../utils'
import { TAB_ACTION } from '@src/types/Extension'
import { Runtime } from 'webextension-polyfill-ts'

export default function onSuggestionsRefresh(nativePort: Runtime.Port) {
  return function onSuggestionsRefreshListener(): void {
    console.log('[background] Forcing suggestions refresh')
    postNativeMessage(nativePort, {
      action: TAB_ACTION.REFRESH_GROUPS,
      payload: {
        algorithm: 'simap',
        parameters: {},
      },
    })
  }
}
