import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { GreekLetter } from '../../../data/alphabet/letterData';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';
import { gameStyles } from '../../../app/theme/gameStyles';

type Props = {
  letter: GreekLetter;
  onComplete: () => void;
};

export function MeetTheLetterStep({ letter, onComplete }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={gameStyles.stepLabel}>Meet the Letter</Text>

      <View style={styles.card}>
        <Text style={styles.char}>{letter.char}</Text>
        <Text style={styles.name}>{letter.greekName}</Text>
        <Text style={styles.romanName}>{letter.name}</Text>
        <View style={styles.divider} />
        <Text style={styles.soundLabel}>Sounds</Text>
        <Text style={styles.sound}>{letter.sound}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [gameStyles.btn, styles.btnWide, pressed && gameStyles.btnPressed]}
        onPress={onComplete}
        accessibilityRole="button"
        accessibilityLabel="Continue to next step">
        <Text style={gameStyles.btnText}>Next →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screen,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.cloudWhite,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  char: {
    fontSize: 120,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    lineHeight: 140,
  },
  name: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
  romanName: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: colors.sunshineYellow,
    borderRadius: 1,
    marginVertical: spacing.xs,
  },
  soundLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sound: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  btnWide: {
    minWidth: 160,
  },
});
