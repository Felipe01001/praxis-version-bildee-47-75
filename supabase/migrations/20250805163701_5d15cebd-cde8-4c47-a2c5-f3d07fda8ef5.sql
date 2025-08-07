-- Recriar trigger para atualizar automaticamente updatedAt na tabela tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at_trigger ON public.tasks;

CREATE TRIGGER update_tasks_updated_at_trigger
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tasks_updated_at();