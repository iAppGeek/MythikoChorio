import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../app/theme/colors';
import { spacing } from '../../app/theme/spacing';
import { typography } from '../../app/theme/typography';

type Props = {
  route: { params: { islandId: string; levelId: string } };
};

/**
 * Temporary placeholder for game screens not yet implemented.
 * Replace each entry in NavigationRoot once the real screen is built.
 */
export function GamePlaceholderScreen({ route }: Props): React.JSX.Element {
  const { levelId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🚧</Text>
        <Text style={styles.title}>Coming soon</Text>
        <Text style={styles.levelId}>{levelId}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.softSand,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
  levelId: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
  },
});
