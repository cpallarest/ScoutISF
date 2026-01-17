-- Create unique index on teams.name to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS teams_name_unique ON public.teams (name);
