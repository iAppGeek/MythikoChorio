import { supabase } from './supabaseClient';
import type { AppRole } from '../models/Staff';

export type ResolvedUser = {
  role: AppRole | 'unregistered';
  app_user_id: string | null;
};

export async function resolveUserRole(
  authUserId: string,
): Promise<ResolvedUser> {
  const { data, error } = await supabase.rpc('resolve_user_role', {
    p_auth_user_id: authUserId,
  });

  if (error) {
    throw new Error(`Failed to resolve user role: ${error.message}`);
  }

  const row = (data as ResolvedUser[])[0];
  return row ?? { role: 'unregistered', app_user_id: null };
}

export async function signInAnonymously(): Promise<void> {
  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error(`Anonymous sign-in failed: ${error.message}`);
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Sign-out failed: ${error.message}`);
  }
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
    p_notes: notes ?? null,
  });

  if (error) {
    throw new Error(`Failed to link external system: ${error.message}`);
  }

  return data as 'linked' | 'updated' | 'conflict';
}
