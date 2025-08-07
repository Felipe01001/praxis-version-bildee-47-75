-- Verificar se o bucket petition-files existe e criar se necessário
INSERT INTO storage.buckets (id, name, public) 
VALUES ('petition-files', 'petition-files', false)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas de storage para petition-files se não existirem
DO $$ 
BEGIN
    -- Política para visualizar arquivos próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can view their own petition files'
    ) THEN
        CREATE POLICY "Users can view their own petition files"
        ON storage.objects
        FOR SELECT
        USING (bucket_id = 'petition-files' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    -- Política para upload de arquivos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload petition files'
    ) THEN
        CREATE POLICY "Users can upload petition files"
        ON storage.objects
        FOR INSERT
        WITH CHECK (bucket_id = 'petition-files' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    -- Política para deletar arquivos próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete their own petition files'
    ) THEN
        CREATE POLICY "Users can delete their own petition files"
        ON storage.objects
        FOR DELETE
        USING (bucket_id = 'petition-files' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;