-- Migrar avatares pessoais para ícones globais
-- Inserir todos os avatares do usuário específico na tabela global_icons
INSERT INTO public.global_icons (
  icon_id,
  icon_name, 
  icon_type,
  icon_data,
  created_at,
  updated_at
)
SELECT 
  'uploaded_' || id::text as icon_id,
  icon_name,
  'uploaded' as icon_type,
  jsonb_build_object(
    'type', 'image',
    'file_url', file_url,
    'file_path', file_path,
    'mime_type', mime_type
  ) as icon_data,
  created_at,
  updated_at
FROM public.user_uploaded_icons 
WHERE user_id = '62c71176-dbec-4ee4-a92c-5edc3bc9932d';