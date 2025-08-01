-- VERIFICAR E ADICIONAR COLUNA LOJA_NOME
-- Execute este comando no SQL Editor do Supabase

-- Verificar se a coluna existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'clientes_fast' 
AND column_name = 'loja_nome';

-- Se não retornar resultado, execute:
ALTER TABLE clientes_fast ADD COLUMN loja_nome VARCHAR(255) DEFAULT 'N/A';

-- Atualizar registros existentes
UPDATE clientes_fast SET loja_nome = 'N/A' WHERE loja_nome IS NULL;

-- Verificar resultado
SELECT nome, email, role, loja_nome FROM clientes_fast LIMIT 5;
