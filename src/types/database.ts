export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      external_system_links: {
        Row: {
          app_user_id: string
          external_id: string
          id: string
          linked_at: string | null
          linked_by: string | null
          notes: string | null
          system_name: string
        }
        Insert: {
          app_user_id: string
          external_id: string
          id?: string
          linked_at?: string | null
          linked_by?: string | null
          notes?: string | null
          system_name: string
        }
        Update: {
          app_user_id?: string
          external_id?: string
          id?: string
          linked_at?: string | null
          linked_by?: string | null
          notes?: string | null
          system_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_system_links_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_system_links_linked_by_fkey"
            columns: ["linked_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_scores: {
        Row: {
          accuracy: number | null
          attempts: number | null
          completed_at: string
          created_at: string | null
          details: Json | null
          device_type: string | null
          game_type: string
          hints_used: number | null
          id: string
          island_id: string
          level_id: string
          score: number
          student_profile_id: string
          time_spent_secs: number | null
        }
        Insert: {
          accuracy?: number | null
          attempts?: number | null
          completed_at: string
          created_at?: string | null
          details?: Json | null
          device_type?: string | null
          game_type: string
          hints_used?: number | null
          id?: string
          island_id: string
          level_id: string
          score: number
          student_profile_id: string
          time_spent_secs?: number | null
        }
        Update: {
          accuracy?: number | null
          attempts?: number | null
          completed_at?: string
          created_at?: string | null
          details?: Json | null
          device_type?: string | null
          game_type?: string
          hints_used?: number | null
          id?: string
          island_id?: string
          level_id?: string
          score?: number
          student_profile_id?: string
          time_spent_secs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_scores_student_profile_id_fkey"
            columns: ["student_profile_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      island_progress: {
        Row: {
          best_score: number | null
          completed_at: string | null
          id: string
          island_id: string
          level_id: string
          stars_earned: number
          student_profile_id: string
          times_played: number
        }
        Insert: {
          best_score?: number | null
          completed_at?: string | null
          id?: string
          island_id: string
          level_id: string
          stars_earned?: number
          student_profile_id: string
          times_played?: number
        }
        Update: {
          best_score?: number | null
          completed_at?: string | null
          id?: string
          island_id?: string
          level_id?: string
          stars_earned?: number
          student_profile_id?: string
          times_played?: number
        }
        Relationships: [
          {
            foreignKeyName: "island_progress_student_profile_id_fkey"
            columns: ["student_profile_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      souvenirs: {
        Row: {
          earned_at: string | null
          id: string
          island_id: string
          souvenir_type: string
          student_profile_id: string
        }
        Insert: {
          earned_at?: string | null
          id?: string
          island_id: string
          souvenir_type: string
          student_profile_id: string
        }
        Update: {
          earned_at?: string | null
          id?: string
          island_id?: string
          souvenir_type?: string
          student_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "souvenirs_student_profile_id_fkey"
            columns: ["student_profile_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          age: number | null
          app_user_id: string | null
          auth_user_id: string | null
          avatar_id: string | null
          created_at: string | null
          current_island: string
          display_name: string | null
          id: string
          is_guest: boolean
          last_active: string | null
          streak_days: number
          total_stars: number
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          app_user_id?: string | null
          auth_user_id?: string | null
          avatar_id?: string | null
          created_at?: string | null
          current_island?: string
          display_name?: string | null
          id?: string
          is_guest?: boolean
          last_active?: string | null
          streak_days?: number
          total_stars?: number
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          app_user_id?: string | null
          auth_user_id?: string | null
          avatar_id?: string | null
          created_at?: string | null
          current_island?: string
          display_name?: string | null
          id?: string
          is_guest?: boolean
          last_active?: string | null
          streak_days?: number
          total_stars?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: true
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      link_guest_to_player: {
        Args: {
          p_app_user_id: string
          p_auth_user_id: string
          p_guest_profile_id: string
        }
        Returns: string
      }
      link_to_external_system: {
        Args: {
          p_app_user_id: string
          p_external_id: string
          p_linked_by: string
          p_notes?: string
          p_system_name: string
        }
        Returns: string
      }
      merge_guest_into_player: {
        Args: { p_guest_profile_id: string; p_target_profile_id: string }
        Returns: undefined
      }
      resolve_user_role: {
        Args: { p_auth_user_id: string }
        Returns: {
          app_user_id: string
          role: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
