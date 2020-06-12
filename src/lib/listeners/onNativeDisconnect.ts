import { toggleHeuristicsBackend } from '@src/state/settings'
export default function onNativeDisconnect({ dispatch }) {
  return function onNativeDisconnectListener(port): void {
    console.warn('[background] Disconnected the native port', port)
    dispatch(toggleHeuristicsBackend() as any)
  }
}
