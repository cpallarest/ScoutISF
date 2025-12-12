
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  dob DATE,
  height NUMERIC, -- in cm or m
  foot TEXT CHECK (foot IN ('Left', 'Right', 'Both')),
  position TEXT,
  nationality TEXT,
  current_team_id UUID, -- We might need this later, but for now let's keep it simple
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT,
  season TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  competition_id UUID REFERENCES competitions(id),
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  lineup_data JSONB, -- Stores tactical field coordinates: [{playerId, x, y, dorsal, name}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create report_players table (evaluations)
CREATE TABLE IF NOT EXISTS report_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D')),
  verdict TEXT CHECK (verdict IN ('Descartar', 'Seguir', 'Interesante', 'Fichar')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies (simplified for now, allowing authenticated users to do everything)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_players ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated read access" ON players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert access" ON players FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update access" ON players FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert access" ON teams FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read access" ON competitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert access" ON competitions FOR INSERT TO authenticated WITH CHECK (true);

-- Reports: Users can only see their own reports (per PRD: "Private Report Visibility")
CREATE POLICY "Users can view own reports" ON reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON reports FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON reports FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Report Players: Inherit access from report
CREATE POLICY "Users can view own report players" ON report_players FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM reports WHERE reports.id = report_players.report_id AND reports.user_id = auth.uid())
);
CREATE POLICY "Users can insert own report players" ON report_players FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM reports WHERE reports.id = report_players.report_id AND reports.user_id = auth.uid())
);
CREATE POLICY "Users can update own report players" ON report_players FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM reports WHERE reports.id = report_players.report_id AND reports.user_id = auth.uid())
);
CREATE POLICY "Users can delete own report players" ON report_players FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM reports WHERE reports.id = report_players.report_id AND reports.user_id = auth.uid())
);

-- Insert some dummy data for teams and competitions
INSERT INTO teams (name, country) VALUES 
('Real Madrid', 'Spain'),
('FC Barcelona', 'Spain'),
('Manchester City', 'England'),
('Liverpool', 'England'),
('Bayern Munich', 'Germany'),
('Dortmund', 'Germany');

INSERT INTO competitions (name, country, season) VALUES 
('La Liga', 'Spain', '2023-2024'),
('Premier League', 'England', '2023-2024'),
('Champions League', 'Europe', '2023-2024');

