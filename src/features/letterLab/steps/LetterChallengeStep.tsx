import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import type { GreekLetter } from '../../../data/alphabet/letterData';
import { GREEK_LETTERS } from '../../../data/alphabet/letterData';
import { buildShuffledOptions } from '../../../shared/utils/quizHelpers';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';
import { gameStyles } from '../../../app/theme/gameStyles';

type Props = {
  letter: GreekLetter;
  onComplete: (correct: boolean) => void;
};

type AnswerState = 'pending' | 'correct' | 'wrong';

export function LetterChallengeStep({
  letter,
  onComplete,
}: Props): React.JSX.Element {
  const options = useMemo(() => buildShuffledOptions(GREEK_LETTERS, letter, 3), [letter]);
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
        ? [gameStyles.option, gameStyles.optionCorrect]
        : [gameStyles.option, gameStyles.optionWrong];
    }
    if (answerState !== 'pending' && opt.id === letter.id) {
      return [gameStyles.option, gameStyles.optionCorrect];
    }
    return gameStyles.option;
  }

  function optionTextStyle(opt: GreekLetter): StyleProp<TextStyle> {
    if (chosenId === opt.id || (answerState !== 'pending' && opt.id === letter.id)) {
      return [styles.optionText, styles.optionTextSelected];
    }
    return styles.optionText;
  }

  return (
    <View style={gameStyles.stepBody}>
      <Text style={gameStyles.stepLabel}>Letter Challenge</Text>
      <Text style={styles.question}>What is the name of this letter?</Text>

      <View style={[gameStyles.charCard, styles.charCardSize]}>
        <Text style={styles.char}>{letter.char}</Text>
      </View>

      <View style={styles.grid}>
        {options.map((opt) => (
          <Pressable
            key={opt.id}
            style={({ pressed }) => [
              optionStyle(opt),
              pressed && answerState === 'pending' && gameStyles.optionPressed,
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
        <Text style={gameStyles.feedback}>
          {answerState === 'correct' ? '🎉 Correct!' : `✗ It was ${letter.name}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.semibold,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  charCardSize: {
    width: 140,
    height: 140,
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
  optionText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.oceanBlue,
  },
  optionTextSelected: {
    color: colors.textDark,
  },
  optionSubtext: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
  },
});
