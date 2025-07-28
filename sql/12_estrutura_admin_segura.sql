-- Script simplificado para criar estrutura admin produtos
-- Esta versão não assume que as colunas já existem

-- Criar tabela produtos_elegiveis com estrutura completa
CREATE TABLE IF NOT EXISTS produtos_elegiveis (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    pontos_por_real DECIMAL(5,2) NOT NULL DEFAULT 0,
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT
);

-- Adicionar colunas uma por uma (caso não existam)
DO $$
BEGIN
    -- Adicionar coluna ativa
    IF NOT EXISTS (
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'produtos_elegiveis' AND column_name = 'ativa'
    ) THEN
        ALTER TABLE produtos_elegiveis ADD COLUMN ativa BOOLEAN DEFAULT true;
    END IF;
    
    -- Adicionar coluna created_at
    IF NOT EXISTS (
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'produtos_elegiveis' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE produtos_elegiveis ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Adicionar coluna updated_at
    IF NOT EXISTS (
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'produtos_elegiveis' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE produtos_elegiveis ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Garantir que produtos existentes tenham ativa = true
UPDATE produtos_elegiveis SET ativa = true WHERE ativa IS NULL;

-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO configuracoes_sistema (chave, valor, descricao, tipo) VALUES
('prazo_validade_pedido', '30', 'Prazo em dias para aceitar pedidos', 'number'),
('pontos_minimos_resgate', '100', 'Quantidade mínima de pontos para resgate', 'number'),
('sistema_ativo', 'true', 'Se o sistema de pontuação está ativo', 'boolean'),
('mensagem_boas_vindas', 'Bem-vindo ao Clube Fast de Recompensas!', 'Mensagem exibida no dashboard', 'text'),
('email_notificacao', 'admin@fastsistemas.com', 'Email para notificações administrativas', 'text')
ON CONFLICT (chave) DO NOTHING;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_produtos_elegiveis_categoria ON produtos_elegiveis(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_elegiveis_ativa ON produtos_elegiveis(ativa);
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes_sistema(chave);

-- Função para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_produtos_elegiveis_updated_at ON produtos_elegiveis;
CREATE TRIGGER update_produtos_elegiveis_updated_at 
    BEFORE UPDATE ON produtos_elegiveis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_configuracoes_sistema_updated_at ON configuracoes_sistema;
CREATE TRIGGER update_configuracoes_sistema_updated_at 
    BEFORE UPDATE ON configuracoes_sistema 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar resultado
SELECT 'Estrutura criada com sucesso!' as status;
SELECT column_name, data_type, is_nullable FROM information_schema.columns 
WHERE table_name = 'produtos_elegiveis' ORDER BY ordinal_position;
