import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../../app/navigationTypes';
import { useAuthStore } from '../../../shared/stores/authStore';
import { ISLANDS, getUnlockedIslands } from '../../../data/islands/islandConfig';
import type { Island, IslandId } from '../../../data/islands/islandConfig';
import { isIslandCleared } from '../../../data/islands/levelConfig';
import { getAllProgress } from '../../../shared/services/progressService';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';

const MAP_HEIGHT = 1920;
const ISLAND_SIZE = 88;

type Props = {
  navigation: NativeStackNavigationProp<PlayerStackParamList, 'IslandMap'>;
};

// ─── Island marker ────────────────────────────────────────────────────────────

type IslandMarkerProps = {
  island: Island;
  unlocked: boolean;
  x: number;
  onPress: () => void;
};

function IslandMarker({
  island,
  unlocked,
  x,
  onPress,
}: IslandMarkerProps): React.JSX.Element {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn(): void {
    if (!unlocked) return;
    scale.value = withSpring(0.88, { damping: 10, stiffness: 300 });
  }

  function handlePressOut(): void {
    scale.value = withSpring(1, { damping: 8, stiffness: 200 });
  }

  return (
    <Animated.View
      style={[
        styles.islandMarkerWrapper,
        { left: x - ISLAND_SIZE / 2, top: island.position.y },
        animatedStyle,
      ]}>
      <Pressable
        onPress={unlocked ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={
          unlocked ? `Play ${island.name}` : `${island.name} — locked`
        }
        accessibilityState={{ disabled: !unlocked }}>
        <View
          style={[
            styles.islandCircle,
            unlocked ? styles.islandUnlocked : styles.islandLocked,
          ]}>
          <Text style={styles.islandEmoji}>{island.emoji}</Text>
          {!unlocked && <Text style={styles.lockIcon}>🔒</Text>}
        </View>
        <Text
          style={[
            styles.islandLabel,
            !unlocked && styles.islandLabelLocked,
          ]}
          numberOfLines={1}>
          {island.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function IslandMapScreen({ navigation }: Props): React.JSX.Element {
  const { width } = useWindowDimensions();
  const studentProfile = useAuthStore((s) => s.studentProfile);
  const [clearedIslands, setClearedIslands] = useState<Set<IslandId>>(
    () => new Set(),
  );
  const [progressError, setProgressError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [streakMilestone, setStreakMilestone] = useState<number | null>(null);
  const lastMilestoneRef = useRef<number | null>(null);

  useEffect(() => {
    const d = studentProfile?.streak_days;
    if (d == null) return;
    if (d === 7 || d === 30) {
      if (lastMilestoneRef.current !== d) {
        setStreakMilestone(d);
        lastMilestoneRef.current = d;
      }
    }
  }, [studentProfile?.streak_days]);

  useFocusEffect(
    useCallback(() => {
      if (!studentProfile) return;
      let cancelled = false;
      getAllProgress(studentProfile.id)
        .then((rows) => {
          if (cancelled) return;
          const starsByIsland = new Map<IslandId, Map<string, number>>();
          for (const row of rows) {
            const islandId = row.island_id as IslandId;
            if (!starsByIsland.has(islandId)) {
              starsByIsland.set(islandId, new Map());
            }
            starsByIsland.get(islandId)!.set(row.level_id, row.stars_earned);
          }
          const cleared = new Set<IslandId>();
          for (const island of ISLANDS) {
            const stars = starsByIsland.get(island.id) ?? new Map();
            if (isIslandCleared(island.id, stars)) {
              cleared.add(island.id);
            }
          }
          setClearedIslands(cleared);
          setProgressError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          console.warn('[IslandMapScreen] getAllProgress failed', err);
          setProgressError(
            err instanceof Error ? err.message : 'Unable to load progress',
          );
        });
      return (): void => {
        cancelled = true;
      };
      // reloadTick is a manual bump used by the retry banner to force a re-fetch.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentProfile, reloadTick]),
  );

  const unlockedIslands = getUnlockedIslands(clearedIslands);

  function handleIslandPress(islandId: string): void {
    navigation.navigate('IslandLevelSelect', { islandId });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Modal
        animationType="fade"
        transparent
        visible={streakMilestone != null}
        onRequestClose={() => setStreakMilestone(null)}>
        <View style={styles.milestoneBackdrop}>
          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneTitle}>
              {streakMilestone === 7
                ? 'One week of learning'
                : 'A full month of learning'}
            </Text>
            <Text style={styles.milestoneBody}>
              {streakMilestone} days in a row. The octopus is proud of you.
            </Text>
            <Text style={styles.milestoneNote}>
              (Lottie animation can be added when assets are ready.)
            </Text>
            <Pressable
              style={styles.milestoneBtn}
              onPress={() => setStreakMilestone(null)}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Text style={styles.milestoneBtnText}>Yay!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.playerInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>🧒</Text>
          </View>
          <Text style={styles.playerName} numberOfLines={1}>
            {studentProfile?.display_name ?? ''}
          </Text>
        </View>

        <View style={styles.statGroup}>
          <View style={styles.stat}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{studentProfile?.total_stars ?? 0}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statEmoji}>🐙</Text>
            <Text style={styles.statValue}>{studentProfile?.streak_days ?? 0}</Text>
          </View>
        </View>
      </View>

      {progressError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={2}>
            Couldn't load progress. {progressError}
          </Text>
          <Pressable
            onPress={() => setReloadTick((t) => t + 1)}
            accessibilityRole="button"
            accessibilityLabel="Retry loading progress"
            style={styles.errorRetry}>
            <Text style={styles.errorRetryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* ── Map ── */}
      <ScrollView
        style={styles.mapScroll}
        contentContainerStyle={[styles.mapContainer, { minHeight: MAP_HEIGHT }]}
        showsVerticalScrollIndicator={false}>
        {/* Ocean background decoration */}
        <View style={[styles.mapBackground, { width }]} />

        {ISLANDS.map((island) => (
          <IslandMarker
            key={island.id}
            island={island}
            unlocked={unlockedIslands.has(island.id)}
            x={width * island.position.x}
            onPress={() => handleIslandPress(island.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.bottomNavBtn}
          onPress={() => navigation.navigate('Jukebox')}
          accessibilityRole="button"
          accessibilityLabel="Open jukebox">
          <Text style={styles.bottomNavEmoji}>🎵</Text>
          <Text style={styles.bottomNavLabel}>Jukebox</Text>
        </Pressable>
        <Pressable
          style={styles.bottomNavBtn}
          onPress={() => navigation.navigate('Backpack')}
          accessibilityRole="button"
          accessibilityLabel="Open backpack">
          <Text style={styles.bottomNavEmoji}>🎒</Text>
          <Text style={styles.bottomNavLabel}>Backpack</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mapSky,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.sm,
    backgroundColor: colors.oceanBlue,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softSand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  playerName: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.cloudWhite,
    flex: 1,
  },
  statGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: {
    fontSize: 16,
  },
  statValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.cloudWhite,
  },

  // ── Map
  mapScroll: {
    flex: 1,
  },
  mapContainer: {
    position: 'relative',
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.mapSky,
  },

  // ── Island marker
  islandMarkerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    width: ISLAND_SIZE,
  },
  islandCircle: {
    width: ISLAND_SIZE,
    height: ISLAND_SIZE,
    borderRadius: ISLAND_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  islandUnlocked: {
    backgroundColor: colors.softSand,
    borderWidth: 3,
    borderColor: colors.sunshineYellow,
  },
  islandLocked: {
    backgroundColor: colors.lockedBg,
    borderWidth: 3,
    borderColor: colors.lockedBorder,
    opacity: 0.7,
  },
  islandEmoji: {
    fontSize: 36,
  },
  lockIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    fontSize: 16,
  },
  islandLabel: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.oceanBlue,
    textAlign: 'center',
    width: ISLAND_SIZE + spacing.lg,
  },
  islandLabelLocked: {
    color: colors.lockedLabel,
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.screen,
    backgroundColor: colors.softSand,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomNavBtn: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  bottomNavEmoji: {
    fontSize: 28,
  },
  bottomNavLabel: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.oceanBlue,
    marginTop: 2,
  },

  milestoneBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.screen,
  },
  milestoneCard: {
    backgroundColor: colors.cloudWhite,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  milestoneTitle: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  milestoneBody: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  milestoneNote: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  milestoneBtn: {
    marginTop: spacing.sm,
    alignSelf: 'center',
    backgroundColor: colors.oceanBlue,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  milestoneBtnText: {
    color: colors.cloudWhite,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.body,
  },

  // ── Error banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.sm,
    backgroundColor: colors.errorBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.error,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.caption,
    color: colors.error,
  },
  errorRetry: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.cloudWhite,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorRetryText: {
    fontSize: typography.fontSize.caption,
    color: colors.error,
    fontWeight: typography.fontWeight.semibold,
  },
});
