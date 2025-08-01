-- ====================================
-- SISTEMA DE USUÁRIOS E ROLES
-- ====================================

-- 1. Criar tabela de usuários do sistema (diferentes dos clientes)
CREATE TABLE IF NOT EXISTS usuarios_sistema (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL, -- Em produção usar hash bcrypt
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  telefone VARCHAR(20),
  
  -- Roles: admin_supremo, gerente, cliente
  role VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (role IN ('admin_supremo', 'gerente', 'cliente')),
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  
  -- Metadados específicos por role
  loja_id UUID, -- Para gerentes, qual loja eles gerenciam
  permissoes JSONB DEFAULT '{}', -- Permissões específicas
  
  -- Controle
  ultimo_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de lojas (para gerentes)
CREATE TABLE IF NOT EXISTS lojas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  telefone VARCHAR(20),
  email VARCHAR(255),
  
  -- Status
  ativa BOOLEAN DEFAULT true,
  
  -- Controle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adicionar coluna role na tabela clientes_fast para compatibilidade
ALTER TABLE clientes_fast 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'cliente' CHECK (role IN ('admin_supremo', 'gerente', 'cliente'));

ALTER TABLE clientes_fast 
ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES lojas(id);

ALTER TABLE clientes_fast 
ADD COLUMN IF NOT EXISTS senha VARCHAR(255);

-- 4. Função para validar role
CREATE OR REPLACE FUNCTION validate_user_role(user_id UUID, required_role VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  -- Primeiro verifica na tabela usuarios_sistema
  SELECT role INTO user_role FROM usuarios_sistema WHERE id = user_id AND ativo = true;
  
  -- Se não encontrar, verifica na tabela clientes_fast
  IF user_role IS NULL THEN
    SELECT role INTO user_role FROM clientes_fast WHERE id = user_id AND status = 'ativo';
  END IF;
  
  -- Admin supremo tem acesso a tudo
  IF user_role = 'admin_supremo' THEN
    RETURN true;
  END IF;
  
  -- Verificar role específico
  RETURN user_role = required_role;
END;
$$ LANGUAGE plpgsql;

-- 5. Função para obter dados completos do usuário
CREATE OR REPLACE FUNCTION get_user_complete_data(user_email VARCHAR)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  nome VARCHAR,
  role VARCHAR,
  loja_id UUID,
  loja_nome VARCHAR,
  ativo BOOLEAN,
  saldo_pontos INTEGER,
  total_pontos_ganhos INTEGER,
  total_pontos_gastos INTEGER
) AS $$
BEGIN
  -- Primeiro tenta encontrar em usuarios_sistema
  RETURN QUERY
  SELECT 
    us.id,
    us.email,
    us.nome,
    us.role,
    us.loja_id,
    l.nome as loja_nome,
    us.ativo,
    0 as saldo_pontos,
    0 as total_pontos_ganhos,
    0 as total_pontos_gastos
  FROM usuarios_sistema us
  LEFT JOIN lojas l ON us.loja_id = l.id
  WHERE us.email = user_email AND us.ativo = true;
  
  -- Se não encontrou, procura em clientes_fast
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      cf.id,
      cf.email,
      cf.nome,
      cf.role,
      cf.loja_id,
      l.nome as loja_nome,
      CASE WHEN cf.status = 'ativo' THEN true ELSE false END as ativo,
      cf.saldo_pontos,
      cf.total_pontos_ganhos,
      cf.total_pontos_gastos
    FROM clientes_fast cf
    LEFT JOIN lojas l ON cf.loja_id = l.id
    WHERE cf.email = user_email AND cf.status = 'ativo';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar índices
CREATE INDEX IF NOT EXISTS idx_usuarios_sistema_email ON usuarios_sistema(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_sistema_role ON usuarios_sistema(role);
CREATE INDEX IF NOT EXISTS idx_clientes_fast_role ON clientes_fast(role);
CREATE INDEX IF NOT EXISTS idx_lojas_ativa ON lojas(ativa);

-- 7. Inserir admin supremo padrão
INSERT INTO usuarios_sistema (email, senha, nome, role) 
VALUES ('admin@fastsistemas.com', 'admin123', 'Administrador Supremo', 'admin_supremo')
ON CONFLICT (email) DO UPDATE SET
  senha = EXCLUDED.senha,
  nome = EXCLUDED.nome,
  role = EXCLUDED.role;

-- 8. Inserir algumas lojas de exemplo
INSERT INTO lojas (nome, cnpj, cidade, estado) VALUES
('Loja Centro', '12.345.678/0001-90', 'São Paulo', 'SP'),
('Loja Shopping', '12.345.678/0002-71', 'São Paulo', 'SP'),
('Loja Bairro Sul', '12.345.678/0003-52', 'São Paulo', 'SP')
ON CONFLICT (cnpj) DO NOTHING;

-- 9. RLS (Row Level Security) - Opcional para maior segurança
ALTER TABLE usuarios_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;

-- Política para admin supremo ver tudo
CREATE POLICY "admin_supremo_full_access" ON usuarios_sistema
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios_sistema 
      WHERE id = auth.uid() AND role = 'admin_supremo'
    )
  );

-- Política para gerentes verem apenas sua própria informação
CREATE POLICY "gerente_own_data" ON usuarios_sistema
  FOR SELECT USING (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM usuarios_sistema 
      WHERE id = auth.uid() AND role = 'admin_supremo'
    )
  );

-- 10. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover triggers existentes antes de criar novos
DROP TRIGGER IF EXISTS update_usuarios_sistema_updated_at ON usuarios_sistema;
DROP TRIGGER IF EXISTS update_lojas_updated_at ON lojas;

CREATE TRIGGER update_usuarios_sistema_updated_at 
  BEFORE UPDATE ON usuarios_sistema 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lojas_updated_at 
  BEFORE UPDATE ON lojas 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. View para facilitar consultas de usuários
CREATE OR REPLACE VIEW v_usuarios_completo AS
SELECT 
  u.id,
  u.email,
  u.nome,
  u.cpf,
  u.telefone,
  u.role,
  u.ativo,
  u.loja_id,
  l.nome as loja_nome,
  l.cidade as loja_cidade,
  u.ultimo_login,
  u.created_at
FROM usuarios_sistema u
LEFT JOIN lojas l ON u.loja_id = l.id

UNION ALL

SELECT 
  c.id,
  c.email,
  c.nome,
  c.cpf_cnpj as cpf,
  c.telefone,
  COALESCE(c.role, 'cliente') as role,
  CASE WHEN c.status = 'ativo' THEN true ELSE false END as ativo,
  c.loja_id,
  l.nome as loja_nome,
  l.cidade as loja_cidade,
  c.ultima_atividade as ultimo_login,
  c.created_at
FROM clientes_fast c
LEFT JOIN lojas l ON c.loja_id = l.id
WHERE c.email IS NOT NULL;

COMMENT ON TABLE usuarios_sistema IS 'Tabela para usuários administrativos do sistema (admin supremo, gerentes)';
COMMENT ON TABLE lojas IS 'Tabela de lojas para associar gerentes';
COMMENT ON VIEW v_usuarios_completo IS 'View unificada de todos os usuários do sistema';
