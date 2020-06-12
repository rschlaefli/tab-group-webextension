import { postNativeMessage } from '../utils'
import { TAB_ACTION } from '@src/types/Extension'

export default function onIdleStateChanged(nativePort) {
  return function onIdleStateChangedListener([newState]: [string]): void {
    console.log('[background] Idle state changed to ', newState)
    if (newState === 'idle' || newState === 'locked') {
      postNativeMessage(nativePort, {
        action: TAB_ACTION.PAUSE,
        payload: {},
      })
    } else if (newState === 'active') {
      postNativeMessage(nativePort, {
        action: TAB_ACTION.RESUME,
        payload: {},
      })
    }
  }
}
