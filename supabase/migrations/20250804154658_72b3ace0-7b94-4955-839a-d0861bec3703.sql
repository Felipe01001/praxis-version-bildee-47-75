-- Create table for custom user icons
CREATE TABLE public.user_custom_icons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  icon_id TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  icon_type TEXT NOT NULL DEFAULT 'lucide', -- 'lucide', 'custom', etc.
  icon_data JSONB, -- For storing additional icon metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, icon_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_custom_icons ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own custom icons" 
ON public.user_custom_icons 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom icons" 
ON public.user_custom_icons 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom icons" 
ON public.user_custom_icons 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom icons" 
ON public.user_custom_icons 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_custom_icons_updated_at
BEFORE UPDATE ON public.user_custom_icons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();