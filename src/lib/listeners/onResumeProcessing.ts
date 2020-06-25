import { postNativeMessage } from '../utils'
import { TAB_ACTION } from '@src/types/Extension'

export default function onResumeProcessing(nativePort) {
  return function onResumeProcessingListener(): void {
    console.log('[background] Resuming background processing')
    postNativeMessage(nativePort, {
      action: TAB_ACTION.RESUME,
      payload: {},
    })
  }
}
