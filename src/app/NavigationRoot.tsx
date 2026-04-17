import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen';
import { useAuthStore } from '../shared/stores/authStore';
import { WelcomeScreen } from '../features/auth/screens/WelcomeScreen';
import { IslandMapScreen } from '../features/map/screens/IslandMapScreen';
import { IslandLevelSelectScreen } from '../features/map/screens/IslandLevelSelectScreen';
import { LetterLabScreen } from '../features/letterLab/LetterLabScreen';
import { SoundSafariScreen } from '../features/soundSafari/SoundSafariScreen';
import { MemoryMatchScreen } from '../features/memoryMatch/MemoryMatchScreen';
import { LetterRaceScreen } from '../features/letterRace/LetterRaceScreen';
import { ResultsScreen } from '../features/games/shared/ResultsScreen';
import { colors } from './theme/colors';
import type { AuthStackParamList, PlayerStackParamList } from './navigationTypes';

export type { AuthStackParamList, PlayerStackParamList };

// ─── Navigators ───────────────────────────────────────────────────────────────

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const PlayerStack = createNativeStackNavigator<PlayerStackParamList>();

function AuthNavigator(): React.JSX.Element {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    </AuthStack.Navigator>
  );
}

function PlayerNavigator(): React.JSX.Element {
  return (
    <PlayerStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.oceanBlue },
        headerTintColor: colors.cloudWhite,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.cloudWhite },
      }}>
      <PlayerStack.Screen
        name="IslandMap"
        component={IslandMapScreen}
        options={{ headerShown: false }}
      />
      <PlayerStack.Screen
        name="IslandLevelSelect"
        component={IslandLevelSelectScreen}
        options={{ headerShown: false }}
      />
      <PlayerStack.Screen
        name="LetterLab"
        component={LetterLabScreen}
        options={{ headerShown: false }}
      />
      <PlayerStack.Screen
        name="SoundSafari"
        component={SoundSafariScreen}
        options={{ headerShown: false }}
      />
      <PlayerStack.Screen
        name="MemoryMatch"
        component={MemoryMatchScreen}
        options={{ headerShown: false }}
      />
      <PlayerStack.Screen
        name="LetterRace"
        component={LetterRaceScreen}
        options={{ headerShown: false }}
      />
      <PlayerStack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ headerShown: false }}
      />
    </PlayerStack.Navigator>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function NavigationRoot(): React.JSX.Element {
  const status = useAuthStore((s) => s.status);
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Hide the native splash only once auth bootstrap has resolved, so the user
  // never sees the JS loading indicator flash before the first real screen.
  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hide();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.oceanBlue} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {status === 'unauthenticated' ? <AuthNavigator /> : <PlayerNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softSand,
  },
});
