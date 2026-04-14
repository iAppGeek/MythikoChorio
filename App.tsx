import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SplashScreen from 'react-native-splash-screen';
import { NavigationRoot } from './src/app/NavigationRoot';

const SPLASH_MIN_MS = 2500;

function App(): React.JSX.Element {
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationRoot />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  root: { flex: 1 },
});
