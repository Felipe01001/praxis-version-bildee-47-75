-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.update_tasks_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$;

-- Also fix the existing update_updated_at_column function if it exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;