import OptionsSync from 'webext-options-sync'

export default new OptionsSync({
  // specify default settings
  defaults: {
    debugLogging: true as boolean,
    enableHeuristics: false as boolean,
    tutorialProgress: 0,
  },

  // List of functions that are called when the extension is updated
  migrations: [
    // Integrated utility that drops any properties that don't appear in the defaults
    OptionsSync.migrations.removeUnused,
  ],

  // enable logging for sync storage
  logging: true,
})
