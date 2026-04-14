module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-splash-screen|react-native-gesture-handler|react-native-safe-area-context|react-native-reanimated|react-native-worklets|react-native-screens|@react-navigation|react-native-url-polyfill|@react-native-async-storage|@shopify/react-native-skia|react-native-sound|react-native-responsive-screen|react-native-svg|react-native-config)/)',
  ],
  setupFiles: ['./jest.setup.js'],
};
