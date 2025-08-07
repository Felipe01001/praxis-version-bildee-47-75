-- Update user_profiles table to support new avatar types
ALTER TABLE public.user_profiles
ALTER COLUMN avatar_data 
SET DEFAULT '{"color": "#8B9474", "character": null, "icon": null}'::jsonb;

-- Update existing records to include icon field if not present
UPDATE public.user_profiles 
SET avatar_data = avatar_data || '{"icon": null}'::jsonb
WHERE avatar_data IS NOT NULL 
AND NOT avatar_data ? 'icon';