-- ====================================
-- BANCO DE DADOS - CLUBE FAST RECOMPENSAS
-- Sistema otimizado para Pedidos de Vendas Fast
-- ====================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- 1. TABELA DE CLIENTES FAST
-- ====================================
CREATE TABLE clientes_fast (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  tipo VARCHAR(10) CHECK (tipo IN ('CPF', 'CNPJ')) NOT NULL,
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  
  -- Controle de pontos
  saldo_pontos INTEGER DEFAULT 0,
  total_pontos_ganhos INTEGER DEFAULT 0,
  total_pontos_gastos INTEGER DEFAULT 0,
  
  -- Status e controle
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 2. TABELA DE FORNECEDORES/DISTRIBUIDORES
-- ====================================
CREATE TABLE fornecedores_fast (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  autorizado_fast BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 3. TABELA DE PEDIDOS DE VENDAS
-- ====================================
CREATE TABLE pedidos_vendas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Dados do pedido
  numero_pedido VARCHAR(50) NOT NULL,
  data_emissao DATE NOT NULL,
  
  -- Relacionamentos
  cliente_id UUID REFERENCES clientes_fast(id),
  fornecedor_id UUID REFERENCES fornecedores_fast(id),
  
  -- Dados financeiros
  valor_total_pedido DECIMAL(10,2) NOT NULL,
  valor_produtos_fast DECIMAL(10,2) DEFAULT 0,
  valor_outros_produtos DECIMAL(10,2) DEFAULT 0,
  
  -- Pontuação
  total_pontos_ganhos INTEGER DEFAULT 0,
  produtos_elegiveis INTEGER DEFAULT 0,
  produtos_nao_elegiveis INTEGER DEFAULT 0,
  
  -- Validações e segurança
  hash_unico VARCHAR(64) UNIQUE NOT NULL,
  status_processamento VARCHAR(20) DEFAULT 'processado' CHECK (
    status_processamento IN ('processando', 'processado', 'erro', 'rejeitado')
  ),
  
  -- Dados originais da IA
  dados_brutos_ia JSONB,
  confianca_ia INTEGER,
  
  -- Auditoria
  ip_origem INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar duplicatas
  UNIQUE(numero_pedido, data_emissao, cliente_id)
);

-- ====================================
-- 4. TABELA DE PRODUTOS FAST (CATÁLOGO)
-- ====================================
CREATE TABLE produtos_fast_catalogo (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Identificação
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50) NOT NULL,
  
  -- Pontuação
  pontos_por_real DECIMAL(3,1) NOT NULL,
  
  -- Palavras-chave para identificação IA
  keywords TEXT[], -- Array de palavras-chave
  aliases TEXT[],  -- Array de nomes alternativos
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 5. TABELA DE ITENS DOS PEDIDOS
-- ====================================
CREATE TABLE itens_pedido (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Relacionamentos
  pedido_id UUID REFERENCES pedidos_vendas(id) ON DELETE CASCADE,
  produto_catalogo_id UUID REFERENCES produtos_fast_catalogo(id), -- NULL se não elegível
  
  -- Dados do item
  sequencia INTEGER,
  codigo_produto VARCHAR(20),
  nome_produto VARCHAR(255) NOT NULL,
  unidade VARCHAR(10),
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  
  -- Classificação e pontuação
  produto_fast BOOLEAN DEFAULT false,
  produto_oficial VARCHAR(255), -- Nome oficial na tabela Fast
  categoria VARCHAR(50),
  pontos_por_real DECIMAL(3,1) DEFAULT 0,
  pontos_calculados INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 6. TABELA DE HISTÓRICO DE PONTOS
-- ====================================
CREATE TABLE historico_pontos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Relacionamentos
  cliente_id UUID REFERENCES clientes_fast(id),
  pedido_id UUID REFERENCES pedidos_vendas(id),
  
  -- Movimentação
  tipo_operacao VARCHAR(20) NOT NULL CHECK (
    tipo_operacao IN ('ganho', 'resgate', 'ajuste', 'cancelamento')
  ),
  pontos INTEGER NOT NULL, -- Positivo para ganho, negativo para gasto
  saldo_anterior INTEGER NOT NULL,
  saldo_posterior INTEGER NOT NULL,
  
  -- Descrição
  descricao TEXT,
  referencia VARCHAR(100), -- Número do pedido, código do prêmio, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 7. TABELA DE CATÁLOGO DE PRÊMIOS
-- ====================================
CREATE TABLE premios_catalogo (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Dados do prêmio
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  
  -- Pontuação e valor
  pontos_necessarios INTEGER NOT NULL,
  valor_estimado DECIMAL(10,2),
  
  -- Estoque e disponibilidade
  estoque_disponivel INTEGER DEFAULT 0,
  estoque_ilimitado BOOLEAN DEFAULT false,
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  ordem_exibicao INTEGER DEFAULT 0,
  
  -- Imagem (URL)
  imagem_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 8. TABELA DE RESGATES
-- ====================================
CREATE TABLE resgates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Relacionamentos
  cliente_id UUID REFERENCES clientes_fast(id),
  premio_id UUID REFERENCES premios_catalogo(id),
  
  -- Dados do resgate
  pontos_gastos INTEGER NOT NULL,
  quantidade INTEGER DEFAULT 1,
  
  -- Status do resgate
  status VARCHAR(20) DEFAULT 'processando' CHECK (
    status IN ('processando', 'aprovado', 'enviado', 'entregue', 'cancelado')
  ),
  
  -- Dados de entrega
  endereco_entrega TEXT,
  codigo_rastreamento VARCHAR(100),
  data_envio DATE,
  data_entrega DATE,
  
  -- Observações
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 9. TABELA DE CONFIGURAÇÕES DO SISTEMA
-- ====================================
CREATE TABLE configuracoes_sistema (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Configurações de segurança
  data_minima_pedidos DATE DEFAULT '2024-01-01',
  prazo_maximo_dias INTEGER DEFAULT 30,
  max_tentativas_por_hora INTEGER DEFAULT 10,
  
  -- Configurações de pontos
  pontos_expiram_meses INTEGER DEFAULT 12,
  bonus_primeira_compra INTEGER DEFAULT 0,
  multiplicador_promocional DECIMAL(3,2) DEFAULT 1.0,
  
  -- Configurações de sistema
  sistema_ativo BOOLEAN DEFAULT true,
  modo_manutencao BOOLEAN DEFAULT false,
  mensagem_sistema TEXT,
  
  -- Auditoria
  atualizado_por VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================

-- Clientes
CREATE INDEX idx_clientes_cpf_cnpj ON clientes_fast(cpf_cnpj);
CREATE INDEX idx_clientes_status ON clientes_fast(status);
CREATE INDEX idx_clientes_pontos ON clientes_fast(saldo_pontos);

-- Pedidos
CREATE INDEX idx_pedidos_numero ON pedidos_vendas(numero_pedido);
CREATE INDEX idx_pedidos_data ON pedidos_vendas(data_emissao);
CREATE INDEX idx_pedidos_cliente ON pedidos_vendas(cliente_id);
CREATE INDEX idx_pedidos_hash ON pedidos_vendas(hash_unico);
CREATE INDEX idx_pedidos_status ON pedidos_vendas(status_processamento);

-- Itens
CREATE INDEX idx_itens_pedido ON itens_pedido(pedido_id);
CREATE INDEX idx_itens_produto ON itens_pedido(produto_catalogo_id);
CREATE INDEX idx_itens_fast ON itens_pedido(produto_fast);

-- Histórico
CREATE INDEX idx_historico_cliente ON historico_pontos(cliente_id);
CREATE INDEX idx_historico_data ON historico_pontos(created_at);
CREATE INDEX idx_historico_tipo ON historico_pontos(tipo_operacao);

-- Produtos
CREATE INDEX idx_produtos_codigo ON produtos_fast_catalogo(codigo);
CREATE INDEX idx_produtos_categoria ON produtos_fast_catalogo(categoria);
CREATE INDEX idx_produtos_ativo ON produtos_fast_catalogo(ativo);

-- ====================================
-- TRIGGERS PARA AUDITORIA E CONTROLE
-- ====================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes_fast 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at 
    BEFORE UPDATE ON produtos_fast_catalogo 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premios_updated_at 
    BEFORE UPDATE ON premios_catalogo 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- DADOS INICIAIS
-- ====================================

-- Inserir fornecedor principal Fast
INSERT INTO fornecedores_fast (cnpj, razao_social, nome_fantasia, ativo, autorizado_fast) 
VALUES ('57.502.321/0001-39', 'DCS DISTRIBUIÇÃO DE MATERIAIS DE CONSTRUÇÃO A SECO LTDA', 'Fast Drywall & Steelframe', true, true);

-- Inserir produtos Fast no catálogo
INSERT INTO produtos_fast_catalogo (codigo, nome, categoria, pontos_por_real, keywords, aliases, ativo, destaque) VALUES
-- Placas ST (0,5 pontos/R$)
('DW00057', 'Placa ST 13 - 1.80 M', 'drywall', 0.5, '{"placa","st","13","1.80"}', '{"PLACA ST 13","ST 13"}', true, true),
('DW00058', 'Placa ST 15 - 1.80 M', 'drywall', 0.5, '{"placa","st","15","1.80"}', '{"PLACA ST 15","ST 15"}', true, true),

-- Placas RU / Montantes / Guias (1 ponto/R$)
('DW00074', 'Guia Drywall 670', 'drywall', 1.0, '{"guia","drywall","670"}', '{"GUIA 670","GUIA DRYWALL"}', true, true),
('DW00007', 'Montante Drywall 670', 'drywall', 1.0, '{"montante","drywall","670"}', '{"MONTANTE 670","MONTANTE DRYWALL"}', true, true),
('DW00075', 'Montante Drywall 900', 'drywall', 1.0, '{"montante","drywall","900"}', '{"MONTANTE 900"}', true, false),

-- Placa Glasroc X (2 pontos/R$)
('GR00001', 'Placa Glasroc X 12.5mm', 'glasroc', 2.0, '{"glasroc","placa","12.5"}', '{"GLASROC X","PLACA GLASROC"}', true, true),
('GR00002', 'Placa Glasroc X 15mm', 'glasroc', 2.0, '{"glasroc","placa","15"}', '{"GLASROC X 15"}', true, true),

-- Placomix (1 ponto/R$)
('PM00001', 'Placomix Acabamento', 'acabamento', 1.0, '{"placomix","acabamento"}', '{"PLACOMIX"}', true, true),

-- Malha telada Glasroc X (2 pontos/R$)
('MT00001', 'Malha telada para Glasroc X', 'glasroc', 2.0, '{"malha","telada","glasroc"}', '{"MALHA GLASROC","TELA GLASROC"}', true, true),

-- Basecoat (2 pontos/R$)
('BC00001', 'Basecoat - Massa para Glasroc X', 'glasroc', 2.0, '{"basecoat","massa","glasroc"}', '{"MASSA GLASROC","BASECOAT"}', true, true);

-- Inserir prêmios iniciais
INSERT INTO premios_catalogo (nome, descricao, categoria, pontos_necessarios, valor_estimado, estoque_ilimitado, ativo, destaque, ordem_exibicao) VALUES
('Nível Laser', 'Nível laser profissional para construção', 'ferramentas', 10000, 500.00, false, true, true, 1),
('Parafusadeira', 'Parafusadeira elétrica profissional', 'ferramentas', 5000, 300.00, false, true, true, 2),
('Trena Digital', 'Trena digital 5 metros', 'ferramentas', 3000, 200.00, false, true, true, 3),
('Kit Brocas SDS', 'Kit com 5 brocas SDS profissionais', 'ferramentas', 1500, 80.00, false, true, false, 4),
('Vale-compras Fast', 'Vale para compra de produtos Fast', 'vale', 2000, 100.00, true, true, true, 5),
('Camiseta Fast', 'Camiseta personalizada Fast Sistemas', 'brinde', 1000, 50.00, false, true, false, 6),
('Boné Fast', 'Boné com logo Fast Sistemas', 'brinde', 800, 40.00, false, true, false, 7);

-- Inserir configuração inicial
INSERT INTO configuracoes_sistema (data_minima_pedidos, prazo_maximo_dias, sistema_ativo) 
VALUES ('2024-01-01', 30, true);

-- ====================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- ====================================

-- View de clientes com estatísticas
CREATE VIEW v_clientes_resumo AS
SELECT 
    c.*,
    COUNT(p.id) as total_pedidos,
    COALESCE(SUM(p.valor_produtos_fast), 0) as total_comprado,
    COALESCE(SUM(p.total_pontos_ganhos), 0) as total_pontos_historico,
    MAX(p.data_emissao) as ultima_compra
FROM clientes_fast c
LEFT JOIN pedidos_vendas p ON c.id = p.cliente_id
GROUP BY c.id;

-- View de produtos mais vendidos
CREATE VIEW v_produtos_ranking AS
SELECT 
    pc.nome,
    pc.categoria,
    COUNT(ip.id) as quantidade_vendida,
    SUM(ip.valor_total) as valor_total_vendido,
    SUM(ip.pontos_calculados) as pontos_distribuidos
FROM produtos_fast_catalogo pc
JOIN itens_pedido ip ON pc.id = ip.produto_catalogo_id
GROUP BY pc.id, pc.nome, pc.categoria
ORDER BY quantidade_vendida DESC;

-- ====================================
-- FUNÇÕES ÚTEIS
-- ====================================

-- Função para calcular pontos de um pedido
CREATE OR REPLACE FUNCTION calcular_pontos_pedido(pedido_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_pontos INTEGER;
BEGIN
    SELECT COALESCE(SUM(pontos_calculados), 0) 
    INTO total_pontos
    FROM itens_pedido 
    WHERE pedido_id = pedido_uuid AND produto_fast = true;
    
    RETURN total_pontos;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ====================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE clientes_fast ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE resgates ENABLE ROW LEVEL SECURITY;

-- Política básica: usuários só veem seus próprios dados
-- (Implementar políticas específicas baseadas no sistema de auth)
