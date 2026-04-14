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
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';

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
  const { stars, levelName, islandId } = route.params;
  const praise = PRAISE[stars - 1];

  function handleReplay(): void {
    // Pop Results, then the game screen navigates fresh — go back twice
    navigation.pop(2);
  }

  function handleContinue(): void {
    // Go back to IslandLevelSelect, which will re-fetch progress on focus
    navigation.navigate('IslandLevelSelect', { islandId });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Text style={styles.levelName}>{levelName}</Text>

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
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
            onPress={handleReplay}
            accessibilityRole="button"
            accessibilityLabel={`Replay ${levelName}`}>
            <Text style={styles.btnSecondaryText}>↩ Replay</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={handleContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue to island">
            <Text style={styles.btnText}>Continue →</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.softSand,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
    gap: spacing.lg,
  },
  levelName: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  btn: {
    backgroundColor: colors.oceanBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: {
    color: colors.cloudWhite,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
  },
  btnSecondary: {
    borderWidth: 2,
    borderColor: colors.oceanBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: colors.oceanBlue,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  pressed: {
    opacity: 0.75,
  },
});
