import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../../app/navigationTypes';
import { GAME_SCREEN } from '../../../data/islands/levelConfig';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';
import { gameStyles } from '../../../app/theme/gameStyles';

type Props = NativeStackScreenProps<PlayerStackParamList, 'Results'>;

const PRAISE = ['Μπράβο! 🎉', 'Υπέροχα! ✨', 'Φανταστικά! 🌟'];

function AnimatedStar({
  filled,
  delayMs,
}: {
  filled: boolean;
  delayMs: number;
}): React.JSX.Element {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delayMs, withSpring(1, { damping: 8, stiffness: 180 }));
  }, [delayMs, scale]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.Text style={[styles.star, animStyle]}>
      {filled ? '⭐' : '☆'}
    </Animated.Text>
  );
}

export function ResultsScreen({ route, navigation }: Props): React.JSX.Element {
  const { stars, levelName, islandId, levelId, gameType } = route.params;
  const praise = PRAISE[stars - 1];

  function handleReplay(): void {
    // Replace the current Results entry with a fresh game screen so the back
    // stack stays [IslandLevelSelect, Game] regardless of whether the user
    // came here from a single play or a repeated Replay chain.
    navigation.replace(GAME_SCREEN[gameType], { islandId, levelId });
  }

  function handleContinue(): void {
    navigation.navigate('IslandLevelSelect', { islandId });
  }

  return (
    <SafeAreaView style={gameStyles.container} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Text style={gameStyles.stepLabel}>{levelName}</Text>

        <View style={styles.starRow}>
          {[1, 2, 3].map((n, i) => (
            <AnimatedStar key={n} filled={n <= stars} delayMs={i * 220} />
          ))}
        </View>

        <Text style={styles.praise}>{praise}</Text>

        {stars === 3 && <Text style={styles.confetti}>🎊🎊🎊</Text>}

        <Text style={styles.hint}>
          {stars === 3
            ? 'Perfect score!'
            : stars === 2
              ? 'Great effort — try again for 3 stars!'
              : 'Keep practising — you can do it!'}
        </Text>

        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [gameStyles.btnSecondary, pressed && gameStyles.btnPressed]}
            onPress={handleReplay}
            accessibilityRole="button"
            accessibilityLabel={`Replay ${levelName}`}>
            <Text style={gameStyles.btnSecondaryText}>↩ Replay</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [gameStyles.btn, pressed && gameStyles.btnPressed]}
            onPress={handleContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue to island">
            <Text style={gameStyles.btnText}>Continue →</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
    gap: spacing.lg,
  },
  starRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  star: {
    fontSize: 64,
  },
  praise: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  confetti: {
    fontSize: 36,
    letterSpacing: 8,
  },
  hint: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
