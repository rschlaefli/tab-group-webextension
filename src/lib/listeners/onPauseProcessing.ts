import { postNativeMessage } from '../utils'
import { TAB_ACTION } from '@src/types/Extension'

export default function onPauseProcessing(nativePort) {
  return function onPauseProcessingListener(): void {
    console.log('[background] Pausing background processing')
    postNativeMessage(nativePort, {
      action: TAB_ACTION.PAUSE,
      payload: {},
    })
  }
}
