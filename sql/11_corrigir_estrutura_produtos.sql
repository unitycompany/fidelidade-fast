-- Script para corrigir estrutura da tabela produtos_elegiveis
-- Adicionar colunas que podem estar faltando

-- Adicionar coluna 'ativa' se não existir
DO $$
BEGIN
    -- Verificar se a coluna 'ativa' existe
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'produtos_elegiveis' 
        AND column_name = 'ativa'
    ) THEN
        ALTER TABLE produtos_elegiveis ADD COLUMN ativa BOOLEAN DEFAULT true;
        RAISE NOTICE 'Coluna ativa adicionada à tabela produtos_elegiveis';
    ELSE
        RAISE NOTICE 'Coluna ativa já existe na tabela produtos_elegiveis';
    END IF;
END $$;

-- Adicionar coluna 'created_at' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'produtos_elegiveis' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE produtos_elegiveis ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Coluna created_at adicionada à tabela produtos_elegiveis';
    ELSE
        RAISE NOTICE 'Coluna created_at já existe na tabela produtos_elegiveis';
    END IF;
END $$;

-- Adicionar coluna 'updated_at' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'produtos_elegiveis' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE produtos_elegiveis ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Coluna updated_at adicionada à tabela produtos_elegiveis';
    ELSE
        RAISE NOTICE 'Coluna updated_at já existe na tabela produtos_elegiveis';
    END IF;
END $$;

-- Atualizar todos os produtos existentes para ativa = true se a coluna foi criada
UPDATE produtos_elegiveis SET ativa = true WHERE ativa IS NULL;

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'produtos_elegiveis'
ORDER BY ordinal_position;

-- Mostrar conteúdo atual da tabela
SELECT * FROM produtos_elegiveis;
