-- Add avatar configuration fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN avatar_type text DEFAULT 'initials',
ADD COLUMN avatar_data jsonb DEFAULT '{"color": "#8B9474", "character": null}'::jsonb;