import { requireSupabase } from './supabaseClient';
import type { IslandProgress } from '../models/Progress';

export async function getIslandProgress(
  studentProfileId: string,
  islandId: string,
): Promise<IslandProgress[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('island_progress')
    .select('*')
    .eq('student_profile_id', studentProfileId)
    .eq('island_id', islandId);

  if (error) {
    throw new Error(`Failed to fetch island progress: ${error.message}`);
  }

  return data ?? [];
}

export async function getAllProgress(
  studentProfileId: string,
): Promise<IslandProgress[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('island_progress')
    .select('*')
    .eq('student_profile_id', studentProfileId);

  if (error) {
    throw new Error(`Failed to fetch progress: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Delegates to the `upsert_level_progress` RPC so that `times_played` is
 * incremented atomically on every play and `best_score` / `stars_earned`
 * keep the best-ever value rather than whatever the caller just produced.
 */
export async function upsertLevelProgress(params: {
  studentProfileId: string;
  islandId: string;
  levelId: string;
  starsEarned: number;
  bestScore: number;
}): Promise<void> {
  const { studentProfileId, islandId, levelId, starsEarned, bestScore } =
    params;

  const supabase = requireSupabase();
  const { error } = await supabase.rpc('upsert_level_progress', {
    p_student_profile_id: studentProfileId,
    p_island_id: islandId,
    p_level_id: levelId,
    p_stars_earned: starsEarned,
    p_best_score: bestScore,
  });

  if (error) {
    throw new Error(`Failed to save level progress: ${error.message}`);
  }
}
