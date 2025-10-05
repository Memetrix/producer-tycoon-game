-- Remove old beats with invalid timestamp IDs (not UUIDs)
-- This cleans up beats created before the UUID fix
DELETE FROM beats 
WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
