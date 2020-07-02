import { useDispatch } from 'react-redux'
import { openInNewTabAlias } from '@src/state/tabGroups'

type UseOpenTab = (url: string, newTab?: boolean) => () => void

export default function useOpenTab(): UseOpenTab {
  const dispatch = useDispatch()

  return (url, newTab = false) => () => {
    if (newTab) {
      dispatch(openInNewTabAlias(url))
    } else {
      if (window.location !== window.parent.location) {
        window.parent.location.replace(url)
      } else {
        window.location.replace(url)
      }
    }
  }
}
