
-- Add is_allowed column to competitions
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS is_allowed boolean DEFAULT false;

-- Seed allowed competitions (using ILIKE for safety)
UPDATE competitions 
SET is_allowed = true 
WHERE name ILIKE '%Premier League%'
   OR name ILIKE '%La Liga%'
   OR name ILIKE '%Primera Division%'
   OR name ILIKE '%Serie A%'
   OR name ILIKE '%Bundesliga%'
   OR name ILIKE '%Ligue 1%'
   OR name ILIKE '%Champions League%'
   OR name ILIKE '%Europa League%';
