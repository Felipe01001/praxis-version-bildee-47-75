-- Tornar o bucket petition-files público para permitir acesso aos arquivos
UPDATE storage.buckets 
SET public = true 
WHERE name = 'petition-files';

-- Atualizar políticas para acesso público aos arquivos
CREATE POLICY "Petition files are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'petition-files');

-- Manter as políticas existentes para upload e delete com autenticação
DROP POLICY IF EXISTS "Users can upload petition files" ON storage.objects;
CREATE POLICY "Users can upload petition files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'petition-files' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete petition files" ON storage.objects;
CREATE POLICY "Users can delete petition files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'petition-files' AND auth.uid() IS NOT NULL);