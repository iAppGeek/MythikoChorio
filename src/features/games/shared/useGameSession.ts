import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../../app/navigationTypes';
import {
  saveGameProgress,
  loadGameProgress,
  clearGameProgress,
} from '../../../shared/services/gameProgressCache';
import type { CacheMap } from '../../../shared/services/gameProgressCache';
import { finishGame } from '../../../shared/utils/finishGame';
import type { GameScoreDetails } from '../../../shared/utils/finishGame';
import { useAuthStore } from '../../../shared/stores/authStore';
import { getLevelsForIsland } from '../../../data/islands/levelConfig';
import type { GameType } from '../../../data/islands/levelConfig';
import type { IslandId } from '../../../data/islands/islandConfig';

/** A `CacheMap` key that is also a `GameType` — i.e. every Phase-1 game. */
type Game = keyof CacheMap & GameType;

type PlayerNavigation = NativeStackNavigationProp<PlayerStackParamList>;

type UseGameSessionOptions<G extends Game> = {
  game: G;
  islandId: string;
  levelId: string;
  navigation: PlayerNavigation;
};

type FinishOptions = {
  stars: 1 | 2 | 3;
  bestScore: number;
  scoreDetails?: GameScoreDetails;
};

export type GameSession<G extends Game> = {
  game: G;
  islandId: string;
  levelId: string;
  levelName: string;
  profileId: string;
  studentProfileId: string | undefined;

  loading: boolean;
  setLoading: (b: boolean) => void;
  saving: boolean;

  save: (data: CacheMap[G]) => Promise<void>;
  load: () => Promise<CacheMap[G] | null>;
  clear: () => Promise<void>;

  finish: (opts: FinishOptions) => Promise<void>;
  makeExitHandler: (onSave: () => void) => () => void;
  notifyPersistError: (err: unknown) => void;
};

/**
 * Encapsulates the plumbing every Phase-1 game repeats:
 *   - profile / level metadata lookup
 *   - cache save / load / clear scoped to (game, level, profile)
 *   - loading + saving state gates
 *   - shared finish flow that writes island_progress, optionally game_scores,
 *     and navigates to the Results screen
 *   - exit-confirmation alert that runs the caller's save payload first
 *
 * Game mechanics (rounds, scoring, UI) stay in the feature screen.
 */
export function useGameSession<G extends Game>({
  game,
  islandId,
  levelId,
  navigation,
}: UseGameSessionOptions<G>): GameSession<G> {
  const studentProfile = useAuthStore((s) => s.studentProfile);
  const studentProfileId = studentProfile?.id;
  const profileId = studentProfileId ?? 'guest';

  const levelName = useMemo(
    () =>
      getLevelsForIsland(islandId as IslandId).find((l) => l.id === levelId)
        ?.name ?? levelId,
    [islandId, levelId],
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    (data: CacheMap[G]): Promise<void> =>
      saveGameProgress(game, levelId, profileId, data),
    [game, levelId, profileId],
  );

  const load = useCallback(
    (): Promise<CacheMap[G] | null> =>
      loadGameProgress(game, levelId, profileId),
    [game, levelId, profileId],
  );

  const clear = useCallback(
    (): Promise<void> => clearGameProgress(game, levelId, profileId),
    [game, levelId, profileId],
  );

  const notifyPersistError = useCallback((err: unknown): void => {
    // Central hook for surfacing Supabase write failures. Today we just
    // console.warn; a toast or Sentry integration can be swapped in here.
    console.warn('[useGameSession] persist error', err);
  }, []);

  const finish = useCallback(
    async ({ stars, bestScore, scoreDetails }: FinishOptions): Promise<void> => {
      await finishGame({
        game,
        levelId,
        profileId,
        studentProfileId,
        islandId,
        stars,
        bestScore,
        scoreDetails,
        setSaving,
        onPersistError: notifyPersistError,
        onComplete: () =>
          navigation.replace('Results', {
            stars,
            levelName,
            islandId,
            levelId,
            gameType: game,
          }),
      });
    },
    [
      game,
      levelId,
      profileId,
      studentProfileId,
      islandId,
      levelName,
      navigation,
      notifyPersistError,
    ],
  );

  const makeExitHandler = useCallback(
    (onSave: () => void): (() => void) => {
      return (): void => {
        Alert.alert(
          'Save & Exit',
          'Your progress has been saved. Continue later?',
          [
            { text: 'Keep Playing', style: 'cancel' },
            {
              text: 'Exit',
              style: 'destructive',
              onPress: (): void => {
                onSave();
                navigation.goBack();
              },
            },
          ],
        );
      };
    },
    [navigation],
  );

  return {
    game,
    islandId,
    levelId,
    levelName,
    profileId,
    studentProfileId,
    loading,
    setLoading,
    saving,
    save,
    load,
    clear,
    finish,
    makeExitHandler,
    notifyPersistError,
  };
}

/**
 * Mount-time resume prompt. When a saved cache entry exists and the caller
 * considers it resumable, the user is offered Start Fresh / Continue. The
 * session's `loading` flag is released after the user's choice (or
 * immediately when there is nothing to resume).
 *
 * `isResumable` and `onResume` are captured via refs so re-renders do not
 * retrigger the prompt — the effect deliberately depends only on the
 * primitives that identify a new session.
 */
export function useResumeGame<G extends Game>(
  session: GameSession<G>,
  isResumable: (saved: CacheMap[G]) => boolean,
  onResume: (saved: CacheMap[G]) => void,
): void {
  const { game, levelId, profileId, load, clear, setLoading } = session;

  const isResumableRef = useRef(isResumable);
  const onResumeRef = useRef(onResume);
  useEffect(() => {
    isResumableRef.current = isResumable;
    onResumeRef.current = onResume;
  });

  useEffect(() => {
    let cancelled = false;
    load().then((saved) => {
      if (cancelled) return;
      if (saved && isResumableRef.current(saved)) {
        Alert.alert(
          'Resume game?',
          'You have an unfinished game. Would you like to continue or start fresh?',
          [
            {
              text: 'Start Fresh',
              onPress: (): void => {
                void clear().finally(() => setLoading(false));
              },
            },
            {
              text: 'Continue',
              style: 'default',
              onPress: (): void => {
                onResumeRef.current(saved);
                setLoading(false);
              },
            },
          ],
          { cancelable: false },
        );
      } else {
        setLoading(false);
      }
    });
    return (): void => {
      cancelled = true;
    };
  }, [game, levelId, profileId, load, clear, setLoading]);
}
