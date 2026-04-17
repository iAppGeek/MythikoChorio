import { requireSupabase } from './supabaseClient';
import type { GameScore } from '../models/GameScore';
import type { TablesInsert } from '../../types/database';

export type NewGameScore = TablesInsert<'game_scores'>;

export async function saveGameScore(score: NewGameScore): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from('game_scores').insert(score);
  if (error) {
    throw new Error(`Failed to save game score: ${error.message}`);
  }
}

export async function getProfileScores(
  studentProfileId: string,
): Promise<GameScore[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('game_scores')
    .select('*')
    .eq('student_profile_id', studentProfileId)
    .order('completed_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch scores: ${error.message}`);
  }

  return (data ?? []) as GameScore[];
}
