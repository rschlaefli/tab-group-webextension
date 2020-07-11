import { DEFAULT_WATSET_CONFIG, DEFAULT_SIMAP_CONFIG } from './settings'

export default {
  4: (state) => ({
    ...state,
    currentTabs: {
      ...state.currentTabs,
      staleTabs: [],
    },
    settings: {
      ...state.settings,
      groupingActivationKey: '',
      heuristicsActiveConfig: 1,
      heuristicsConfigs: [DEFAULT_WATSET_CONFIG, DEFAULT_SIMAP_CONFIG()],
    },
  }),
}
