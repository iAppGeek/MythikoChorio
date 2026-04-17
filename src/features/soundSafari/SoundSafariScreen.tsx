/**
 * Sound Safari — Match letters to their sounds.
 *
 * Format: a letter is shown, four sound descriptions are offered as options.
 * One round per letter returned by `getLettersForIsland`.
 * Stars: ≥80% correct → 3, ≥55% → 2, else 1.
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../app/navigationTypes';
import {
  GREEK_LETTERS,
  getLettersForIsland,
} from '../../data/alphabet/letterData';
import type { GreekLetter } from '../../data/alphabet/letterData';
import type { IslandId } from '../../data/islands/islandConfig';
import { buildShuffledOptions } from '../../shared/utils/quizHelpers';
import {
  useGameSession,
  useResumeGame,
} from '../games/shared/useGameSession';
import { GameShell } from '../games/shared/GameShell';
import { colors } from '../../app/theme/colors';
import { spacing } from '../../app/theme/spacing';
import { typography } from '../../app/theme/typography';
import { gameStyles } from '../../app/theme/gameStyles';

type Props = NativeStackScreenProps<PlayerStackParamList, 'SoundSafari'>;

type AnswerState = 'pending' | 'correct' | 'wrong';

function correctionsToStars(correct: number, total: number): 1 | 2 | 3 {
  const pct = (correct / total) * 100;
  if (pct >= 80) return 3;
  if (pct >= 55) return 2;
  return 1;
}

export function SoundSafariScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { islandId, levelId } = route.params;

  const session = useGameSession({
    game: 'soundSafari',
    islandId,
    levelId,
    navigation,
  });

  const [roundIndex, setRoundIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('pending');
  const [chosenId, setChosenId] = useState<string | null>(null);

  const islandLetters = useMemo(
    () => getLettersForIsland(islandId as IslandId),
    [islandId],
  );
  const total = islandLetters.length;
  const letter = islandLetters[roundIndex] ?? islandLetters[0];
  const options = useMemo(
    () => buildShuffledOptions(GREEK_LETTERS, letter, 3),
    [letter],
  );

  useResumeGame(
    session,
    (saved) => saved.roundIndex > 0,
    (saved) => {
      setRoundIndex(saved.roundIndex);
      setCorrect(saved.correct);
    },
  );

  const handleSave = useCallback((): void => {
    session.save({ roundIndex, correct }).catch(() => {});
  }, [session, roundIndex, correct]);

  const handleExit = useMemo(
    () => session.makeExitHandler(handleSave),
    [session, handleSave],
  );

  const handleFinishGame = useCallback(
    async (finalCorrect: number): Promise<void> => {
      const stars = correctionsToStars(finalCorrect, total);
      const score = Math.round((finalCorrect / total) * 100);
      await session.finish({
        stars,
        bestScore: score,
        scoreDetails: {
          score,
          accuracy: finalCorrect / total,
          attempts: total,
        },
      });
    },
    [session, total],
  );

  function handleChoice(chosen: GreekLetter): void {
    if (answerState !== 'pending') return;
    const isCorrect = chosen.id === letter.id;
    setChosenId(chosen.id);
    setAnswerState(isCorrect ? 'correct' : 'wrong');
    const newCorrect = isCorrect ? correct + 1 : correct;
    if (isCorrect) setCorrect(newCorrect);

    setTimeout(() => {
      const next = roundIndex + 1;
      if (next >= total) {
        handleFinishGame(newCorrect).catch(() => {});
      } else {
        setRoundIndex(next);
        setAnswerState('pending');
        setChosenId(null);
      }
    }, 1000);
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

  return (
    <GameShell
      title="Sound Safari 🔊"
      onExit={handleExit}
      loading={session.loading}
      saving={session.saving}
      headerExtras={
        <>
          <Text style={styles.score}>
            {correct} / {roundIndex} correct
          </Text>
          <View style={[gameStyles.progressTrack, styles.progressTrackMargin]}>
            <View
              style={[
                gameStyles.progressFill,
                { width: `${((roundIndex + 1) / total) * 100}%` },
              ]}
            />
          </View>
        </>
      }>
      <View style={styles.body}>
        <Text style={styles.prompt}>What sound does this letter make?</Text>
        <View style={[gameStyles.charCard, styles.charCardSize]}>
          <Text style={styles.char}>{letter.char}</Text>
          <Text style={styles.charName}>{letter.greekName}</Text>
        </View>

        <View style={styles.grid}>
          {options.map((opt) => (
            <Pressable
              key={opt.id}
              style={({ pressed }) => [
                gameStyles.option,
                optionStyle(opt),
                pressed && answerState === 'pending' && gameStyles.optionPressed,
              ]}
              onPress={() => handleChoice(opt)}
              disabled={answerState !== 'pending'}
              accessibilityRole="button"
              accessibilityLabel={opt.sound}>
              <Text style={styles.optionText}>{opt.sound}</Text>
              <Text style={styles.optionLetter}>{opt.char}</Text>
            </Pressable>
          ))}
        </View>

        {answerState !== 'pending' && (
          <Text style={gameStyles.feedback}>
            {answerState === 'correct' ? '🎉 Correct!' : `✗ "${letter.sound}"`}
          </Text>
        )}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  score: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  progressTrackMargin: {
    marginTop: spacing.xs,
  },

  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
    gap: spacing.lg,
  },
  prompt: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.semibold,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  charCardSize: {
    width: 160,
    height: 160,
    gap: spacing.xs,
  },
  char: {
    fontSize: 96,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    lineHeight: 110,
  },
  charName: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    width: '100%',
  },
  optionText: {
    fontSize: typography.fontSize.caption,
    color: colors.textDark,
    textAlign: 'center',
  },
  optionLetter: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
});
