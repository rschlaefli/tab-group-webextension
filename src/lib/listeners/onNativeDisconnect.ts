export default function onNativeDisconnect(...params): void {
  console.warn('[background] Disconnected the native port', params)
}
