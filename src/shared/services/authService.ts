import { supabase } from './supabaseClient';
import type { AppRole } from '../models/Staff';
import type { StudentProfile } from '../models/Student';

export type ResolvedUser = {
  role: AppRole | 'unregistered';
  app_user_id: string | null;
};

// ─── Guest flow ───────────────────────────────────────────────────────────────

export async function signInAnonymously(): Promise<void> {
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
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Sign-out failed: ${error.message}`);
  }
}

// ─── SSO (reserved for future implementation) ─────────────────────────────────
// signInWithMicrosoft() and resolveUserRole() will be added here when SSO is
// re-enabled. The guest profile upgrade path (link_guest_to_player /
// merge_guest_into_player) is already in the database schema.

export async function resolveUserRole(
  authUserId: string,
): Promise<ResolvedUser> {
  const { data, error } = await supabase.rpc('resolve_user_role', {
    p_auth_user_id: authUserId,
  });

  if (error) {
    throw new Error(`Failed to resolve user role: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return { role: 'unregistered', app_user_id: null };
  }

  const row = data[0];
  return {
    role: row.role as AppRole | 'unregistered',
    app_user_id: row.app_user_id ?? null,
  };
}

export async function linkToExternalSystem(
  appUserId: string,
  systemName: string,
  externalId: string,
  linkedBy: string,
  notes?: string,
): Promise<'linked' | 'updated' | 'conflict'> {
  const { data, error } = await supabase.rpc('link_to_external_system', {
    p_app_user_id: appUserId,
    p_system_name: systemName,
    p_external_id: externalId,
    p_linked_by: linkedBy,
    p_notes: notes,
  });

  if (error) {
    throw new Error(`Failed to link external system: ${error.message}`);
  }

  return data as 'linked' | 'updated' | 'conflict';
}
