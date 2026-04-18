/**
 * Updates `student_profiles.last_active` and maintains `streak_days` based on
 * calendar-day continuity (local timezone).
 */
import { requireSupabase } from './supabaseClient';
import { getStudentProfileRow } from './studentProfileService';

function startOfLocalDayMs(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** Whole calendar days between two instants (local midnight boundaries). */
function calendarDaysBetweenLaterAndEarlier(later: Date, earlier: Date): number {
  return Math.round(
    (startOfLocalDayMs(later) - startOfLocalDayMs(earlier)) /
      (24 * 60 * 60 * 1000),
  );
}

export async function recordGameActivity(studentProfileId: string): Promise<void> {
  const supabase = requireSupabase();
  const row = await getStudentProfileRow(studentProfileId);
  if (!row) return;

  const now = new Date();

  let nextStreak = row.streak_days ?? 1;
  if (row.last_active) {
    const last = new Date(row.last_active);
    const gap = calendarDaysBetweenLaterAndEarlier(now, last);
    if (gap === 0) {
      /* same local calendar day — keep streak */
    } else if (gap === 1) {
      nextStreak = (row.streak_days ?? 0) + 1;
    } else {
      nextStreak = 1;
    }
  } else {
    nextStreak = 1;
  }

  const { error } = await supabase
    .from('student_profiles')
    .update({
      last_active: now.toISOString(),
      streak_days: nextStreak,
    })
    .eq('id', studentProfileId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * If the player hasn't opened the app since two or more calendar days ago,
 * reset streak to 1 so the counter matches the phase-2 spec for stale sessions.
 */
export async function reconcileStreakOnLaunch(studentProfileId: string): Promise<void> {
  const supabase = requireSupabase();
  const row = await getStudentProfileRow(studentProfileId);
  if (!row?.last_active) return;

  const now = new Date();
  const last = new Date(row.last_active);
  const gap = calendarDaysBetweenLaterAndEarlier(now, last);

  if (gap >= 2) {
    const { error } = await supabase
      .from('student_profiles')
      .update({ streak_days: 1 })
      .eq('id', studentProfileId);

    if (error) {
      console.warn('[reconcileStreakOnLaunch]', error.message);
    }
  }
}
