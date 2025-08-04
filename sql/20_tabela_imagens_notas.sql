-- ====================================
-- TABELA PARA ARMAZENAR IMAGENS DE NOTAS FISCAIS
-- ====================================

-- Criar tabela para armazenar imagens das notas fiscais
CREATE TABLE IF NOT EXISTS imagens_notas_fiscais (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Relacionamentos
  pedido_id UUID REFERENCES pedidos_vendas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes_fast(id) ON DELETE CASCADE,
  
  -- Dados da imagem
  nome_arquivo VARCHAR(255) NOT NULL,
  url_supabase TEXT, -- URL do Supabase Storage
  url_cloudflare TEXT, -- URL do Cloudflare Images (backup)
  tipo_arquivo VARCHAR(50) NOT NULL, -- jpg, png, pdf, etc
  tamanho_bytes BIGINT,
  
  -- Dados da nota fiscal extraídos
  numero_nota VARCHAR(100),
  chave_acesso VARCHAR(44), -- Chave de acesso da NFe
  
  -- Status do processamento
  status_upload VARCHAR(20) DEFAULT 'enviado' CHECK (
    status_upload IN ('enviado', 'processando', 'processado', 'erro', 'rejeitado')
  ),
  
  -- Metadados
  ip_origem INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices únicos
  UNIQUE(pedido_id, nome_arquivo)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_imagens_pedido ON imagens_notas_fiscais(pedido_id);
CREATE INDEX IF NOT EXISTS idx_imagens_cliente ON imagens_notas_fiscais(cliente_id);
CREATE INDEX IF NOT EXISTS idx_imagens_status ON imagens_notas_fiscais(status_upload);
CREATE INDEX IF NOT EXISTS idx_imagens_data ON imagens_notas_fiscais(created_at);
CREATE INDEX IF NOT EXISTS idx_imagens_chave ON imagens_notas_fiscais(chave_acesso);

-- Comentários
COMMENT ON TABLE imagens_notas_fiscais IS 'Tabela para armazenar imagens/arquivos das notas fiscais enviadas pelos clientes';
COMMENT ON COLUMN imagens_notas_fiscais.url_supabase IS 'URL da imagem no Supabase Storage';
COMMENT ON COLUMN imagens_notas_fiscais.url_cloudflare IS 'URL da imagem no Cloudflare Images (backup)';
COMMENT ON COLUMN imagens_notas_fiscais.chave_acesso IS 'Chave de acesso de 44 dígitos da NFe';

-- Atualizar a tabela pedidos_vendas para referenciar as imagens
ALTER TABLE pedidos_vendas 
ADD COLUMN IF NOT EXISTS tem_imagem BOOLEAN DEFAULT FALSE;

-- Criar trigger para atualizar o campo tem_imagem automaticamente
CREATE OR REPLACE FUNCTION atualizar_tem_imagem()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE pedidos_vendas 
    SET tem_imagem = TRUE 
    WHERE id = NEW.pedido_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Verificar se ainda existem outras imagens para este pedido
    UPDATE pedidos_vendas 
    SET tem_imagem = (
      SELECT COUNT(*) > 0 
      FROM imagens_notas_fiscais 
      WHERE pedido_id = OLD.pedido_id
    )
    WHERE id = OLD.pedido_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
DROP TRIGGER IF EXISTS trigger_imagem_inserida ON imagens_notas_fiscais;
DROP TRIGGER IF EXISTS trigger_imagem_removida ON imagens_notas_fiscais;

CREATE TRIGGER trigger_imagem_inserida
  AFTER INSERT ON imagens_notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_tem_imagem();

CREATE TRIGGER trigger_imagem_removida
  AFTER DELETE ON imagens_notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_tem_imagem();

-- Criar storage bucket no Supabase (isso será feito via JavaScript)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('notas-fiscais', 'notas-fiscais', true);

-- Configurar RLS (Row Level Security) para a tabela
ALTER TABLE imagens_notas_fiscais ENABLE ROW LEVEL SECURITY;

-- Política para permitir que clientes vejam apenas suas próprias imagens
CREATE POLICY "Clientes podem ver suas imagens" ON imagens_notas_fiscais
  FOR SELECT USING (cliente_id = auth.uid()::uuid);

-- Política para permitir que clientes façam upload de suas imagens
CREATE POLICY "Clientes podem fazer upload" ON imagens_notas_fiscais
  FOR INSERT WITH CHECK (cliente_id = auth.uid()::uuid);

-- Política para admins/gerentes verem todas as imagens
CREATE POLICY "Admins podem ver todas as imagens" ON imagens_notas_fiscais
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clientes_fast 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'gerente')
    )
  );

COMMIT;
