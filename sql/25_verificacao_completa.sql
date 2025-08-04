-- =============================================
-- VERIFICAÇÃO COMPLETA DO SISTEMA
-- Execute passo a passo e me envie os resultados
-- =============================================

-- PASSO 1: Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'imagens_notas_fiscais'
) as tabela_existe;

-- PASSO 2: Se existe, mostrar estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'imagens_notas_fiscais' 
ORDER BY ordinal_position;

-- PASSO 3: Verificar registros existentes
SELECT COUNT(*) as total_registros FROM imagens_notas_fiscais;

-- PASSO 4: Verificar últimos registros (se houver)
SELECT 
  id,
  cliente_id,
  nome_arquivo,
  status_upload,
  created_at
FROM imagens_notas_fiscais 
ORDER BY created_at DESC 
LIMIT 5;

-- PASSO 5: Verificar se consegue inserir um registro de teste
INSERT INTO imagens_notas_fiscais (
  cliente_id,
  nome_arquivo,
  tipo_arquivo,
  tamanho_bytes,
  status_upload,
  url_supabase
) VALUES (
  (SELECT id FROM clientes_fast WHERE role = 'admin' LIMIT 1),
  'teste_manual.jpg',
  'image/jpeg',
  123456,
  'teste',
  'https://exemplo.com/teste.jpg'
) RETURNING id, nome_arquivo, status_upload;

-- PASSO 6: Remover o registro de teste
DELETE FROM imagens_notas_fiscais 
WHERE nome_arquivo = 'teste_manual.jpg' 
AND status_upload = 'teste';

-- PASSO 7: Verificar suas permissões
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users 
WHERE id = auth.uid();

-- PASSO 8: Verificar sua role personalizada
SELECT 
  id,
  nome,
  email,
  role
FROM clientes_fast 
WHERE id = auth.uid()::uuid;

SELECT 'Verificação completa finalizada!' as status;
