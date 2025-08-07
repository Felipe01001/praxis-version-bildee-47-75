-- Remove o trigger problemático que está causando erro
DROP TRIGGER IF EXISTS update_tasks_updated_at_trigger ON public.tasks;

-- Remove a função problemática que está tentando acessar campo inexistente
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Mantém apenas a função correta que usa updatedAt (camelCase)
-- A função update_tasks_updated_at() já existe e está correta

-- Recria o trigger correto
CREATE TRIGGER update_tasks_updated_at_trigger
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tasks_updated_at();