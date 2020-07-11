import { postNativeMessage } from '../utils'
import { resumeHeuristicsProcessing } from '@src/state/settings'

export default function onResumeProcessing({ dispatch }, nativePort) {
  return function onResumeProcessingListener(): void {
    dispatch(resumeHeuristicsProcessing(nativePort))
  }
}
