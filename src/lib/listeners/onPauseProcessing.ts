import { postNativeMessage } from '../utils'
import { pauseHeuristicsProcessing } from '@src/state/settings'

export default function onPauseProcessing({ dispatch }, nativePort) {
  return function onPauseProcessingListener(): void {
    dispatch(pauseHeuristicsProcessing(nativePort))
  }
}
