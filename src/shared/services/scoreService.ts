import { supabase } from './supabaseClient';
import type { GameScore } from '../models/GameScore';

export type NewGameScore = Omit<GameScore, 'id' | 'created_at'>;

export async function saveGameScore(score: NewGameScore): Promise<void> {
  const { error } = await supabase.from('game_scores').insert(score);
  if (error) {
    throw new Error(`Failed to save game score: ${error.message}`);
  }
}

export async function getProfileScores(
  studentProfileId: string,
): Promise<GameScore[]> {
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
