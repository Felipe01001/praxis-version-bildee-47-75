-- Primeiro, vamos remover todos os triggers que dependem da função problemática
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_user_custom_icons_updated_at ON public.user_custom_icons;
DROP TRIGGER IF EXISTS update_user_uploaded_icons_updated_at ON public.user_uploaded_icons;

-- Agora remove a função problemática
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recria o trigger correto para a tabela tasks usando a função que já existe e está correta
CREATE TRIGGER update_tasks_updated_at_trigger
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tasks_updated_at();

-- Recria os outros triggers usando a função correta para as outras tabelas
CREATE OR REPLACE FUNCTION public.update_user_icons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_custom_icons_updated_at_trigger
    BEFORE UPDATE ON public.user_custom_icons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_icons_updated_at();

CREATE TRIGGER update_user_uploaded_icons_updated_at_trigger
    BEFORE UPDATE ON public.user_uploaded_icons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_icons_updated_at();