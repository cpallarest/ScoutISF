export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          dob: string | null
          height: number | null
          foot: "Left" | "Right" | "Both" | null
          position: string | null
          nationality: string | null
          current_team_id: string | null
          provider: string | null
          provider_player_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          dob?: string | null
          height?: number | null
          foot?: "Left" | "Right" | "Both" | null
          position?: string | null
          nationality?: string | null
          current_team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          dob?: string | null
          height?: number | null
          foot?: "Left" | "Right" | "Both" | null
          position?: string | null
          nationality?: string | null
          current_team_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          country: string | null
          logo_url: string | null
          provider: string | null
          provider_team_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string | null
          logo_url?: string | null
          created_at?: string
        }
      }
      competitions: {
        Row: {
          id: string
          name: string
          country: string | null
          season: string | null
          provider: string | null
          provider_competition_id: string | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country?: string | null
          season?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string | null
          season?: string | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          provider: string | null
          provider_fixture_id: string | null
          competition_id: string | null
          season: string | null
          home_team_id: string | null
          away_team_id: string | null
          kickoff_at: string | null
          venue: string | null
          status: string | null
          home_score: number | null
          away_score: number | null
          ht_home_score: number | null
          ht_away_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider?: string | null
          provider_fixture_id?: string | null
          competition_id?: string | null
          season?: string | null
          home_team_id?: string | null
          away_team_id?: string | null
          kickoff_at?: string | null
          venue?: string | null
          status?: string | null
          home_score?: number | null
          away_score?: number | null
          ht_home_score?: number | null
          ht_away_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider?: string | null
          provider_fixture_id?: string | null
          competition_id?: string | null
          season?: string | null
          home_team_id?: string | null
          away_team_id?: string | null
          kickoff_at?: string | null
          venue?: string | null
          status?: string | null
          home_score?: number | null
          away_score?: number | null
          ht_home_score?: number | null
          ht_away_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      lineup_positions: {
        Row: {
          id: string
          match_id: string | null
          team_id: string | null
          player_id: string | null
          is_starting_xi: boolean | null
          shirt_number: number | null
          position: string | null
          x: number | null
          y: number | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id?: string | null
          team_id?: string | null
          player_id?: string | null
          is_starting_xi?: boolean | null
          shirt_number?: number | null
          position?: string | null
          x?: number | null
          y?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string | null
          team_id?: string | null
          player_id?: string | null
          is_starting_xi?: boolean | null
          shirt_number?: number | null
          position?: string | null
          x?: number | null
          y?: number | null
          created_at?: string
        }
      }
      provider_cache: {
        Row: {
          id: string
          key: string
          data: Json
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          data: Json
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          data?: Json
          expires_at?: string
          created_at?: string
        }
      }
      team_rosters: {
        Row: {
          id: string
          team_id: string | null
          month: string | null
          status: string | null
          source: string | null
          source_meta: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id?: string | null
          month?: string | null
          status?: string | null
          source?: string | null
          source_meta?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string | null
          month?: string | null
          status?: string | null
          source?: string | null
          source_meta?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      team_roster_players: {
        Row: {
          id: string
          team_roster_id: string | null
          player_id: string | null
          shirt_number: number | null
          position: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_roster_id?: string | null
          player_id?: string | null
          shirt_number?: number | null
          position?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_roster_id?: string | null
          player_id?: string | null
          shirt_number?: number | null
          position?: string | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string | null
          match_date: string
          home_team_id: string | null
          away_team_id: string | null
          competition_id: string | null
          home_score: number | null
          away_score: number | null
          halftime_home_score: number | null
          halftime_away_score: number | null
          venue: string | null
          referee: string | null
          conditions: string | null
          home_system: string | null
          away_system: string | null
          status: "draft" | "published" | null
          lineup_data: Json | null
          match_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          match_date: string
          home_team_id?: string | null
          away_team_id?: string | null
          competition_id?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: "draft" | "published" | null
          lineup_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          match_date?: string
          home_team_id?: string | null
          away_team_id?: string | null
          competition_id?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: "draft" | "published" | null
          lineup_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      report_players: {
        Row: {
          id: string
          report_id: string | null
          player_id: string | null
          position_in_match: string | null
          grade: "A" | "B" | "C" | "D" | null
          verdict: "Descartar" | "Seguir" | "Interesante" | "Fichar" | null
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id?: string | null
          player_id?: string | null
          grade?: "A" | "B" | "C" | "D" | null
          verdict?: "Descartar" | "Seguir" | "Interesante" | "Fichar" | null
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string | null
          player_id?: string | null
          grade?: "A" | "B" | "C" | "D" | null
          verdict?: "Descartar" | "Seguir" | "Interesante" | "Fichar" | null
          comment?: string | null
          created_at?: string
        }
      }
    }
  }
}
