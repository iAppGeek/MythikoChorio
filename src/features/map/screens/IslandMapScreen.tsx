import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
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

  useFocusEffect(
    useCallback(() => {
      if (!studentProfile) return;
      getAllProgress(studentProfile.id)
        .then((rows) => {
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
        })
        .catch(() => {
          // Non-fatal: leave cleared set empty
        });
    }, [studentProfile]),
  );

  const unlockedIslands = getUnlockedIslands(clearedIslands);

  function handleIslandPress(islandId: string): void {
    navigation.navigate('IslandLevelSelect', { islandId });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{studentProfile?.streak_days ?? 0}</Text>
          </View>
        </View>
      </View>

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

      {/* ── Bottom nav ── */}
      <SafeAreaView edges={['bottom']} style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          accessibilityRole="button"
          accessibilityLabel="Jukebox">
          <Text style={styles.navEmoji}>🎵</Text>
          <Text style={styles.navLabel}>Jukebox</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          accessibilityRole="button"
          accessibilityLabel="Backpack">
          <Text style={styles.navEmoji}>🎒</Text>
          <Text style={styles.navLabel}>Backpack</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          accessibilityRole="button"
          accessibilityLabel="Settings">
          <Text style={styles.navEmoji}>⚙️</Text>
          <Text style={styles.navLabel}>Settings</Text>
        </Pressable>
      </SafeAreaView>
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

  // ── Bottom nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.cloudWhite,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: 2,
  },
  navEmoji: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    fontWeight: typography.fontWeight.medium,
  },
});
