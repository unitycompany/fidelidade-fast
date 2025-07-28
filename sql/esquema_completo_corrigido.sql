-- ====================================
-- SISTEMA DE FIDELIDADE FAST - SCHEMA COMPLETO CORRIGIDO
-- ====================================

-- Habilita extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- 1. CLIENTES
-- ====================================
CREATE TABLE IF NOT EXISTS clientes_fast (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Dados pessoais
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  
  -- Endereço
  endereco JSONB,
  
  -- Controle de acesso
  senha_hash VARCHAR(255),
  ultimo_login TIMESTAMP WITH TIME ZONE,
  
  -- Pontuação
  saldo_pontos INTEGER DEFAULT 0,
  total_pontos_ganhos INTEGER DEFAULT 0,
  total_pontos_resgatados INTEGER DEFAULT 0,
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  nivel_fidelidade VARCHAR(20) DEFAULT 'bronze',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 2. FORNECEDORES
-- ====================================
CREATE TABLE IF NOT EXISTS fornecedores_fast (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Dados da empresa
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  
  -- Contato
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco JSONB,
  
  -- Configurações
  ativo BOOLEAN DEFAULT true,
  parceiro_oficial BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 3. PRODUTOS FAST (CATÁLOGO)
-- ====================================
CREATE TABLE IF NOT EXISTS produtos_fast_catalogo (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Identificação
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50) NOT NULL,
  
  -- Pontuação
  pontos_por_real DECIMAL(3,1) NOT NULL,
  
  -- Palavras-chave para identificação IA
  keywords TEXT[],
  aliases TEXT[],
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 4. PEDIDOS DE VENDAS
-- ====================================
CREATE TABLE IF NOT EXISTS pedidos_vendas (
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
-- 5. ITENS DOS PEDIDOS
-- ====================================
CREATE TABLE IF NOT EXISTS itens_pedido (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Relacionamentos
  pedido_id UUID REFERENCES pedidos_vendas(id) ON DELETE CASCADE,
  produto_catalogo_id UUID REFERENCES produtos_fast_catalogo(id),
  
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
  produto_oficial VARCHAR(255),
  categoria VARCHAR(50),
  pontos_por_real DECIMAL(3,1) DEFAULT 0,
  pontos_calculados INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 6. NOTAS FISCAIS (compatibilidade)
-- ====================================
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Para compatibilidade com queries existentes
  cliente_id UUID REFERENCES clientes_fast(id),
  pedido_id UUID REFERENCES pedidos_vendas(id),
  
  -- Dados da nota
  numero_nota VARCHAR(50),
  data_emissao DATE,
  valor_total DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 7. ITENS NOTA FISCAL (compatibilidade)
-- ====================================
CREATE TABLE IF NOT EXISTS itens_nota_fiscal (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Relacionamentos
  nota_fiscal_id UUID REFERENCES notas_fiscais(id) ON DELETE CASCADE,
  produto_catalogo_id UUID REFERENCES produtos_fast_catalogo(id),
  
  -- Dados do item
  nome_produto VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  pontos_calculados INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 8. HISTÓRICO DE PONTOS
-- ====================================
CREATE TABLE IF NOT EXISTS historico_pontos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Relacionamentos
  cliente_id UUID REFERENCES clientes_fast(id),
  pedido_id UUID REFERENCES pedidos_vendas(id),
  
  -- Movimentação
  tipo_operacao VARCHAR(20) NOT NULL CHECK (
    tipo_operacao IN ('ganho', 'resgate', 'ajuste', 'cancelamento')
  ),
  pontos INTEGER NOT NULL,
  saldo_anterior INTEGER NOT NULL,
  saldo_posterior INTEGER NOT NULL,
  
  -- Detalhes
  descricao TEXT,
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================

-- Clientes
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes_fast(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes_fast(email);

-- Produtos
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos_fast_catalogo(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos_fast_catalogo(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos_fast_catalogo(ativo);

-- Pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos_vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos_vendas(data_emissao);
CREATE INDEX IF NOT EXISTS idx_pedidos_hash ON pedidos_vendas(hash_unico);

-- Itens
CREATE INDEX IF NOT EXISTS idx_itens_pedido ON itens_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_itens_produto ON itens_pedido(produto_catalogo_id);

-- Histórico
CREATE INDEX IF NOT EXISTS idx_historico_cliente ON historico_pontos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_historico_data ON historico_pontos(created_at);

-- ====================================
-- DADOS INICIAIS
-- ====================================

-- Inserir produtos Fast básicos se não existirem
INSERT INTO produtos_fast_catalogo (codigo, nome, categoria, pontos_por_real, keywords, aliases) 
VALUES 
  ('FAST001', 'Telha Romana Fast', 'Telhas', 2.0, ARRAY['telha', 'romana', 'cobertura'], ARRAY['telha romana', 'telha fast']),
  ('FAST002', 'Laje Treliçada Fast', 'Lajes', 2.5, ARRAY['laje', 'treliçada', 'pré-moldada'], ARRAY['laje treliçada', 'laje fast']),
  ('FAST003', 'Bloco Estrutural Fast', 'Blocos', 1.5, ARRAY['bloco', 'estrutural', 'concreto'], ARRAY['bloco estrutural', 'bloco fast'])
ON CONFLICT (codigo) DO NOTHING;

-- Inserir cliente de teste se não existir
INSERT INTO clientes_fast (nome, email, cpf_cnpj, saldo_pontos) 
VALUES ('Cliente Teste', 'teste@fast.com', '12345678901', 100)
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- Inserir fornecedor de teste se não existir
INSERT INTO fornecedores_fast (razao_social, nome_fantasia, cnpj) 
VALUES ('Fast Sistemas Construtivos Ltda', 'Fast Sistemas', '12345678000190')
ON CONFLICT (cnpj) DO NOTHING;
