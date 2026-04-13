import { supabase } from './supabaseClient';
import type { StudentProfile } from '../models/Student';
import type { GameScore } from '../models/GameScore';

// Returns all player profiles — accessible to teachers and admins.
export async function getAllPlayerProfiles(): Promise<StudentProfile[]> {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('is_guest', false)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch player profiles: ${error.message}`);
  }

  return (data ?? []) as StudentProfile[];
}

// Returns recent game scores across all players — accessible to teachers and admins.
export async function getAllGameScores(limit = 200): Promise<GameScore[]> {
  const { data, error } = await supabase
    .from('game_scores')
    .select('*')
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch game scores: ${error.message}`);
  }

  return (data ?? []) as GameScore[];
}
