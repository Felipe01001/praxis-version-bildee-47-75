-- Primeiro remove todos os triggers existentes
DROP TRIGGER IF EXISTS update_tasks_updated_at_trigger ON public.tasks;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_user_custom_icons_updated_at ON public.user_custom_icons;
DROP TRIGGER IF EXISTS update_user_uploaded_icons_updated_at ON public.user_uploaded_icons;

-- Remove a função problemática com CASCADE para remover dependências
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recria o trigger correto para tasks
CREATE TRIGGER update_tasks_updated_at_trigger
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tasks_updated_at();

-- Cria função para as outras tabelas que usam updated_at (snake_case)
CREATE OR REPLACE FUNCTION public.update_user_icons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recria triggers para as outras tabelas
CREATE TRIGGER update_user_custom_icons_updated_at_trigger
    BEFORE UPDATE ON public.user_custom_icons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_icons_updated_at();

CREATE TRIGGER update_user_uploaded_icons_updated_at_trigger
    BEFORE UPDATE ON public.user_uploaded_icons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_icons_updated_at();