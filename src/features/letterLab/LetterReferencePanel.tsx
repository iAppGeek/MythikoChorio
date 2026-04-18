import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { GreekLetter } from '../../data/alphabet/letterData';
import { playLetterSound } from '../../shared/services/audioService';
import { colors } from '../../app/theme/colors';
import { spacing } from '../../app/theme/spacing';
import { typography } from '../../app/theme/typography';

type Props = {
  letter: GreekLetter;
};

export function LetterReferencePanel({ letter }: Props): React.JSX.Element {
  return (
    <View style={styles.panel}>
      <Text style={styles.hero}>{letter.char}</Text>
      <Text style={styles.greekName}>{letter.greekName}</Text>
      <Text style={styles.soundHint}>{letter.sound}</Text>
      <Text style={styles.strokeHint}>
        {letter.strokes.length} stroke{letter.strokes.length === 1 ? '' : 's'}
      </Text>
      <Pressable
        style={({ pressed }) => [styles.soundBtn, pressed && styles.soundBtnPressed]}
        onPress={() => playLetterSound(letter.id)}
        accessibilityRole="button"
        accessibilityLabel="Play letter sound">
        <Text style={styles.soundBtnText}>🔊 Hear it</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.softSand,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  hero: {
    fontSize: 96,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  greekName: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.semibold,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  soundHint: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  strokeHint: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  soundBtn: {
    marginTop: spacing.sm,
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.oceanBlue,
  },
  soundBtnPressed: {
    opacity: 0.85,
  },
  soundBtnText: {
    color: colors.cloudWhite,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.body,
  },
});
