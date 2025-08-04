-- =============================================
-- VERIFICAÇÃO SIMPLES (SEM MODIFICAR SISTEMA)
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Verificar se você consegue ver a tabela storage.buckets
SELECT COUNT(*) as total_buckets FROM storage.buckets;

-- 2. Verificar especificamente o bucket notas-fiscais
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE name = 'notas-fiscais';

-- 3. Verificar suas permissões de usuário
SELECT 
  id,
  email,
  role
FROM auth.users 
WHERE id = auth.uid();

-- 4. Verificar sua role no sistema personalizado
SELECT 
  id,
  nome,
  email,
  role
FROM clientes_fast 
WHERE id = auth.uid()::uuid;

-- 5. Verificar se a tabela imagens_notas_fiscais existe
SELECT COUNT(*) as total_imagens FROM imagens_notas_fiscais;

-- Resultado
SELECT 'Verificação básica concluída!' as status;
