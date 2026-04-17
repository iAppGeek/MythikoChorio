import { create } from 'zustand';
import {
  supabase,
  MISSING_SUPABASE_ENV_MESSAGE,
} from '../services/supabaseClient';
import {
  signInAnonymously,
  createGuestProfile,
  getStudentProfile,
  signOut as authSignOut,
} from '../services/authService';
import type { StudentProfile } from '../models/Student';

/**
 * Auth status lifecycle:
 *   loading → unauthenticated  (no stored session)
 *   loading → guest            (valid anonymous session on device)
 *
 * Future states when SSO is re-enabled:
 *   loading → player           (authenticated student)
 *   loading → staff            (teacher / admin)
 *
 * Guest → player upgrade is handled via link_guest_to_player /
 * merge_guest_into_player database functions (already in schema).
 */
export type AuthStatus = 'loading' | 'unauthenticated' | 'guest';

type AuthStore = {
  status: AuthStatus;
  authUserId: string | null;
  studentProfile: StudentProfile | null;
  /** Called once on app mount — restores session from AsyncStorage if present. */
  loadSession: () => Promise<void>;
  /** Guest sign-in: anonymous auth + profile creation. */
  signInAsGuest: (displayName: string, age: number) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  status: 'loading',
  authUserId: null,
  studentProfile: null,

  loadSession: async (): Promise<void> => {
    if (!supabase) {
      console.warn(MISSING_SUPABASE_ENV_MESSAGE);
      set({ status: 'unauthenticated', authUserId: null, studentProfile: null });
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      set({ status: 'unauthenticated', authUserId: null, studentProfile: null });
      return;
    }

    const profile = await getStudentProfile(session.user.id);

    if (profile) {
      set({
        status: 'guest',
        authUserId: session.user.id,
        studentProfile: profile,
      });
    } else {
      // Session exists but no matching profile — clear stale session.
      await supabase.auth.signOut();
      set({ status: 'unauthenticated', authUserId: null, studentProfile: null });
    }
  },

  signInAsGuest: async (displayName: string, age: number): Promise<void> => {
    if (!supabase) {
      throw new Error(MISSING_SUPABASE_ENV_MESSAGE);
    }

    await signInAnonymously();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No session after anonymous sign-in');
    }

    const profile = await createGuestProfile(displayName, age, session.user.id);

    set({
      status: 'guest',
      authUserId: session.user.id,
      studentProfile: profile,
    });
  },

  signOut: async (): Promise<void> => {
    if (supabase) {
      await authSignOut();
    }
    set({ status: 'unauthenticated', authUserId: null, studentProfile: null });
  },
}));
