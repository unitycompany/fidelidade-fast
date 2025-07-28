-- Criação da tabela para gerenciar produtos elegíveis via admin
-- Esta tabela substituirá o hardcode no código JavaScript

-- Tabela principal para produtos elegíveis (se não existir)
CREATE TABLE IF NOT EXISTS produtos_elegiveis (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    pontos_por_real DECIMAL(5,2) NOT NULL DEFAULT 0,
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para configurações gerais do sistema
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) DEFAULT 'text', -- text, number, boolean, json
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para promoções e campanhas especiais
CREATE TABLE IF NOT EXISTS promocoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    multiplicador_pontos DECIMAL(5,2) DEFAULT 1.0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativa BOOLEAN DEFAULT true,
    produtos_incluidos JSONB, -- Array de códigos de produtos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão do sistema (se não existirem)
INSERT INTO configuracoes_sistema (chave, valor, descricao, tipo) VALUES
('prazo_validade_pedido', '30', 'Prazo em dias para aceitar pedidos', 'number'),
('pontos_minimos_resgate', '100', 'Quantidade mínima de pontos para resgate', 'number'),
('sistema_ativo', 'true', 'Se o sistema de pontuação está ativo', 'boolean'),
('mensagem_boas_vindas', 'Bem-vindo ao Clube Fast de Recompensas!', 'Mensagem exibida no dashboard', 'text'),
('email_notificacao', 'admin@fastsistemas.com', 'Email para notificações administrativas', 'text')
ON CONFLICT (chave) DO NOTHING;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_elegiveis_categoria ON produtos_elegiveis(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_elegiveis_ativa ON produtos_elegiveis(ativa);
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes_sistema(chave);
CREATE INDEX IF NOT EXISTS idx_promocoes_datas ON promocoes(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_promocoes_ativa ON promocoes(ativa);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_produtos_elegiveis_updated_at ON produtos_elegiveis;
CREATE TRIGGER update_produtos_elegiveis_updated_at 
    BEFORE UPDATE ON produtos_elegiveis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_configuracoes_sistema_updated_at ON configuracoes_sistema;
CREATE TRIGGER update_configuracoes_sistema_updated_at 
    BEFORE UPDATE ON configuracoes_sistema 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promocoes_updated_at ON promocoes;
CREATE TRIGGER update_promocoes_updated_at 
    BEFORE UPDATE ON promocoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar se os dados foram inseridos corretamente
SELECT 'Produtos elegíveis:' as tabela, COUNT(*) as total FROM produtos_elegiveis
UNION ALL
SELECT 'Configurações:' as tabela, COUNT(*) as total FROM configuracoes_sistema
UNION ALL
SELECT 'Promoções:' as tabela, COUNT(*) as total FROM promocoes;
