-- ====================================
-- SCRIPT COMPLETO PARA CORRIGIR TABELA CLIENTES_FAST
-- ====================================

-- PASSO 1: Criar tabela se não existir
CREATE TABLE IF NOT EXISTS clientes_fast (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 2: Adicionar colunas se não existirem
DO $$ 
BEGIN
    -- Colunas básicas de contato
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='email') THEN
        ALTER TABLE clientes_fast ADD COLUMN email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='telefone') THEN
        ALTER TABLE clientes_fast ADD COLUMN telefone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='tipo') THEN
        ALTER TABLE clientes_fast ADD COLUMN tipo VARCHAR(10) DEFAULT 'CPF';
    END IF;
    
    -- Colunas de endereço
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='endereco') THEN
        ALTER TABLE clientes_fast ADD COLUMN endereco TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='cidade') THEN
        ALTER TABLE clientes_fast ADD COLUMN cidade VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='estado') THEN
        ALTER TABLE clientes_fast ADD COLUMN estado VARCHAR(2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='cep') THEN
        ALTER TABLE clientes_fast ADD COLUMN cep VARCHAR(10);
    END IF;
    
    -- Colunas de pontos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='saldo_pontos') THEN
        ALTER TABLE clientes_fast ADD COLUMN saldo_pontos INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='total_pontos_ganhos') THEN
        ALTER TABLE clientes_fast ADD COLUMN total_pontos_ganhos INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='total_pontos_gastos') THEN
        ALTER TABLE clientes_fast ADD COLUMN total_pontos_gastos INTEGER DEFAULT 0;
    END IF;
    
    -- Colunas de controle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='status') THEN
        ALTER TABLE clientes_fast ADD COLUMN status VARCHAR(20) DEFAULT 'ativo';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='data_cadastro') THEN
        ALTER TABLE clientes_fast ADD COLUMN data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='updated_at') THEN
        ALTER TABLE clientes_fast ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- PASSO 3: Adicionar constraints se não existirem
DO $$
BEGIN
    -- Constraint para tipo
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'clientes_fast_tipo_check') THEN
        ALTER TABLE clientes_fast ADD CONSTRAINT clientes_fast_tipo_check 
            CHECK (tipo IN ('CPF', 'CNPJ'));
    END IF;
    
    -- Constraint para status
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'clientes_fast_status_check') THEN
        ALTER TABLE clientes_fast ADD CONSTRAINT clientes_fast_status_check 
            CHECK (status IN ('ativo', 'inativo', 'bloqueado', 'suspenso'));
    END IF;
END $$;

-- PASSO 4: Configurar Row Level Security
ALTER TABLE clientes_fast ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários podem ver apenas seus dados" ON clientes_fast;
DROP POLICY IF EXISTS "Permitir todas operações para desenvolvimento" ON clientes_fast;
DROP POLICY IF EXISTS "Permitir desenvolvimento" ON clientes_fast;

-- Criar política permissiva para desenvolvimento
CREATE POLICY "Desenvolvimento - Acesso Total" ON clientes_fast
    FOR ALL 
    TO authenticated, anon
    USING (true) 
    WITH CHECK (true);

-- PASSO 5: Criar função e trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes_fast;

-- Criar novo trigger
CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes_fast 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PASSO 6: Atualizar valores default para registros existentes
UPDATE clientes_fast 
SET 
    saldo_pontos = COALESCE(saldo_pontos, 0),
    total_pontos_ganhos = COALESCE(total_pontos_ganhos, 0),
    total_pontos_gastos = COALESCE(total_pontos_gastos, 0),
    status = COALESCE(status, 'ativo'),
    tipo = COALESCE(tipo, 'CPF'),
    data_cadastro = COALESCE(data_cadastro, NOW()),
    updated_at = NOW()
WHERE saldo_pontos IS NULL 
   OR total_pontos_ganhos IS NULL 
   OR total_pontos_gastos IS NULL 
   OR status IS NULL 
   OR tipo IS NULL;

-- PASSO 7: Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'clientes_fast'
ORDER BY ordinal_position;
