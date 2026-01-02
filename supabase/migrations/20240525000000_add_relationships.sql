
-- Add team_id to players
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);

-- Create team_competitions pivot table
CREATE TABLE IF NOT EXISTS team_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  season TEXT, -- Optional season field
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, competition_id) -- Enforcing unique pair per team-competition (ignoring season for simplicity in uniqueness to avoid duplicates across seasons if not desired, or add season to constraint if needed. Prompt says: "UNIQUE(team_id, competition_id) si season NO se usa")
);

CREATE INDEX IF NOT EXISTS idx_team_competitions_team_id ON team_competitions(team_id);
CREATE INDEX IF NOT EXISTS idx_team_competitions_competition_id ON team_competitions(competition_id);

-- Enable RLS (though table is public/global, we follow project pattern)
ALTER TABLE team_competitions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to do everything (internal tool)
CREATE POLICY "Enable all access for authenticated users" ON team_competitions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
