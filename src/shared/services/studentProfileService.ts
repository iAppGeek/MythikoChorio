import { requireSupabase } from './supabaseClient';

export async function getStudentProfileRow(studentProfileId: string): Promise<{
  streak_days: number | null;
  last_active: string | null;
} | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('student_profiles')
    .select('streak_days, last_active')
    .eq('id', studentProfileId)
    .single();

  if (error) {
    console.warn('[getStudentProfileRow]', error.message);
    return null;
  }

  return data;
}
