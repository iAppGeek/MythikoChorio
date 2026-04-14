import { clearGameProgress } from '../services/gameProgressCache';
import { upsertLevelProgress } from '../services/progressService';
import type { CacheMap } from '../services/gameProgressCache';

type FinishGameParams = {
  game: keyof CacheMap;
  levelId: string;
  profileId: string;
  studentProfileId: string | undefined;
  islandId: string;
  stars: 1 | 2 | 3;
  bestScore: number;
  setSaving: (saving: boolean) => void;
  onComplete: () => void;
};

/**
 * Shared end-of-game flow:
 * 1. Set saving state
 * 2. Clear AsyncStorage cache
 * 3. Upsert progress to Supabase (non-fatal)
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
  setSaving,
  onComplete,
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
    } catch {
      // Non-fatal
    }
  }

  setSaving(false);
  onComplete();
}
