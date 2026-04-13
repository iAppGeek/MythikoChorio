import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../features/auth/screens/WelcomeScreen';
import { HomeScreen } from '../features/map/HomeScreen';
import { colors } from './theme/colors';

export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function NavigationRoot(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: { backgroundColor: colors.oceanBlue },
          headerTintColor: colors.cloudWhite,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.cloudWhite },
        }}>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Mythiko Chorio' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
