import { postNativeMessage } from '../utils'
import { refreshSuggestedGroups } from '@src/state/suggestions'

export default function onSuggestionsRefresh({ dispatch }) {
  return function onSuggestionsRefreshListener(): void {
    dispatch(refreshSuggestedGroups())
  }
}
