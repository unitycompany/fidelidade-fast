-- =============================================
-- VERSÃO SIMPLES - DESABILITAR RLS TEMPORARIAMENTE
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Verificar se a tabela existe
SELECT COUNT(*) as registros_existentes FROM imagens_notas_fiscais;

-- 2. Desabilitar RLS temporariamente para teste
ALTER TABLE imagens_notas_fiscais DISABLE ROW LEVEL SECURITY;

-- 3. Teste de inserção manual
INSERT INTO imagens_notas_fiscais (
  cliente_id,
  nome_arquivo,
  url_supabase,
  tipo_arquivo,
  tamanho_bytes,
  status_upload
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  'teste_rls.jpg',
  'https://exemplo.com/teste_rls.jpg',
  'image/jpeg',
  123456,
  'processado'
) RETURNING id, nome_arquivo;

-- 4. Limpar teste
DELETE FROM imagens_notas_fiscais WHERE nome_arquivo = 'teste_rls.jpg';

-- Resultado
SELECT 'RLS desabilitado! Agora teste o upload na aplicação.' as status;
