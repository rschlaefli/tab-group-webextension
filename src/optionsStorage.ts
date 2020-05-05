import OptionsSync from 'webext-options-sync'

export default new OptionsSync({
  // specify default settings
  defaults: {
    debugLogging: true,
    enableHeuristics: false,
    openSidebarByDefault: false,
    displayTutorial: true,
  },

  // List of functions that are called when the extension is updated
  migrations: [
    // Integrated utility that drops any properties that don't appear in the defaults
    OptionsSync.migrations.removeUnused,
  ],

  // enable logging for sync storage
  logging: true,
})
