export type IslandProgress = {
  id: string;
  student_profile_id: string;
  island_id: string;
  level_id: string;
  stars_earned: number;
  best_score: number | null;
  times_played: number;
  completed_at: string | null;
};

export type Souvenir = {
  id: string;
  student_profile_id: string;
  island_id: string;
  souvenir_type: string;
  earned_at: string;
};
