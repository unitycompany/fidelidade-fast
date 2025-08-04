-- =============================================
-- CORRIGIR PERMISSÕES DE STORAGE
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Verificar se RLS está habilitado em storage.buckets
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'buckets';

-- 2. Desabilitar RLS temporariamente em storage.buckets (se necessário)
-- ATENÇÃO: Execute com cuidado em produção
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se o bucket existe diretamente no banco
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'notas-fiscais';

-- 4. Se não existir, criar o bucket diretamente
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
) 
SELECT 
  'notas-fiscais',
  'notas-fiscais',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE name = 'notas-fiscais'
);

-- 5. Verificar usuários e suas roles
SELECT 
  id,
  email,
  role,
  created_at
FROM auth.users 
LIMIT 5;

-- 6. Verificar clientes_fast table
SELECT 
  id,
  nome,
  email,
  role,
  created_at
FROM clientes_fast 
WHERE role IN ('admin', 'gerente')
LIMIT 5;

-- 7. Reabilitar RLS se necessário (opcional, só se desabilitou acima)
-- ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Resultado final
SELECT 'Verificação completa! Verifique os resultados acima.' as status;
