-- Modificar políticas para tornar avatares e ícones globais para todos os usuários

-- 1. Permitir que todos vejam ícones personalizados de outros usuários
DROP POLICY IF EXISTS "Anyone can view custom icons" ON public.user_custom_icons;
CREATE POLICY "Anyone can view custom icons" 
ON public.user_custom_icons 
FOR SELECT 
USING (true);

-- 2. Permitir que todos vejam ícones enviados por outros usuários  
DROP POLICY IF EXISTS "Users can view their own uploaded icons" ON public.user_uploaded_icons;
CREATE POLICY "Anyone can view uploaded icons" 
ON public.user_uploaded_icons 
FOR SELECT 
USING (true);

-- 3. Criar função para copiar avatares para globais
CREATE OR REPLACE FUNCTION copy_user_avatars_to_global()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    avatar_record RECORD;
BEGIN
    -- Copiar ícones personalizados únicos para globais
    FOR avatar_record IN 
        SELECT DISTINCT ON (icon_id, icon_name) 
            icon_id, icon_name, icon_type, icon_data
        FROM public.user_custom_icons 
        WHERE NOT EXISTS (
            SELECT 1 FROM public.global_icons 
            WHERE global_icons.icon_id = user_custom_icons.icon_id
        )
    LOOP
        INSERT INTO public.global_icons (icon_id, icon_name, icon_type, icon_data)
        VALUES (
            avatar_record.icon_id,
            avatar_record.icon_name, 
            avatar_record.icon_type,
            avatar_record.icon_data
        )
        ON CONFLICT (icon_id) DO NOTHING;
    END LOOP;
    
    -- Copiar ícones enviados únicos para globais (como imagens)
    FOR avatar_record IN 
        SELECT DISTINCT ON (icon_name) 
            id, icon_name, file_url, file_path
        FROM public.user_uploaded_icons
        WHERE NOT EXISTS (
            SELECT 1 FROM public.global_icons 
            WHERE global_icons.icon_id = ('uploaded_' || user_uploaded_icons.id)
        )
    LOOP
        INSERT INTO public.global_icons (icon_id, icon_name, icon_type, icon_data)
        VALUES (
            'uploaded_' || avatar_record.id,
            avatar_record.icon_name,
            'image',
            jsonb_build_object(
                'type', 'image',
                'file_url', avatar_record.file_url,
                'file_path', avatar_record.file_path
            )
        )
        ON CONFLICT (icon_id) DO NOTHING;
    END LOOP;
END;
$$;

-- 4. Executar a função para copiar avatares existentes
SELECT copy_user_avatars_to_global();

-- 5. Criar trigger para copiar automaticamente novos uploads para globais
CREATE OR REPLACE FUNCTION auto_copy_avatar_to_global()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Para ícones personalizados
    IF TG_TABLE_NAME = 'user_custom_icons' THEN
        INSERT INTO public.global_icons (icon_id, icon_name, icon_type, icon_data)
        VALUES (NEW.icon_id, NEW.icon_name, NEW.icon_type, NEW.icon_data)
        ON CONFLICT (icon_id) DO NOTHING;
    END IF;
    
    -- Para ícones enviados
    IF TG_TABLE_NAME = 'user_uploaded_icons' THEN
        INSERT INTO public.global_icons (icon_id, icon_name, icon_type, icon_data)
        VALUES (
            'uploaded_' || NEW.id,
            NEW.icon_name,
            'image',
            jsonb_build_object(
                'type', 'image',
                'file_url', NEW.file_url,
                'file_path', NEW.file_path
            )
        )
        ON CONFLICT (icon_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 6. Criar triggers
DROP TRIGGER IF EXISTS copy_custom_icon_to_global ON public.user_custom_icons;
CREATE TRIGGER copy_custom_icon_to_global
    AFTER INSERT ON public.user_custom_icons
    FOR EACH ROW
    EXECUTE FUNCTION auto_copy_avatar_to_global();

DROP TRIGGER IF EXISTS copy_uploaded_icon_to_global ON public.user_uploaded_icons;  
CREATE TRIGGER copy_uploaded_icon_to_global
    AFTER INSERT ON public.user_uploaded_icons
    FOR EACH ROW
    EXECUTE FUNCTION auto_copy_avatar_to_global();