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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          color_tier: string | null
          created_at: string | null
          description: string | null
          icon_emoji: string | null
          id: string
          name: string
          slug: string
          threshold: number | null
          threshold_percent: number | null
          tier: number | null
        }
        Insert: {
          category: string
          color_tier?: string | null
          created_at?: string | null
          description?: string | null
          icon_emoji?: string | null
          id?: string
          name: string
          slug: string
          threshold?: number | null
          threshold_percent?: number | null
          tier?: number | null
        }
        Update: {
          category?: string
          color_tier?: string | null
          created_at?: string | null
          description?: string | null
          icon_emoji?: string | null
          id?: string
          name?: string
          slug?: string
          threshold?: number | null
          threshold_percent?: number | null
          tier?: number | null
        }
        Relationships: []
      }
      dj_performances: {
        Row: {
          city: string
          created_at: string | null
          dj_id: string
          event_series_id: string | null
          id: string
          performance_date: string
          source: string | null
          venue_id: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          dj_id: string
          event_series_id?: string | null
          id?: string
          performance_date: string
          source?: string | null
          venue_id?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          dj_id?: string
          event_series_id?: string | null
          id?: string
          performance_date?: string
          source?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dj_performances_dj_id_fkey"
            columns: ["dj_id"]
            isOneToOne: false
            referencedRelation: "djs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dj_performances_event_series_id_fkey"
            columns: ["event_series_id"]
            isOneToOne: false
            referencedRelation: "event_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dj_performances_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      djs: {
        Row: {
          created_at: string | null
          home_city: string | null
          id: string
          instagram_handle: string | null
          primary_genre_id: string | null
          stage_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          home_city?: string | null
          id?: string
          instagram_handle?: string | null
          primary_genre_id?: string | null
          stage_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          home_city?: string | null
          id?: string
          instagram_handle?: string | null
          primary_genre_id?: string | null
          stage_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "djs_primary_genre_id_fkey"
            columns: ["primary_genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      }
      event_editions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          series_id: string
          start_date: string
          status: string | null
          updated_at: string | null
          venue_id: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          series_id: string
          start_date: string
          status?: string | null
          updated_at?: string | null
          venue_id?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          series_id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          venue_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_editions_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "event_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_editions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      event_lineups: {
        Row: {
          created_at: string | null
          dj_id: string
          event_id: string
          id: string
          set_end_at: string | null
          set_start_at: string | null
          slot_order: number | null
        }
        Insert: {
          created_at?: string | null
          dj_id: string
          event_id: string
          id?: string
          set_end_at?: string | null
          set_start_at?: string | null
          slot_order?: number | null
        }
        Update: {
          created_at?: string | null
          dj_id?: string
          event_id?: string
          id?: string
          set_end_at?: string | null
          set_start_at?: string | null
          slot_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_lineups_dj_id_fkey"
            columns: ["dj_id"]
            isOneToOne: false
            referencedRelation: "djs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_lineups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_series: {
        Row: {
          created_at: string | null
          default_venue_id: string | null
          description: string | null
          first_year: number | null
          id: string
          name: string
          primary_genre_id: string | null
          typical_duration_days: number | null
          typical_month: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_venue_id?: string | null
          description?: string | null
          first_year?: number | null
          id?: string
          name: string
          primary_genre_id?: string | null
          typical_duration_days?: number | null
          typical_month?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_venue_id?: string | null
          description?: string | null
          first_year?: number | null
          id?: string
          name?: string
          primary_genre_id?: string | null
          typical_duration_days?: number | null
          typical_month?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_series_default_venue_id_fkey"
            columns: ["default_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_series_primary_genre_id_fkey"
            columns: ["primary_genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          end_at: string | null
          headliner_dj_id: string | null
          id: string
          primary_genre_id: string | null
          source: string
          start_at: string
          status: string
          title: string
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_at?: string | null
          headliner_dj_id?: string | null
          id?: string
          primary_genre_id?: string | null
          source?: string
          start_at: string
          status?: string
          title: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_at?: string | null
          headliner_dj_id?: string | null
          id?: string
          primary_genre_id?: string | null
          source?: string
          start_at?: string
          status?: string
          title?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_headliner_dj_id_fkey"
            columns: ["headliner_dj_id"]
            isOneToOne: false
            referencedRelation: "djs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_primary_genre_id_fkey"
            columns: ["primary_genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      gems: {
        Row: {
          artist_name: string
          created_at: string | null
          event_date: string
          gem_system: Database["public"]["Enums"]["gem_system"]
          id: string
          is_verified: boolean | null
          notes: string | null
          photo_url: string | null
          rating: number | null
          subgenre_id: string | null
          updated_at: string | null
          user_id: string
          venue: string
        }
        Insert: {
          artist_name: string
          created_at?: string | null
          event_date: string
          gem_system: Database["public"]["Enums"]["gem_system"]
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          photo_url?: string | null
          rating?: number | null
          subgenre_id?: string | null
          updated_at?: string | null
          user_id: string
          venue: string
        }
        Update: {
          artist_name?: string
          created_at?: string | null
          event_date?: string
          gem_system?: Database["public"]["Enums"]["gem_system"]
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          photo_url?: string | null
          rating?: number | null
          subgenre_id?: string | null
          updated_at?: string | null
          user_id?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "gems_subgenre_id_fkey"
            columns: ["subgenre_id"]
            isOneToOne: false
            referencedRelation: "subgenres"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          color_hex: string
          created_at: string | null
          id: string
          name: string
          parent_genre_id: string | null
        }
        Insert: {
          color_hex: string
          created_at?: string | null
          id?: string
          name: string
          parent_genre_id?: string | null
        }
        Update: {
          color_hex?: string
          created_at?: string | null
          id?: string
          name?: string
          parent_genre_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genres_parent_genre_id_fkey"
            columns: ["parent_genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      }
      live_pulse_votes: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          lat: number | null
          lng: number | null
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          lat?: number | null
          lng?: number | null
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          lat?: number | null
          lng?: number | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_pulse_votes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          raver_rank: string | null
          total_gems: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          raver_rank?: string | null
          total_gems?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          raver_rank?: string | null
          total_gems?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      subgenres: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          system: Database["public"]["Enums"]["gem_system"]
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          name: string
          system: Database["public"]["Enums"]["gem_system"]
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          system?: Database["public"]["Enums"]["gem_system"]
        }
        Relationships: []
      }
      taste_profiles: {
        Row: {
          genre_weights: Json | null
          id: string
          top_artists: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          genre_weights?: Json | null
          id?: string
          top_artists?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          genre_weights?: Json | null
          id?: string
          top_artists?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          current_count: number | null
          id: string
          reference_id: string | null
          reference_name: string | null
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          current_count?: number | null
          id?: string
          reference_id?: string | null
          reference_name?: string | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          current_count?: number | null
          id?: string
          reference_id?: string | null
          reference_name?: string | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gems: {
        Row: {
          collected_at: string
          created_at: string | null
          dj_id: string
          edition_id: string | null
          event_date: string
          event_id: string | null
          facet_ratings: Json | null
          id: string
          is_genesis_mint: boolean | null
          is_rated: boolean | null
          primary_genre_id: string
          private_note: string | null
          rarity_score: number | null
          rarity_tier: string | null
          updated_at: string | null
          user_id: string
          venue_id: string | null
        }
        Insert: {
          collected_at?: string
          created_at?: string | null
          dj_id: string
          edition_id?: string | null
          event_date: string
          event_id?: string | null
          facet_ratings?: Json | null
          id?: string
          is_genesis_mint?: boolean | null
          is_rated?: boolean | null
          primary_genre_id: string
          private_note?: string | null
          rarity_score?: number | null
          rarity_tier?: string | null
          updated_at?: string | null
          user_id: string
          venue_id?: string | null
        }
        Update: {
          collected_at?: string
          created_at?: string | null
          dj_id?: string
          edition_id?: string | null
          event_date?: string
          event_id?: string | null
          facet_ratings?: Json | null
          id?: string
          is_genesis_mint?: boolean | null
          is_rated?: boolean | null
          primary_genre_id?: string
          private_note?: string | null
          rarity_score?: number | null
          rarity_tier?: string | null
          updated_at?: string | null
          user_id?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_gems_dj_id_fkey"
            columns: ["dj_id"]
            isOneToOne: false
            referencedRelation: "djs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gems_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "event_editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gems_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gems_primary_genre_id_fkey"
            columns: ["primary_genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gems_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          completed_at: string | null
          completed_gem_id: string | null
          created_at: string | null
          goal_type: string
          id: string
          reference_id: string | null
          reference_name: string
          target_date: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_gem_id?: string | null
          created_at?: string | null
          goal_type: string
          id?: string
          reference_id?: string | null
          reference_name: string
          target_date?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_gem_id?: string | null
          created_at?: string | null
          goal_type?: string
          id?: string
          reference_id?: string | null
          reference_name?: string
          target_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_completed_gem_id_fkey"
            columns: ["completed_gem_id"]
            isOneToOne: false
            referencedRelation: "user_gems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          capacity: number | null
          city: string
          country: string
          created_at: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          state: string | null
          updated_at: string | null
          venue_type: string
        }
        Insert: {
          capacity?: number | null
          city: string
          country: string
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          state?: string | null
          updated_at?: string | null
          venue_type: string
        }
        Update: {
          capacity?: number | null
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          state?: string | null
          updated_at?: string | null
          venue_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_rarity_score: {
        Args: {
          p_city: string
          p_dj_id: string
          p_event_date: string
          p_event_series_id: string
          p_venue_id: string
        }
        Returns: {
          city_count: number
          city_score: number
          event_count: number
          event_score: number
          rarity_tier: string
          total_score: number
          venue_count: number
          venue_score: number
          volume_score: number
          year_count: number
        }[]
      }
      get_artist_leaderboard: {
        Args: { p_dj_id: string; p_limit?: number }
        Returns: {
          avatar_url: string
          display_name: string
          first_collected: string
          gem_count: number
          rank: number
          user_id: string
        }[]
      }
      get_dj_city_count: {
        Args: { p_city: string; p_dj_id: string }
        Returns: number
      }
      get_dj_event_series_count: {
        Args: { p_dj_id: string; p_series_id: string }
        Returns: number
      }
      get_dj_venue_count: {
        Args: { p_dj_id: string; p_venue_id: string }
        Returns: number
      }
      get_dj_yearly_volume: { Args: { p_dj_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      gem_system:
        | "techno"
        | "house"
        | "dnb"
        | "bass"
        | "trance"
        | "uk"
        | "disco"
        | "harder"
        | "experimental"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      gem_system: [
        "techno",
        "house",
        "dnb",
        "bass",
        "trance",
        "uk",
        "disco",
        "harder",
        "experimental",
      ],
    },
  },
} as const
