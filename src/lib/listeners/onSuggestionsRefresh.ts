import { postNativeMessage } from '../utils'
import { TAB_ACTION } from '@src/types/Extension'

export default function onSuggestionsRefresh(nativePort) {
  return function onSuggestionsRefreshListener(): void {
    console.log('[background] Forcing suggestions refresh')
    postNativeMessage(nativePort, {
      action: TAB_ACTION.REFRESH_GROUPS,
      payload: {},
    })
  }
}
