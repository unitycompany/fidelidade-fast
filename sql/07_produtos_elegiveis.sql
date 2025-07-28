-- Criar tabela para produtos elegíveis do Clube Fast de Recompensas
-- Esta tabela permite gerenciar dinamicamente os produtos e suas regras de pontuação
-- Versão que pode ser executada múltiplas vezes sem erro

-- Criar tabela apenas se não existir
CREATE TABLE IF NOT EXISTS produtos_elegiveis (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    pontos_por_real DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT,
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance (criar apenas se não existirem)
CREATE INDEX IF NOT EXISTS idx_produtos_elegiveis_codigo ON produtos_elegiveis(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_elegiveis_categoria ON produtos_elegiveis(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_elegiveis_ativa ON produtos_elegiveis(ativa);
CREATE INDEX IF NOT EXISTS idx_produtos_elegiveis_pontos ON produtos_elegiveis(pontos_por_real);

-- Comentários na tabela
COMMENT ON TABLE produtos_elegiveis IS 'Produtos elegíveis para pontuação no Clube Fast de Recompensas';
COMMENT ON COLUMN produtos_elegiveis.codigo IS 'Código único do produto (ex: DW00057)';
COMMENT ON COLUMN produtos_elegiveis.nome IS 'Nome completo do produto';
COMMENT ON COLUMN produtos_elegiveis.pontos_por_real IS 'Quantidade de pontos por R$ 1,00 gasto';
COMMENT ON COLUMN produtos_elegiveis.categoria IS 'Categoria do produto (placa_st, placa_ru, glasroc_x, etc.)';
COMMENT ON COLUMN produtos_elegiveis.descricao IS 'Descrição detalhada do produto';
COMMENT ON COLUMN produtos_elegiveis.ativa IS 'Se o produto está ativo para pontuação';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_produtos_elegiveis_updated_at ON produtos_elegiveis;
CREATE TRIGGER update_produtos_elegiveis_updated_at
    BEFORE UPDATE ON produtos_elegiveis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar tabela para histórico de alterações nos produtos (apenas se não existir)
CREATE TABLE IF NOT EXISTS produtos_elegiveis_historico (
    id SERIAL PRIMARY KEY,
    produto_codigo VARCHAR(20) NOT NULL,
    acao VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    dados_anteriores JSONB,
    dados_novos JSONB,
    usuario_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para a tabela de histórico (criar apenas se não existirem)
CREATE INDEX IF NOT EXISTS idx_produtos_historico_codigo ON produtos_elegiveis_historico(produto_codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_historico_timestamp ON produtos_elegiveis_historico(timestamp);
CREATE INDEX IF NOT EXISTS idx_produtos_historico_usuario ON produtos_elegiveis_historico(usuario_id);

-- Trigger para registrar alterações
CREATE OR REPLACE FUNCTION log_produtos_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO produtos_elegiveis_historico (produto_codigo, acao, dados_novos, usuario_id)
        VALUES (NEW.codigo, 'INSERT', row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO produtos_elegiveis_historico (produto_codigo, acao, dados_anteriores, dados_novos, usuario_id)
        VALUES (NEW.codigo, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO produtos_elegiveis_historico (produto_codigo, acao, dados_anteriores, usuario_id)
        VALUES (OLD.codigo, 'DELETE', row_to_json(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS produtos_elegiveis_audit ON produtos_elegiveis;
CREATE TRIGGER produtos_elegiveis_audit
    AFTER INSERT OR UPDATE OR DELETE ON produtos_elegiveis
    FOR EACH ROW
    EXECUTE FUNCTION log_produtos_changes();

-- Policies de segurança (RLS - Row Level Security)
ALTER TABLE produtos_elegiveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos_elegiveis_historico ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem e criar novas
DROP POLICY IF EXISTS "Todos podem ler produtos ativos" ON produtos_elegiveis;
DROP POLICY IF EXISTS "Usuarios autenticados podem modificar produtos" ON produtos_elegiveis;
DROP POLICY IF EXISTS "Usuarios autenticados podem ver histórico" ON produtos_elegiveis_historico;

-- Política para leitura (todos podem ler produtos ativos)
CREATE POLICY "Todos podem ler produtos ativos" ON produtos_elegiveis
    FOR SELECT USING (ativa = true);

-- Política para usuários autenticados modificarem produtos (temporária - ajustar depois)
CREATE POLICY "Usuarios autenticados podem modificar produtos" ON produtos_elegiveis
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Política para histórico (usuários autenticados)
CREATE POLICY "Usuarios autenticados podem ver histórico" ON produtos_elegiveis_historico
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Função para obter produtos elegíveis ativos (usada pelo sistema de pontuação)
CREATE OR REPLACE FUNCTION get_produtos_elegiveis_ativos()
RETURNS TABLE(
    codigo VARCHAR(20),
    nome VARCHAR(255),
    pontos_por_real DECIMAL(4,2),
    categoria VARCHAR(50),
    descricao TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.codigo,
        p.nome,
        p.pontos_por_real,
        p.categoria,
        p.descricao
    FROM produtos_elegiveis p
    WHERE p.ativa = true
    ORDER BY p.pontos_por_real DESC, p.categoria, p.nome;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar produto por código ou nome
CREATE OR REPLACE FUNCTION buscar_produto_elegivel(
    p_codigo VARCHAR(20) DEFAULT NULL,
    p_nome VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE(
    codigo VARCHAR(20),
    nome VARCHAR(255),
    pontos_por_real DECIMAL(4,2),
    categoria VARCHAR(50),
    descricao TEXT,
    ativa BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.codigo,
        p.nome,
        p.pontos_por_real,
        p.categoria,
        p.descricao,
        p.ativa
    FROM produtos_elegiveis p
    WHERE 
        p.ativa = true
        AND (
            (p_codigo IS NOT NULL AND p.codigo = p_codigo)
            OR 
            (p_nome IS NOT NULL AND UPPER(p.nome) LIKE UPPER('%' || p_nome || '%'))
        )
    ORDER BY p.pontos_por_real DESC, p.categoria, p.nome;
END;
$$ LANGUAGE plpgsql;

-- View para relatórios de produtos (recriar se existir)
DROP VIEW IF EXISTS vw_produtos_relatorio;
CREATE VIEW vw_produtos_relatorio AS
SELECT 
    p.codigo,
    p.nome,
    p.pontos_por_real,
    p.categoria,
    p.descricao,
    p.ativa,
    p.created_at,
    p.updated_at,
    CASE 
        WHEN p.categoria = 'placa_st' THEN 'Placa ST'
        WHEN p.categoria = 'placa_ru' THEN 'Placa RU'
        WHEN p.categoria = 'glasroc_x' THEN 'Placa Glasroc X'
        WHEN p.categoria = 'placomix' THEN 'Placomix'
        WHEN p.categoria = 'malha_glasroc' THEN 'Malha telada para Glasroc X'
        WHEN p.categoria = 'basecoat' THEN 'Basecoat (massa para Glasroc X)'
        ELSE p.categoria
    END AS categoria_nome,
    CASE 
        WHEN p.pontos_por_real = 0.5 THEN 'Baixa'
        WHEN p.pontos_por_real = 1.0 THEN 'Normal'
        WHEN p.pontos_por_real = 2.0 THEN 'Alta'
        ELSE 'Personalizada'
    END AS nivel_pontuacao
FROM produtos_elegiveis p;

-- Inserir dados iniciais (produtos oficiais do Clube Fast)
-- Será feito via código JavaScript para manter sincronização
