export type DeviceType = 'phone' | 'tablet';

export type GameScore = {
  id: string;
  student_profile_id: string;
  game_type: string;
  island_id: string;
  level_id: string;
  score: number;
  accuracy: number | null;
  time_spent_secs: number | null;
  hints_used: number;
  attempts: number;
  device_type: DeviceType | null;
  details: Record<string, unknown> | null;
  completed_at: string;
  created_at: string;
};
