/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },

  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/MythikoChorio.app',
      build: [
        'xcodebuild',
        '-workspace ios/MythikoChorio.xcworkspace',
        '-scheme MythikoChorio',
        '-configuration Debug',
        '-sdk iphonesimulator',
        '-derivedDataPath ios/build',
        'LANG=en_US.UTF-8',
      ].join(' '),
    },
  },

  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 17 Pro' },
    },
  },

  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
  },
};
