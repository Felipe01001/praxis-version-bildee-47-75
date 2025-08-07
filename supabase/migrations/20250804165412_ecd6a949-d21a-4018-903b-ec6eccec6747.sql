-- Remove global avatars table
DROP TABLE IF EXISTS public.global_avatars;

-- Remove predefined option from avatar_type enum if exists
-- (Since we can't modify enum directly, we'll just leave it for backward compatibility)