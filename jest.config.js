// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // All imported modules in your tests should be mocked automatically
  // automock: false,
  // Stop running tests after `n` failures
  // bail: 0,
  // Automatically clear mock calls and instances between every test
  // clearMocks: true,
  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: null,
  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: null,
  // A set of global variables that need to be available in all test environments
  // globals: {},
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1'
  },
  // Activates notifications for test results
  // notify: false,
  // An enum that specifies notification mode. Requires { notify: true }
  // notifyMode: "failure-change",
  // A preset that is used as a base for Jest's configuration
  // preset: null,
  // Use this configuration option to add custom reporters to Jest
  // reporters: undefined,
  // Automatically reset mock state between every test
  // resetMocks: false,
  // Automatically restore mock state between every test
  // restoreMocks: false,
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src'],
  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFiles: [],
  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  // setupFilesAfterEnv: [],
  // A list of paths to snapshot serializer modules Jest should use for snapshot testing
  // snapshotSerializers: [],
  // The test environment that will be used for testing
  // testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '\\.tsx?$': 'ts-jest'
  }
}
