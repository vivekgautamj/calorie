-- Clean up duplicate nutrition goals
-- This script removes duplicate entries and keeps only the most recent one per user

-- First, let's see what duplicates exist
SELECT user_id, COUNT(*) as count
FROM nutrition_goals
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Delete duplicate entries, keeping only the most recent one per user
DELETE FROM nutrition_goals
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM nutrition_goals
  ORDER BY user_id, updated_at DESC
);

-- Verify the cleanup
SELECT user_id, COUNT(*) as count
FROM nutrition_goals
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Show final count
SELECT COUNT(*) as total_goals FROM nutrition_goals; 