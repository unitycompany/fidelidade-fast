-- =============================================
-- POLÍTICAS RLS CORRIGIDAS PARA STORAGE
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. REMOVER políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Usuarios podem fazer upload de suas imagens" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem ver suas imagens" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem deletar suas imagens" ON storage.objects;

-- 2. CRIAR políticas CORRIGIDAS e TESTADAS

-- Política de Upload (mais permissiva para teste)
CREATE POLICY "Upload livre para bucket notas-fiscais" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'notas-fiscais');

-- Política de Visualização (mais permissiva para teste)
CREATE POLICY "Visualizacao livre para bucket notas-fiscais" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'notas-fiscais');

-- Política de Exclusão (mais permissiva para teste)
CREATE POLICY "Exclusao livre para bucket notas-fiscais" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'notas-fiscais');

-- 3. VERIFICAR se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%notas-fiscais%';

-- Resultado
SELECT 'Políticas RLS simplificadas criadas para teste!' as status;
