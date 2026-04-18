import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../../app/navigationTypes';
import { SONGS } from '../../../data/songs/songConfig';
import type { SongEntry } from '../../../data/songs/songConfig';
import { ISLANDS } from '../../../data/islands/islandConfig';
import { isIslandCleared } from '../../../data/islands/levelConfig';
import { getAllProgress } from '../../../shared/services/progressService';
import { useAuthStore } from '../../../shared/stores/authStore';
import {
  pauseSong,
  playSong,
  resumeSong,
  stopSong,
} from '../../../shared/services/audioService';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';

type Props = NativeStackScreenProps<PlayerStackParamList, 'Jukebox'>;

export function JukeboxScreen({
  navigation,
}: Props): React.JSX.Element {
  const studentProfile = useAuthStore((s) => s.studentProfile);
  const [cleared, setCleared] = useState<Set<string>>(() => new Set());
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!studentProfile) return;
      let cancelled = false;
      getAllProgress(studentProfile.id)
        .then((rows) => {
          if (cancelled) return;
          const starsByLevelId = new Map(rows.map((r) => [r.level_id, r.stars_earned]));
          const done = new Set<string>();
          for (const island of ISLANDS) {
            if (isIslandCleared(island.id, starsByLevelId)) {
              done.add(island.id);
            }
          }
          setCleared(done);
        })
        .catch(() => {});
      return (): void => {
        cancelled = true;
      };
    }, [studentProfile]),
  );

  function songUnlocked(entry: SongEntry): boolean {
    if (__DEV__) return true;
    return cleared.has(entry.unlockedAfterIslandClearedId);
  }

  function toggleSong(entry: SongEntry): void {
    if (!songUnlocked(entry)) return;

    if (playingId !== entry.id) {
      stopSong();
      playSong(entry.id);
      setPlayingId(entry.id);
      setPaused(false);
      return;
    }

    if (paused) {
      resumeSong();
      setPaused(false);
    } else {
      pauseSong();
      setPaused(true);
    }
  }

  function replay(entry: SongEntry): void {
    if (!songUnlocked(entry)) return;
    stopSong();
    playSong(entry.id);
    setPlayingId(entry.id);
    setPaused(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button">
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Jukebox</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.heroEmoji}>🎵</Text>
        <Text style={styles.subtitle}>Tap a song when it unlocks!</Text>

        {SONGS.map((song: SongEntry) => {
          const unlocked = songUnlocked(song);
          const active = playingId === song.id && !paused;

          return (
            <Pressable
              key={song.id}
              style={[styles.row, !unlocked && styles.rowLocked]}
              onPress={() => toggleSong(song)}
              disabled={!unlocked}
              accessibilityRole="button"
              accessibilityLabel={song.title}>
              <Text style={styles.rowEmoji}>{unlocked ? '💿' : '🔒'}</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{song.title}</Text>
                {!unlocked && (
                  <Text style={styles.rowHint}>Finish {song.unlockedAfterIslandClearedId} island</Text>
                )}
              </View>
              {unlocked && (
                <Text style={styles.playIcon}>{active ? '⏸' : '▶️'}</Text>
              )}
            </Pressable>
          );
        })}

        <Pressable
          style={styles.placeholderBtn}
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Sing along — coming soon">
          <Text style={styles.placeholderBtnText}>Sing Along (soon)</Text>
        </Pressable>

        {playingId && (
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => {
              const entry = SONGS.find((s) => s.id === playingId);
              if (entry) replay(entry);
            }}>
            <Text style={styles.secondaryBtnText}>↻ Replay</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cloudWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.sm,
    backgroundColor: colors.oceanBlue,
  },
  back: {
    color: colors.cloudWhite,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  title: {
    color: colors.cloudWhite,
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
  },
  headerSpacer: {
    width: 64,
  },
  body: {
    padding: spacing.screen,
    gap: spacing.md,
  },
  heroEmoji: {
    fontSize: 72,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.softSand,
    borderWidth: 2,
    borderColor: colors.border,
  },
  rowLocked: {
    opacity: 0.55,
  },
  rowEmoji: {
    fontSize: 36,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
  rowHint: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    marginTop: 4,
  },
  playIcon: {
    fontSize: 28,
  },
  placeholderBtn: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
  },
  placeholderBtnText: {
    color: colors.oliveGreen,
    fontWeight: typography.fontWeight.semibold,
  },
  secondaryBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  secondaryBtnText: {
    color: colors.oceanBlue,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.body,
  },
});
