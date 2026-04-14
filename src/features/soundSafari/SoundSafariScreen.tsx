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
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../app/navigationTypes';
import { GREEK_LETTERS } from '../../data/alphabet/letterData';
import type { GreekLetter } from '../../data/alphabet/letterData';
import { upsertLevelProgress } from '../../shared/services/progressService';
import { getLevelsForIsland } from '../../data/islands/levelConfig';
import type { IslandId } from '../../data/islands/islandConfig';
import {
  saveGameProgress,
  loadGameProgress,
  clearGameProgress,
} from '../../shared/services/gameProgressCache';
import { useAuthStore } from '../../shared/stores/authStore';
import { colors } from '../../app/theme/colors';
import { spacing } from '../../app/theme/spacing';
import { typography } from '../../app/theme/typography';

type Props = NativeStackScreenProps<PlayerStackParamList, 'SoundSafari'>;

type AnswerState = 'pending' | 'correct' | 'wrong';

function pickDistractors(correct: GreekLetter): GreekLetter[] {
  const pool = GREEK_LETTERS.filter(l => l.id !== correct.id);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
}

function buildOptions(correct: GreekLetter): GreekLetter[] {
  const distractors = pickDistractors(correct);
  const insertAt = Math.floor(Math.random() * 4);
  const opts = [...distractors];
  opts.splice(insertAt, 0, correct);
  return opts;
}

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
    getLevelsForIsland(islandId as IslandId).find(l => l.id === levelId)
      ?.name ?? levelId;
  const studentProfile = useAuthStore(s => s.studentProfile);
  const profileId = studentProfile?.id ?? 'guest';

  const [roundIndex, setRoundIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('pending');
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const total = GREEK_LETTERS.length;
  const letter = GREEK_LETTERS[roundIndex];
  const options = useMemo(() => buildOptions(letter), [letter]);

  // Restore saved progress on mount
  useEffect(() => {
    loadGameProgress('soundSafari', levelId, profileId)
      .then(saved => {
        if (saved) {
          setRoundIndex(saved.roundIndex);
          setCorrect(saved.correct);
        }
      })
      .finally(() => setLoading(false));
  }, [levelId, profileId]);

  const handleExit = useCallback((): void => {
    Alert.alert(
      'Save & Exit',
      'Your progress has been saved. Continue later?',
      [
        { text: 'Keep Playing', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: (): void => {
            saveGameProgress('soundSafari', levelId, profileId, {
              roundIndex,
              correct,
            }).catch(() => {});
            navigation.goBack();
          },
        },
      ],
    );
  }, [roundIndex, correct, levelId, profileId, navigation]);

  const finishGame = useCallback(
    async (finalCorrect: number): Promise<void> => {
      setSaving(true);
      await clearGameProgress('soundSafari', levelId, profileId);
      const stars = correctionsToStars(finalCorrect, total);
      const score = Math.round((finalCorrect / total) * 100);
      if (studentProfile) {
        try {
          await upsertLevelProgress({
            studentProfileId: studentProfile.id,
            islandId,
            levelId,
            starsEarned: stars,
            bestScore: score,
          });
        } catch {
          // Non-fatal
        }
      }
      setSaving(false);
      navigation.replace('Results', { stars, levelName, islandId, levelId });
    },
    [
      studentProfile,
      islandId,
      levelId,
      levelName,
      profileId,
      total,
      navigation,
    ],
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
        finishGame(newCorrect).catch(() => {});
      } else {
        setRoundIndex(next);
        setAnswerState('pending');
        setChosenId(null);
      }
    }, 1000);
  }

  function optionStyle(opt: GreekLetter): object {
    if (chosenId === opt.id) {
      return answerState === 'correct'
        ? styles.optionCorrect
        : styles.optionWrong;
    }
    if (answerState !== 'pending' && opt.id === letter.id) {
      return styles.optionCorrect;
    }
    return styles.option;
  }

  if (loading || saving) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={colors.oceanBlue}
          style={styles.loader}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.exitBtn}
            onPress={handleExit}
            accessibilityRole="button"
            accessibilityLabel="Save and exit"
          >
            <Text style={styles.exitText}>✕</Text>
          </Pressable>
          <Text style={styles.title}>Sound Safari 🔊</Text>
          <View style={styles.exitBtn} />
        </View>
        <Text style={styles.score}>
          {correct} / {roundIndex} correct
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((roundIndex + 1) / total) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.prompt}>What sound does this letter make?</Text>
        <View style={styles.charCard}>
          <Text style={styles.char}>{letter.char}</Text>
          <Text style={styles.charName}>{letter.greekName}</Text>
        </View>

        <View style={styles.grid}>
          {options.map(opt => (
            <Pressable
              key={opt.id}
              style={({ pressed }) => [
                styles.option,
                optionStyle(opt),
                pressed && answerState === 'pending' && styles.optionPressed,
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
          <Text style={styles.feedback}>
            {answerState === 'correct' ? '🎉 Correct!' : `✗ "${letter.sound}"`}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.softSand },
  loader: { flex: 1 },

  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exitBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitText: {
    fontSize: 18,
    color: '#8A9BAB',
    fontWeight: typography.fontWeight.medium,
  },
  title: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  score: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.sunshineYellow,
    borderRadius: 3,
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
  charCard: {
    backgroundColor: colors.cloudWhite,
    borderRadius: 20,
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
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
  option: {
    backgroundColor: colors.cloudWhite,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    width: '47%',
    alignItems: 'center',
    gap: 4,
  },
  optionPressed: { opacity: 0.75 },
  optionCorrect: {
    backgroundColor: '#D1FAE5',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#10B981',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    width: '47%',
    alignItems: 'center',
    gap: 4,
  },
  optionWrong: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#EF4444',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    width: '47%',
    alignItems: 'center',
    gap: 4,
  },
  optionText: {
    fontSize: typography.fontSize.caption,
    color: '#1E293B',
    textAlign: 'center',
  },
  optionLetter: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },

  feedback: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
});
