-- Fix the trigger for tasks table
-- The issue is that the trigger is trying to access "updated_at" but the column is "updatedAt"

CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_tasks_updated_at_trigger ON public.tasks;

-- Create the trigger for tasks table with correct column name
CREATE TRIGGER update_tasks_updated_at_trigger
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_tasks_updated_at();