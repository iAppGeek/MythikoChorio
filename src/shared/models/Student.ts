export type StudentProfile = {
  id: string;
  app_user_id: string | null; // null for anonymous guests
  auth_user_id: string | null;
  is_guest: boolean;
  display_name: string | null;
  age: number | null;
  avatar_id: string | null;
  current_island: string;
  total_stars: number;
  streak_days: number;
  last_active: string | null;
  created_at: string;
  updated_at: string;
};
