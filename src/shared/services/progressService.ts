import { supabase } from './supabaseClient';
import type { IslandProgress } from '../models/Progress';

export async function getIslandProgress(
  studentProfileId: string,
  islandId: string,
): Promise<IslandProgress[]> {
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
  const { data, error } = await supabase
    .from('island_progress')
    .select('*')
    .eq('student_profile_id', studentProfileId);

  if (error) {
    throw new Error(`Failed to fetch progress: ${error.message}`);
  }

  return data ?? [];
}

export async function upsertLevelProgress(params: {
  studentProfileId: string;
  islandId: string;
  levelId: string;
  starsEarned: number;
  bestScore: number;
}): Promise<void> {
  const { studentProfileId, islandId, levelId, starsEarned, bestScore } =
    params;

  const { error } = await supabase.from('island_progress').upsert(
    {
      student_profile_id: studentProfileId,
      island_id: islandId,
      level_id: levelId,
      stars_earned: starsEarned,
      best_score: bestScore,
      completed_at: starsEarned > 0 ? new Date().toISOString() : null,
    },
    {
      onConflict: 'student_profile_id,island_id,level_id',
      ignoreDuplicates: false,
    },
  );

  if (error) {
    throw new Error(`Failed to save level progress: ${error.message}`);
  }
}
