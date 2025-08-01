-- ====================================
-- SCRIPT PARA ADICIONAR CAMPO LOJA_NOME
-- Adiciona campo de texto para identificar loja
-- ====================================

-- 1. Adicionar coluna loja_nome se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='clientes_fast' AND column_name='loja_nome'
  ) THEN
    ALTER TABLE clientes_fast ADD COLUMN loja_nome VARCHAR(255) DEFAULT 'N/A';
    RAISE NOTICE 'Added loja_nome column';
  ELSE
    RAISE NOTICE 'loja_nome column already exists';
  END IF;
END$$;

-- 2. Atualizar registros existentes que não têm loja_nome
UPDATE clientes_fast 
SET loja_nome = 'N/A' 
WHERE loja_nome IS NULL OR loja_nome = '';

-- 3. Verificar resultado
SELECT nome, email, role, loja_nome FROM clientes_fast WHERE role IN ('admin', 'gerente') ORDER BY role;

COMMIT;
