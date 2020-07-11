import { DEFAULT_WATSET_CONFIG, DEFAULT_SIMAP_CONFIG } from './settings'

export default {
  1: (state) => {
    return {
      ...state,
      currentTabs: {
        ...state.currentTabs,
        staleTabs: [],
      },
      settings: {
        ...state.settings,
        heuristicsActiveConfig: 1,
        heuristicsConfigs: [DEFAULT_WATSET_CONFIG, DEFAULT_SIMAP_CONFIG()],
      },
    }
  },
}
