
-- Add composite unique constraint for competitions sync
ALTER TABLE competitions
ADD CONSTRAINT competitions_provider_unique UNIQUE (provider, provider_competition_id, season);

-- Add composite unique constraint for teams sync (optional but good for safety)
-- provider_team_id is already unique per the previous migration, but teams might change per season? 
-- Usually teams are static entities, but let's stick to the requested constraint for competitions.

-- Ensure provider_competition_id is not null for api_football records (best effort for new ones)
-- We can't easily enforce NOT NULL if there are existing rows, but we can try.
