-- ====================================
-- PARTE 3: TABELAS DE ITENS E HISTÓRICO
-- ====================================

-- ====================================
-- 5. TABELA DE ITENS DOS PEDIDOS
-- ====================================
CREATE TABLE itens_pedido (
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
  pontos INTEGER NOT NULL,
  saldo_anterior INTEGER NOT NULL,
  saldo_posterior INTEGER NOT NULL,
  
  -- Descrição
  descricao TEXT,
  referencia VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
