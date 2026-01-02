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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      competitions: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_allowed: boolean | null
          name: string
          season: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_allowed?: boolean | null
          name: string
          season?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_allowed?: boolean | null
          name?: string
          season?: string | null
        }
        Relationships: []
      }
      lineup_positions: {
        Row: {
          created_at: string | null
          id: string
          is_starting_xi: boolean | null
          match_id: string | null
          player_id: string | null
          position: string | null
          shirt_number: number | null
          team_id: string | null
          x: number | null
          y: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_starting_xi?: boolean | null
          match_id?: string | null
          player_id?: string | null
          position?: string | null
          shirt_number?: number | null
          team_id?: string | null
          x?: number | null
          y?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_starting_xi?: boolean | null
          match_id?: string | null
          player_id?: string | null
          position?: string | null
          shirt_number?: number | null
          team_id?: string | null
          x?: number | null
          y?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lineup_positions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineup_positions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineup_positions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          competition_id: string | null
          created_at: string | null
          home_score: number | null
          home_team_id: string | null
          ht_away_score: number | null
          ht_home_score: number | null
          id: string
          kickoff_at: string | null
          provider: string | null
          provider_fixture_id: string | null
          season: string | null
          status: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          competition_id?: string | null
          created_at?: string | null
          home_score?: number | null
          home_team_id?: string | null
          ht_away_score?: number | null
          ht_home_score?: number | null
          id?: string
          kickoff_at?: string | null
          provider?: string | null
          provider_fixture_id?: string | null
          season?: string | null
          status?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          competition_id?: string | null
          created_at?: string | null
          home_score?: number | null
          home_team_id?: string | null
          ht_away_score?: number | null
          ht_home_score?: number | null
          id?: string
          kickoff_at?: string | null
          provider?: string | null
          provider_fixture_id?: string | null
          season?: string | null
          status?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      p_active: {
        Row: {
          created_at: string
          id: number
          num: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          num?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          num?: number | null
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string | null
          current_team_id: string | null
          dob: string | null
          foot: string | null
          height: number | null
          id: string
          name: string
          nationality: string | null
          position: string | null
          provider: string | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_team_id?: string | null
          dob?: string | null
          foot?: string | null
          height?: number | null
          id?: string
          name: string
          nationality?: string | null
          position?: string | null
          provider?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_team_id?: string | null
          dob?: string | null
          foot?: string | null
          height?: number | null
          id?: string
          name?: string
          nationality?: string | null
          position?: string | null
          provider?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_cache: {
        Row: {
          created_at: string | null
          data: Json
          expires_at: string
          id: string
          key: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          expires_at: string
          id?: string
          key: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
          key?: string
        }
        Relationships: []
      }
      report_players: {
        Row: {
          comment: string | null
          created_at: string | null
          grade: string | null
          id: string
          player_id: string | null
          position_in_match: string | null
          report_id: string | null
          verdict: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string
          player_id?: string | null
          position_in_match?: string | null
          report_id?: string | null
          verdict?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string
          player_id?: string | null
          position_in_match?: string | null
          report_id?: string | null
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_players_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          away_score: number | null
          away_system: string | null
          away_team_id: string | null
          competition_id: string | null
          conditions: string | null
          created_at: string | null
          halftime_away_score: number | null
          halftime_home_score: number | null
          home_score: number | null
          home_system: string | null
          home_team_id: string | null
          id: string
          lineup_data: Json | null
          match_date: string
          match_id: string | null
          referee: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_system?: string | null
          away_team_id?: string | null
          competition_id?: string | null
          conditions?: string | null
          created_at?: string | null
          halftime_away_score?: number | null
          halftime_home_score?: number | null
          home_score?: number | null
          home_system?: string | null
          home_team_id?: string | null
          id?: string
          lineup_data?: Json | null
          match_date: string
          match_id?: string | null
          referee?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_system?: string | null
          away_team_id?: string | null
          competition_id?: string | null
          conditions?: string | null
          created_at?: string | null
          halftime_away_score?: number | null
          halftime_home_score?: number | null
          home_score?: number | null
          home_system?: string | null
          home_team_id?: string | null
          id?: string
          lineup_data?: Json | null
          match_date?: string
          match_id?: string | null
          referee?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      team_competitions: {
        Row: {
          competition_id: string
          created_at: string | null
          id: string
          season: string | null
          team_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string | null
          id?: string
          season?: string | null
          team_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string | null
          id?: string
          season?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_competitions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_competitions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_roster_players: {
        Row: {
          created_at: string | null
          id: string
          player_id: string | null
          position: string | null
          shirt_number: number | null
          team_roster_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          player_id?: string | null
          position?: string | null
          shirt_number?: number | null
          team_roster_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          player_id?: string | null
          position?: string | null
          shirt_number?: number | null
          team_roster_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_roster_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_roster_players_team_roster_id_fkey"
            columns: ["team_roster_id"]
            isOneToOne: false
            referencedRelation: "team_rosters"
            referencedColumns: ["id"]
          },
        ]
      }
      team_rosters: {
        Row: {
          created_at: string | null
          id: string
          month: string | null
          source: string | null
          source_meta: Json | null
          status: string | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          month?: string | null
          source?: string | null
          source_meta?: Json | null
          status?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: string | null
          source?: string | null
          source_meta?: Json | null
          status?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_rosters_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          provider: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          provider?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          provider?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          name: string | null
          token_identifier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          name?: string | null
          token_identifier: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          name?: string | null
          token_identifier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
