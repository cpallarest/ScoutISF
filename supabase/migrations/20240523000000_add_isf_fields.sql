
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS halftime_home_score integer,
ADD COLUMN IF NOT EXISTS halftime_away_score integer,
ADD COLUMN IF NOT EXISTS venue text,
ADD COLUMN IF NOT EXISTS referee text,
ADD COLUMN IF NOT EXISTS conditions text,
ADD COLUMN IF NOT EXISTS home_system text,
ADD COLUMN IF NOT EXISTS away_system text;

ALTER TABLE report_players
ADD COLUMN IF NOT EXISTS position_in_match text;
