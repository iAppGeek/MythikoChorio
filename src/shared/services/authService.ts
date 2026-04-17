import { requireSupabase } from './supabaseClient';
import type { StudentProfile } from '../models/Student';

// ─── Guest flow ───────────────────────────────────────────────────────────────

export async function signInAnonymously(): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error(`Anonymous sign-in failed: ${error.message}`);
  }
}

export async function createGuestProfile(
  displayName: string,
  age: number,
  authUserId: string,
): Promise<StudentProfile> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('student_profiles')
    .insert({
      auth_user_id: authUserId,
      is_guest: true,
      display_name: displayName,
      age,
      current_island: 'alpha',
      total_stars: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create guest profile: ${error.message}`);
  }

  return data;
}

export async function getStudentProfile(
  authUserId: string,
): Promise<StudentProfile | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // no matching row
    }
    throw new Error(`Failed to fetch student profile: ${error.message}`);
  }

  return data;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Sign-out failed: ${error.message}`);
  }
}

// ─── SSO (reserved for future implementation) ─────────────────────────────────
// signInWithMicrosoft() and resolveUserRole() will be added here when SSO is
// re-enabled. The guest profile upgrade path (link_guest_to_player /
// merge_guest_into_player) is already in the database schema. Starter
// implementations of resolveUserRole() and linkToExternalSystem() live in
// plans/phase-3-staff-dashboards.md for easy restoration.
