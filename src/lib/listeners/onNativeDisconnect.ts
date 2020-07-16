import { disableHeuristicsBackend } from '@src/state/settings'
import { updateHeuristicsConnectionEstablished } from '@src/state/tutorial'
export default function onNativeDisconnect({ dispatch }) {
  return function onNativeDisconnectListener(port): void {
    console.warn('[background] Disconnected the native port', port)
    dispatch(disableHeuristicsBackend() as any)
    dispatch(updateHeuristicsConnectionEstablished({ error: 'DISCONNECT' }))
  }
}
