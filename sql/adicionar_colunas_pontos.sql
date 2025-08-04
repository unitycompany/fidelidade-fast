-- Script para adicionar colunas de pontos na tabela clientes_fast
-- Execute apenas se as colunas não existirem

-- Adicionar colunas de pontos se não existirem
DO $$
BEGIN
    -- Verificar e adicionar saldo_pontos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clientes_fast' AND column_name = 'saldo_pontos') THEN
        ALTER TABLE clientes_fast ADD COLUMN saldo_pontos INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna saldo_pontos adicionada';
    END IF;
    
    -- Verificar e adicionar total_pontos_ganhos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clientes_fast' AND column_name = 'total_pontos_ganhos') THEN
        ALTER TABLE clientes_fast ADD COLUMN total_pontos_ganhos INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna total_pontos_ganhos adicionada';
    END IF;
    
    -- Verificar e adicionar total_pontos_gastos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clientes_fast' AND column_name = 'total_pontos_gastos') THEN
        ALTER TABLE clientes_fast ADD COLUMN total_pontos_gastos INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna total_pontos_gastos adicionada';
    END IF;
END $$;

-- Atualizar pontos zerados para valores padrão se necessário
UPDATE clientes_fast 
SET saldo_pontos = 0, total_pontos_ganhos = 0, total_pontos_gastos = 0 
WHERE saldo_pontos IS NULL OR total_pontos_ganhos IS NULL OR total_pontos_gastos IS NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_saldo_pontos ON clientes_fast(saldo_pontos);
CREATE INDEX IF NOT EXISTS idx_clientes_total_ganhos ON clientes_fast(total_pontos_ganhos);

COMMIT;
