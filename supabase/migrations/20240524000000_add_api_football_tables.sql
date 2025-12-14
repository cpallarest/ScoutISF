
-- Add provider fields to existing tables
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'api_football',
ADD COLUMN IF NOT EXISTS provider_competition_id text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'api_football',
ADD COLUMN IF NOT EXISTS provider_team_id text;

ALTER TABLE players
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'api_football',
ADD COLUMN IF NOT EXISTS provider_player_id text;

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text DEFAULT 'api_football',
  provider_fixture_id text UNIQUE,
  competition_id uuid REFERENCES competitions(id),
  season text,
  home_team_id uuid REFERENCES teams(id),
  away_team_id uuid REFERENCES teams(id),
  kickoff_at timestamptz,
  venue text,
  status text, -- scheduled | live | finished
  home_score integer,
  away_score integer,
  ht_home_score integer,
  ht_away_score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_rosters table
CREATE TABLE IF NOT EXISTS team_rosters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid REFERENCES teams(id),
  month date,
  status text DEFAULT 'pending', -- verified | pending | failed
  source text DEFAULT 'api_football',
  source_meta jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_roster_players table
CREATE TABLE IF NOT EXISTS team_roster_players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_roster_id uuid REFERENCES team_rosters(id),
  player_id uuid REFERENCES players(id),
  shirt_number integer,
  position text,
  created_at timestamptz DEFAULT now()
);

-- Create lineup_positions table
CREATE TABLE IF NOT EXISTS lineup_positions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid REFERENCES matches(id),
  team_id uuid REFERENCES teams(id),
  player_id uuid REFERENCES players(id),
  is_starting_xi boolean DEFAULT true,
  shirt_number integer,
  position text,
  x numeric,
  y numeric,
  created_at timestamptz DEFAULT now()
);

-- Create provider_cache table
CREATE TABLE IF NOT EXISTS provider_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add match_id to reports
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS match_id uuid REFERENCES matches(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_competition_season ON matches(competition_id, season);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_at);
CREATE INDEX IF NOT EXISTS idx_lineup_positions_match ON lineup_positions(match_id);
CREATE INDEX IF NOT EXISTS idx_provider_cache_key ON provider_cache(key);
