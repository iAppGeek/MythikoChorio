/**
 * Grants island completion souvenirs once when every level has ≥1 star.
 */
import { requireSupabase } from './supabaseClient';
import { getAllProgress } from './progressService';
import type { IslandId } from '../../data/islands/islandConfig';
import { isIslandCleared } from '../../data/islands/levelConfig';

export const ISLAND_SOUVENIR_TYPES: Partial<Record<IslandId, string>> = {
  alpha: 'golden_alpha',
  beta: 'omega_crown',
};

export async function fetchSouvenirs(studentProfileId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('souvenirs')
    .select('*')
    .eq('student_profile_id', studentProfileId)
    .order('earned_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function maybeAwardIslandSouvenir(
  studentProfileId: string,
  islandId: IslandId | string,
): Promise<void> {
  const souvenirType =
    typeof islandId === 'string'
      ? ISLAND_SOUVENIR_TYPES[islandId as IslandId]
      : ISLAND_SOUVENIR_TYPES[islandId];

  if (!souvenirType) return;

  const rows = await getAllProgress(studentProfileId);
  const starsByLevelId = new Map(rows.map((r) => [r.level_id, r.stars_earned]));

  if (!isIslandCleared(islandId as IslandId, starsByLevelId)) return;

  const supabase = requireSupabase();
  const { error } = await supabase.from('souvenirs').insert({
    student_profile_id: studentProfileId,
    island_id: islandId,
    souvenir_type: souvenirType,
    earned_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === '23505') return;
    throw new Error(error.message);
  }
}
