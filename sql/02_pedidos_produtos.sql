-- ====================================
-- PARTE 2: TABELAS DE PEDIDOS E PRODUTOS
-- ====================================

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
  keywords TEXT[],
  aliases TEXT[],
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
