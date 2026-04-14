import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import type { GreekLetter } from '../../../data/alphabet/letterData';
import { GREEK_LETTERS } from '../../../data/alphabet/letterData';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';

type Props = {
  letter: GreekLetter;
  onComplete: (correct: boolean) => void;
};

type AnswerState = 'pending' | 'correct' | 'wrong';

/** Seeded-ish shuffle: picks 3 distinct distractors from the pool. */
function pickDistractors(correct: GreekLetter): GreekLetter[] {
  const pool = GREEK_LETTERS.filter((l) => l.id !== correct.id);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

/** Insert correct answer at a random position among the 4 options. */
function buildOptions(correct: GreekLetter): GreekLetter[] {
  const distractors = pickDistractors(correct);
  const insertAt = Math.floor(Math.random() * 4);
  const opts = [...distractors];
  opts.splice(insertAt, 0, correct);
  return opts;
}

export function LetterChallengeStep({
  letter,
  onComplete,
}: Props): React.JSX.Element {
  const options = useMemo(() => buildOptions(letter), [letter]);
  const [answerState, setAnswerState] = useState<AnswerState>('pending');
  const [chosenId, setChosenId] = useState<string | null>(null);

  function handleChoice(chosen: GreekLetter): void {
    if (answerState !== 'pending') return;
    const correct = chosen.id === letter.id;
    setChosenId(chosen.id);
    setAnswerState(correct ? 'correct' : 'wrong');

    setTimeout(() => {
      onComplete(correct);
    }, 1200);
  }

  function optionStyle(opt: GreekLetter): StyleProp<ViewStyle> {
    if (chosenId === opt.id) {
      return answerState === 'correct'
        ? [styles.option, styles.optionCorrect]
        : [styles.option, styles.optionWrong];
    }
    if (answerState !== 'pending' && opt.id === letter.id) {
      return [styles.option, styles.optionCorrect];
    }
    return styles.option;
  }

  function optionTextStyle(opt: GreekLetter): StyleProp<TextStyle> {
    if (chosenId === opt.id || (answerState !== 'pending' && opt.id === letter.id)) {
      return [styles.optionText, styles.optionTextSelected];
    }
    return styles.optionText;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>Letter Challenge</Text>
      <Text style={styles.question}>What is the name of this letter?</Text>

      <View style={styles.charCard}>
        <Text style={styles.char}>{letter.char}</Text>
      </View>

      <View style={styles.grid}>
        {options.map((opt) => (
          <Pressable
            key={opt.id}
            style={({ pressed }) => [
              optionStyle(opt),
              pressed && answerState === 'pending' && styles.optionPressed,
            ]}
            onPress={() => handleChoice(opt)}
            accessibilityRole="button"
            accessibilityLabel={`${opt.name} — ${opt.greekName}`}
            disabled={answerState !== 'pending'}>
            <Text style={optionTextStyle(opt)}>{opt.name}</Text>
            <Text style={styles.optionSubtext}>{opt.greekName}</Text>
          </Pressable>
        ))}
      </View>

      {answerState !== 'pending' && (
        <Text style={styles.feedback}>
          {answerState === 'correct' ? '🎉 Correct!' : `✗ It was ${letter.name}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screen,
    gap: spacing.lg,
  },
  stepLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  question: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.semibold,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  charCard: {
    backgroundColor: colors.cloudWhite,
    borderRadius: 20,
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  char: {
    fontSize: 96,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    lineHeight: 110,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    width: '100%',
  },
  option: {
    backgroundColor: colors.cloudWhite,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    width: '47%',
    alignItems: 'center',
    gap: 2,
  },
  optionPressed: {
    opacity: 0.75,
  },
  optionCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  optionWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.oceanBlue,
  },
  optionTextSelected: {
    color: '#1E293B',
  },
  optionSubtext: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
  },
  feedback: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
});
