-- ====================================
-- PARTE 4: TABELAS DE PRÊMIOS E CONFIGURAÇÕES
-- ====================================

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
