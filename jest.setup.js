jest.mock('react-native-splash-screen', () => ({
  hide: jest.fn(),
  show: jest.fn(),
}));

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  const Text = require('react-native').Text;
  return {
    __esModule: true,
    default: {
      View,
      Text,
      createAnimatedComponent: component => component,
    },
    useSharedValue: initial => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withSpring: value => value,
    withDelay: (_delay, value) => value,
    withTiming: value => value,
  };
});

jest.mock('@shopify/react-native-skia', () => ({
  Canvas: ({ children }) => children,
  Path: () => null,
  Skia: {
    Path: {
      Make: () => ({
        moveTo: jest.fn(),
        lineTo: jest.fn(),
      }),
    },
  },
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  GestureDetector: ({ children }) => children,
  Gesture: {
    Pan: () => ({
      onStart: () => ({ onUpdate: () => ({ onEnd: () => ({}) }) }),
    }),
  },
}));
