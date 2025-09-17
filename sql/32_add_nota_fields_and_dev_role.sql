-- ====================================
-- ALTERAÇÕES PARA NOTAS E ROLE 'DEV'
-- ====================================

-- 1) Adicionar campos na tabela imagens_notas_fiscais para armazenar o retorno do n8n
ALTER TABLE imagens_notas_fiscais
  ADD COLUMN IF NOT EXISTS pontos_retornados INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dados_nota JSONB;

COMMENT ON COLUMN imagens_notas_fiscais.pontos_retornados IS 'Total de pontos retornados pela análise da nota';
COMMENT ON COLUMN imagens_notas_fiscais.dados_nota IS 'Payload/JSON resumido da nota retornado pelo n8n';

-- 2) Garantir que a coluna role em clientes_fast aceite o valor 'dev'
DO $$
BEGIN
  -- Remover constraint existente, se houver conflito
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'clientes_fast'::regclass
      AND conname = 'check_clientes_fast_role_new'
  ) THEN
    ALTER TABLE clientes_fast DROP CONSTRAINT check_clientes_fast_role_new;
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- Ignorar se a tabela ainda não existir neste ambiente
  NULL;
END$$;

-- Criar (ou recriar) a constraint permitindo 'dev'
DO $$
BEGIN
  ALTER TABLE clientes_fast
    ADD CONSTRAINT check_clientes_fast_role_new
    CHECK (role IN ('admin', 'gerente', 'cliente', 'dev'));
EXCEPTION WHEN duplicate_object THEN
  -- Se já existir, tenta atualizar via alter constraint não é suportado; então ignora
  NULL;
END$$;

-- 3) Política extra (opcional) para permitir que DEV visualize todas as imagens de notas
--    Caso sua política já trate admin/gerente, inclua também 'dev'
DO $$
BEGIN
  -- Remover política antiga que só inclui admin/gerente, se existir, e recriar com 'dev'
  -- OBS: Nomes de políticas podem variar; este bloco é seguro para rodar múltiplas vezes.
  BEGIN
    DROP POLICY IF EXISTS "Admins podem ver todas as imagens" ON imagens_notas_fiscais;
  EXCEPTION WHEN undefined_object THEN
    NULL;
  END;

  CREATE POLICY "Admins e Devs podem ver todas as imagens" ON imagens_notas_fiscais
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM clientes_fast 
        WHERE id = auth.uid()::uuid 
          AND role IN ('admin', 'gerente', 'dev')
      )
    );
EXCEPTION WHEN undefined_table THEN
  -- Se a tabela/política ainda não existe neste ambiente, ignore
  NULL;
END$$;

COMMIT;
