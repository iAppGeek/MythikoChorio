/**
 * Smoke test — verifies the root App component renders without throwing.
 *
 * Navigation and Supabase are mocked at the module level so this test stays
 * fast and doesn't require a running Metro server or network.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: () => null,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-url-polyfill/auto', () => {});
jest.mock('../src/config', () => ({
  config: {
    supabaseUrl: 'https://mock.supabase.co',
    supabaseAnonKey: 'mock-anon-key',
  },
}));
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  }),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({}));

import App from '../App';

test('App renders without throwing', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
