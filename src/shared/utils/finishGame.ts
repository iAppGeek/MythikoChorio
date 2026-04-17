import { clearGameProgress } from '../services/gameProgressCache';
import { upsertLevelProgress } from '../services/progressService';
import { saveGameScore } from '../services/scoreService';
import type { CacheMap } from '../services/gameProgressCache';

export type GameScoreDetails = {
  /** Raw score achieved on a 0–100 scale (matches the DB `score` column). */
  score: number;
  /** Optional 0–1 accuracy, primarily for tracing games. */
  accuracy?: number | null;
  /** Optional time spent playing the level. */
  timeSpentSecs?: number | null;
  /** Optional attempt count (e.g. flips in Memory Match). */
  attempts?: number | null;
  /** Optional hints used. */
  hintsUsed?: number | null;
};

type FinishGameParams = {
  game: keyof CacheMap;
  levelId: string;
  profileId: string;
  studentProfileId: string | undefined;
  islandId: string;
  stars: 1 | 2 | 3;
  bestScore: number;
  /** Optional per-run score row written to `game_scores`. */
  scoreDetails?: GameScoreDetails;
  setSaving: (saving: boolean) => void;
  onComplete: () => void;
  /**
   * Called if either the island_progress upsert or the game_scores insert
   * fails. Persist errors are non-fatal — the end-of-game flow always
   * completes — but they should surface somewhere (toast, logger, etc).
   */
  onPersistError?: (err: unknown) => void;
};

/**
 * Shared end-of-game flow:
 * 1. Set saving state
 * 2. Clear AsyncStorage cache
 * 3. Upsert island_progress and (optionally) insert game_scores for signed-in profiles
 * 4. Call onComplete (typically navigation.replace)
 */
export async function finishGame({
  game,
  levelId,
  profileId,
  studentProfileId,
  islandId,
  stars,
  bestScore,
  scoreDetails,
  setSaving,
  onComplete,
  onPersistError,
}: FinishGameParams): Promise<void> {
  setSaving(true);
  await clearGameProgress(game, levelId, profileId);

  if (studentProfileId) {
    try {
      await upsertLevelProgress({
        studentProfileId,
        islandId,
        levelId,
        starsEarned: stars,
        bestScore,
      });
    } catch (err) {
      console.warn('[finishGame] upsertLevelProgress failed', err);
      onPersistError?.(err);
    }

    if (scoreDetails) {
      try {
        await saveGameScore({
          student_profile_id: studentProfileId,
          island_id: islandId,
          level_id: levelId,
          game_type: game,
          score: scoreDetails.score,
          accuracy: scoreDetails.accuracy ?? null,
          time_spent_secs: scoreDetails.timeSpentSecs ?? null,
          attempts: scoreDetails.attempts ?? null,
          hints_used: scoreDetails.hintsUsed ?? null,
          completed_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[finishGame] saveGameScore failed', err);
        onPersistError?.(err);
      }
    }
  }

  setSaving(false);
  onComplete();
}
