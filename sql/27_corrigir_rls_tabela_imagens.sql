-- =============================================
-- CORRIGIR RLS DA TABELA IMAGENS_NOTAS_FISCAIS
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Verificar se RLS está ativo na tabela
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'imagens_notas_fiscais';

-- 2. TEMPORARIAMENTE desabilitar RLS para teste
ALTER TABLE imagens_notas_fiscais DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se consegue inserir agora (teste manual)
-- Primeiro, vamos pegar um cliente_id real que existe
DO $$
DECLARE
    cliente_real UUID;
BEGIN
    -- Buscar um cliente existente
    SELECT id INTO cliente_real FROM clientes_fast LIMIT 1;
    
    IF cliente_real IS NOT NULL THEN
        -- Inserir com cliente real
        INSERT INTO imagens_notas_fiscais (
          cliente_id,
          nome_arquivo,
          url_supabase,
          tipo_arquivo,
          tamanho_bytes,
          status_upload
        ) VALUES (
          cliente_real,
          'teste_manual.jpg',
          'https://exemplo.com/teste.jpg',
          'image/jpeg',
          123456,
          'processado'
        );
        
        RAISE NOTICE 'Inserção bem-sucedida com cliente_id: %', cliente_real;
        
        -- Remover o registro de teste
        DELETE FROM imagens_notas_fiscais 
        WHERE nome_arquivo = 'teste_manual.jpg' 
        AND status_upload = 'processado';
        
        RAISE NOTICE 'Teste concluído e dados limpos';
    ELSE
        RAISE NOTICE 'Nenhum cliente encontrado na tabela clientes_fast';
    END IF;
END $$;

-- 4. REABILITAR RLS com políticas corretas
ALTER TABLE imagens_notas_fiscais ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas simples para a tabela
CREATE POLICY "Inserir imagens" ON imagens_notas_fiscais
FOR INSERT WITH CHECK (true);

CREATE POLICY "Visualizar imagens" ON imagens_notas_fiscais
FOR SELECT USING (true);

CREATE POLICY "Atualizar imagens" ON imagens_notas_fiscais
FOR UPDATE USING (true);

CREATE POLICY "Deletar imagens" ON imagens_notas_fiscais
FOR DELETE USING (true);

-- 7. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'imagens_notas_fiscais';

-- Resultado
SELECT 'Políticas da tabela imagens_notas_fiscais configuradas!' as status;
