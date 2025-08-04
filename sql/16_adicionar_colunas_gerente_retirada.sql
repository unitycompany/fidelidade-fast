-- Adicionar colunas para rastrear quem processou a retirada dos resgates
-- Executar este script no Supabase SQL Editor

-- Adicionar coluna para armazenar informações do gerente que processou a retirada
ALTER TABLE resgates 
ADD COLUMN IF NOT EXISTS gerente_retirada TEXT;

-- Adicionar coluna para armazenar o ID do usuário que processou a retirada  
ALTER TABLE resgates 
ADD COLUMN IF NOT EXISTS usuario_retirada_id UUID;

-- Adicionar comentários para documentar as colunas
COMMENT ON COLUMN resgates.gerente_retirada IS 'Nome do gerente e loja que processou a retirada (formato: "Nome Gerente | Nome Loja")';
COMMENT ON COLUMN resgates.usuario_retirada_id IS 'ID do usuário (gerente/admin) que marcou o resgate como retirado';

-- Criar índice para melhorar performance das consultas por usuário que processou
CREATE INDEX IF NOT EXISTS idx_resgates_usuario_retirada 
ON resgates(usuario_retirada_id);

-- Verificar se as colunas foram criadas corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'resgates' 
AND column_name IN ('gerente_retirada', 'usuario_retirada_id')
ORDER BY column_name;
