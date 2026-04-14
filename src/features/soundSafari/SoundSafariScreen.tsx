/**
 * Sound Safari — Match letters to their sounds.
 *
 * Format: a letter is shown, 4 sound descriptions are offered as options.
 * One round per letter in the alphabet (Α–Μ, 12 rounds).
 * Stars: ≥80% correct → 3, ≥55% → 2, else 1.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../app/navigationTypes';
import { GREEK_LETTERS } from '../../data/alphabet/letterData';
import type { GreekLetter } from '../../data/alphabet/letterData';
import { getLevelsForIsland } from '../../data/islands/levelConfig';
import type { IslandId } from '../../data/islands/islandConfig';
import {
  saveGameProgress,
  loadGameProgress,
} from '../../shared/services/gameProgressCache';
import { buildShuffledOptions } from '../../shared/utils/quizHelpers';
import { finishGame } from '../../shared/utils/finishGame';
import { useExitConfirmation } from '../../shared/hooks/useExitConfirmation';
import { useAuthStore } from '../../shared/stores/authStore';
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
  const levelName =
    getLevelsForIsland(islandId as IslandId).find((l) => l.id === levelId)
      ?.name ?? levelId;
  const studentProfile = useAuthStore((s) => s.studentProfile);
  const profileId = studentProfile?.id ?? 'guest';

  const [roundIndex, setRoundIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('pending');
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const total = GREEK_LETTERS.length;
  const letter = GREEK_LETTERS[roundIndex];
  const options = useMemo(
    () => buildShuffledOptions(GREEK_LETTERS, letter, 3),
    [letter],
  );

  // Restore saved progress on mount
  useEffect(() => {
    loadGameProgress('soundSafari', levelId, profileId)
      .then((saved) => {
        if (saved) {
          setRoundIndex(saved.roundIndex);
          setCorrect(saved.correct);
        }
      })
      .finally(() => setLoading(false));
  }, [levelId, profileId]);

  const handleSave = useCallback((): void => {
    saveGameProgress('soundSafari', levelId, profileId, {
      roundIndex,
      correct,
    }).catch(() => {});
  }, [roundIndex, correct, levelId, profileId]);

  const handleExit = useExitConfirmation(navigation, handleSave);

  const handleFinishGame = useCallback(
    async (finalCorrect: number): Promise<void> => {
      const stars = correctionsToStars(finalCorrect, total);
      const score = Math.round((finalCorrect / total) * 100);
      await finishGame({
        game: 'soundSafari',
        levelId,
        profileId,
        studentProfileId: studentProfile?.id,
        islandId,
        stars,
        bestScore: score,
        setSaving,
        onComplete: () =>
          navigation.replace('Results', { stars, levelName, islandId, levelId }),
      });
    },
    [studentProfile, islandId, levelId, levelName, profileId, total, navigation],
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

  if (loading || saving) {
    return (
      <SafeAreaView style={gameStyles.container}>
        <ActivityIndicator
          size="large"
          color={colors.oceanBlue}
          style={gameStyles.loader}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={gameStyles.container} edges={['top', 'bottom']}>
      <View style={gameStyles.header}>
        <View style={gameStyles.headerRow}>
          <Pressable
            style={gameStyles.exitBtn}
            onPress={handleExit}
            accessibilityRole="button"
            accessibilityLabel="Save and exit"
          >
            <Text style={gameStyles.exitText}>✕</Text>
          </Pressable>
          <Text style={gameStyles.title}>Sound Safari 🔊</Text>
          <View style={gameStyles.exitBtn} />
        </View>
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
      </View>

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
              accessibilityLabel={opt.sound}
            >
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
    </SafeAreaView>
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
