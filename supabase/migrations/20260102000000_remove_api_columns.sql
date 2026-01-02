
-- Remove provider related columns from teams
ALTER TABLE teams 
DROP COLUMN IF EXISTS provider_team_id,
DROP COLUMN IF EXISTS provider_logo_url; -- Assuming this might exist or just standard cleanup

-- Remove provider related columns from competitions
ALTER TABLE competitions 
DROP COLUMN IF EXISTS provider_competition_id,
DROP COLUMN IF EXISTS provider;

-- Remove provider related columns from matches
ALTER TABLE matches 
DROP COLUMN IF EXISTS provider_match_id,
DROP COLUMN IF EXISTS provider_status, -- If exists
DROP COLUMN IF EXISTS external_id; -- If exists

-- Remove provider related columns from players
ALTER TABLE players 
DROP COLUMN IF EXISTS provider_player_id,
DROP COLUMN IF EXISTS api_id; -- If exists

-- Cleanup generic provider columns if they exist in other tables
-- (Based on common patterns, but specific ones found in types)
