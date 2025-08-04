-- =============================================
-- POLÍTICAS RLS PARA STORAGE.OBJECTS
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Usuarios podem fazer upload de suas imagens" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem ver suas imagens" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem deletar suas imagens" ON storage.objects;

-- 2. Criar políticas corretas para storage.objects

-- Política de Upload (INSERT)
CREATE POLICY "Usuarios podem fazer upload de suas imagens" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'notas-fiscais' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política de Visualização (SELECT)
CREATE POLICY "Usuarios podem ver suas imagens" ON storage.objects
FOR SELECT USING (
  bucket_id = 'notas-fiscais' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM clientes_fast 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'gerente')
    )
  )
);

-- Política de Exclusão (DELETE)
CREATE POLICY "Usuarios podem deletar suas imagens" ON storage.objects
FOR DELETE USING (
  bucket_id = 'notas-fiscais' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM clientes_fast 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'gerente')
    )
  )
);

-- 3. Verificar se as políticas foram criadas corretamente
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%notas%';

-- Mensagem de confirmação
SELECT 'Políticas RLS criadas com sucesso para o bucket notas-fiscais!' as status;
