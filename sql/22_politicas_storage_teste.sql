-- =============================================
-- POLÍTICAS RLS SIMPLIFICADAS PARA TESTE
-- Use este script se o anterior não funcionar
-- =============================================

-- 1. Políticas mais permissivas para teste inicial

-- Política de Upload (permite qualquer usuário autenticado)
CREATE POLICY "Upload notas fiscais teste" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'notas-fiscais' AND 
  auth.uid() IS NOT NULL
);

-- Política de Visualização (permite admins verem tudo)
CREATE POLICY "Ver notas fiscais teste" ON storage.objects
FOR SELECT USING (
  bucket_id = 'notas-fiscais' AND 
  (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM clientes_fast 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'gerente')
    )
  )
);

-- Política de Exclusão (só admins)
CREATE POLICY "Deletar notas fiscais teste" ON storage.objects
FOR DELETE USING (
  bucket_id = 'notas-fiscais' AND 
  EXISTS (
    SELECT 1 FROM clientes_fast 
    WHERE id = auth.uid()::uuid 
    AND role IN ('admin', 'gerente')
  )
);

SELECT 'Políticas de teste criadas! Teste o upload agora.' as status;
