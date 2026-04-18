/**
 * Picture Hunt — find named objects in a illustrated scene (emoji placeholder).
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../app/navigationTypes';
import type { IslandId } from '../../data/islands/islandConfig';
import { getSceneForIsland } from '../../data/games/pictureHuntScenes';
import type { HuntItem } from '../../data/games/pictureHuntScenes';
import {
  useGameSession,
  useResumeGame,
} from '../games/shared/useGameSession';
import { GameShell } from '../games/shared/GameShell';
import { colors } from '../../app/theme/colors';
import { spacing } from '../../app/theme/spacing';
import { typography } from '../../app/theme/typography';
import { gameStyles } from '../../app/theme/gameStyles';

type Props = NativeStackScreenProps<PlayerStackParamList, 'PictureHunt'>;

function firstTryStars(correct: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 1;
  const pct = (correct / total) * 100;
  if (pct >= 80) return 3;
  if (pct >= 55) return 2;
  return 1;
}

export function PictureHuntScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { islandId, levelId } = route.params;
  const session = useGameSession({
    game: 'pictureHunt',
    islandId,
    levelId,
    navigation,
  });

  const scene = useMemo(
    () => getSceneForIsland(islandId as IslandId),
    [islandId],
  );
  const totalItems = scene.items.length;

  const sessionStartRef = useRef(Date.now());
  const itemStartedAt = useRef(Date.now());
  const [itemIndex, setItemIndex] = useState(0);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [responseMsTotal, setResponseMsTotal] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [missedCurrent, setMissedCurrent] = useState(false);
  const finishedRef = useRef(false);

  const target = scene.items[itemIndex];

  useEffect(() => {
    setMissedCurrent(false);
    setHint(null);
  }, [itemIndex]);

  useResumeGame(
    session,
    (saved) =>
      saved.sceneId === scene.id &&
      (saved.itemIndex > 0 || saved.foundItemIds.length > 0),
    (saved) => {
      setItemIndex(saved.itemIndex);
      setFoundIds(saved.foundItemIds);
      setWrongTaps(saved.wrongTaps);
      setFirstTryCorrect(saved.firstTryCorrect);
      setResponseMsTotal(saved.responseMsTotal);
    },
  );

  useEffect(() => {
    if (session.loading || target?.id == null) return;
    itemStartedAt.current = Date.now();
  }, [session.loading, target?.id]);

  useEffect(() => {
    if (session.loading || finishedRef.current) return;
    session
      .save({
        sceneId: scene.id,
        itemIndex,
        foundItemIds: foundIds,
        wrongTaps,
        firstTryCorrect,
        responseMsTotal,
      })
      .catch(() => {});
  }, [
    session,
    session.loading,
    scene.id,
    itemIndex,
    foundIds,
    wrongTaps,
    firstTryCorrect,
    responseMsTotal,
  ]);

  const persist = useCallback((): void => {
    session
      .save({
        sceneId: scene.id,
        itemIndex,
        foundItemIds: foundIds,
        wrongTaps,
        firstTryCorrect,
        responseMsTotal,
      })
      .catch(() => {});
  }, [
    session,
    scene.id,
    itemIndex,
    foundIds,
    wrongTaps,
    firstTryCorrect,
    responseMsTotal,
  ]);

  const handleExit = useMemo(
    () => session.makeExitHandler(persist),
    [session, persist],
  );

  const handleFinish = useCallback(async (): Promise<void> => {
    finishedRef.current = true;
    const elapsedSecs = Math.max(
      1,
      Math.round((Date.now() - sessionStartRef.current) / 1000),
    );
    const avgTimePerItem =
      totalItems > 0 ? Math.round(responseMsTotal / totalItems) : 0;
    const accuracy = totalItems > 0 ? firstTryCorrect / totalItems : 1;
    const score = Math.round(accuracy * 100);
    const stars = firstTryStars(firstTryCorrect, totalItems);

    await session.finish({
      stars,
      bestScore: score,
      scoreDetails: {
        score,
        accuracy,
        timeSpentSecs: elapsedSecs,
        attempts: totalItems + wrongTaps,
        details: {
          correctFirstTap: firstTryCorrect,
          avgTimePerItem,
          categoryBreakdown: [
            {
              category: scene.category,
              accuracy,
            },
          ],
        },
      },
    });
  }, [
    session,
    firstTryCorrect,
    totalItems,
    wrongTaps,
    responseMsTotal,
    scene.category,
  ]);

  function handleTargetPress(item: HuntItem): void {
    if (!target || finishedRef.current) return;
    if (foundIds.includes(item.id)) return;

    const elapsed = Date.now() - itemStartedAt.current;

    if (item.id !== target.id) {
      setWrongTaps((w) => w + 1);
      setMissedCurrent(true);
      setHint(`Look for "${target.word}" (${target.gloss})`);
      setTimeout(() => setHint(null), 1600);
      return;
    }

    setResponseMsTotal((t) => t + elapsed);
    if (!missedCurrent) {
      setFirstTryCorrect((f) => f + 1);
    }

    setFoundIds((prev) => [...prev, item.id]);

    const next = itemIndex + 1;
    if (next >= totalItems) {
      handleFinish().catch(() => {});
    } else {
      setItemIndex(next);
    }
  }

  const progress = ((itemIndex + 1) / totalItems) * 100;

  return (
    <GameShell
      title="Picture Hunt 🔎"
      onExit={handleExit}
      loading={session.loading}
      saving={session.saving}
      headerExtras={
        <View style={[gameStyles.progressTrack, styles.progressMargin]}>
          <View style={[gameStyles.progressFill, { width: `${progress}%` }]} />
        </View>
      }>
      <View style={styles.body}>
        {target && (
          <View style={styles.prompt}>
            <Text style={styles.promptWord}>{target.word}</Text>
            <Text style={styles.promptGloss}>{target.gloss}</Text>
          </View>
        )}

        <Text style={styles.sceneTitle}>{scene.title}</Text>

        <View style={styles.sceneWrap}>
          <Text style={styles.backdropEmoji}>{scene.backdropEmoji}</Text>
          {scene.items.map((item) => {
              const found = foundIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleTargetPress(item)}
                  style={[
                    styles.hitZone,
                    {
                      left: `${item.hit.x * 100}%`,
                      top: `${item.hit.y * 100}%`,
                      width: `${item.hit.w * 100}%`,
                      height: `${item.hit.h * 100}%`,
                    },
                    found && styles.hitFound,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Find ${item.word}`}>
                  <Text style={[styles.itemEmoji, found && styles.itemEmojiFound]}>
                    {item.emoji}
                  </Text>
                </Pressable>
              );
            })}
        </View>

        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  progressMargin: {
    marginTop: spacing.xs,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    gap: spacing.sm,
  },
  prompt: {
    alignItems: 'center',
    gap: 4,
  },
  promptWord: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
  promptGloss: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
  },
  sceneTitle: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  sceneWrap: {
    flex: 1,
    minHeight: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.softSand,
    position: 'relative',
  },
  backdropEmoji: {
    ...StyleSheet.absoluteFill,
    fontSize: 180,
    textAlign: 'center',
    lineHeight: 320,
    opacity: 0.35,
  },
  hitZone: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitFound: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  itemEmoji: {
    fontSize: 48,
  },
  itemEmojiFound: {
    opacity: 0.5,
  },
  hint: {
    fontSize: typography.fontSize.caption,
    color: colors.error,
    textAlign: 'center',
  },
});
