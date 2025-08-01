-- ====================================
-- SCRIPT SQL PARA SISTEMA DE USUÁRIOS
-- Execute este script no SQL Editor do Supabase
-- ====================================

-- 1. Criar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar tabela de lojas primeiro (sem foreign keys conflitantes)
CREATE TABLE IF NOT EXISTS lojas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  telefone VARCHAR(20),
  email VARCHAR(255),
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS usuarios_sistema (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  telefone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (role IN ('admin_supremo', 'gerente', 'cliente')),
  ativo BOOLEAN DEFAULT true,
  loja_id UUID REFERENCES lojas(id),
  permissoes JSONB DEFAULT '{}',
  ultimo_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Adicionar colunas na tabela clientes_fast se não existirem
DO $$
BEGIN
  -- Adicionar coluna role
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clientes_fast' AND column_name='role') THEN
    ALTER TABLE clientes_fast ADD COLUMN role VARCHAR(20) DEFAULT 'cliente';
    ALTER TABLE clientes_fast ADD CONSTRAINT check_clientes_fast_role CHECK (role IN ('admin_supremo', 'gerente', 'cliente'));
  END IF;
  
  -- Adicionar coluna loja_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clientes_fast' AND column_name='loja_id') THEN
    ALTER TABLE clientes_fast ADD COLUMN loja_id UUID REFERENCES lojas(id);
  END IF;
  
  -- Adicionar coluna senha
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clientes_fast' AND column_name='senha') THEN
    ALTER TABLE clientes_fast ADD COLUMN senha VARCHAR(255);
  END IF;
END$$;

-- 5. Criar função para trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Remover triggers existentes se existirem e criar novos
DO $$
BEGIN
  -- Remover triggers se existirem
  DROP TRIGGER IF EXISTS update_usuarios_sistema_updated_at ON usuarios_sistema;
  DROP TRIGGER IF EXISTS update_lojas_updated_at ON lojas;
  
  -- Criar novos triggers
  CREATE TRIGGER update_usuarios_sistema_updated_at 
    BEFORE UPDATE ON usuarios_sistema 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_lojas_updated_at 
    BEFORE UPDATE ON lojas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END$$;

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_sistema_email ON usuarios_sistema(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_sistema_role ON usuarios_sistema(role);
CREATE INDEX IF NOT EXISTS idx_clientes_fast_role ON clientes_fast(role);
CREATE INDEX IF NOT EXISTS idx_lojas_ativa ON lojas(ativa);

-- 8. Inserir dados iniciais

-- Inserir lojas de exemplo
INSERT INTO lojas (nome, cnpj, cidade, estado) VALUES
('Loja Centro', '12.345.678/0001-90', 'São Paulo', 'SP'),
('Loja Shopping', '12.345.678/0002-71', 'São Paulo', 'SP'),
('Loja Bairro Sul', '12.345.678/0003-52', 'São Paulo', 'SP')
ON CONFLICT (cnpj) DO NOTHING;

-- Inserir admin supremo padrão
INSERT INTO usuarios_sistema (email, senha, nome, role) 
VALUES ('admin@fastsistemas.com', 'admin123', 'Administrador Supremo', 'admin_supremo')
ON CONFLICT (email) DO UPDATE SET
  senha = EXCLUDED.senha,
  nome = EXCLUDED.nome,
  role = EXCLUDED.role;

-- Inserir gerentes de exemplo
INSERT INTO usuarios_sistema (email, senha, nome, role, loja_id) 
SELECT 
  'gerente1@fastsistemas.com',
  'gerente123',
  'João Silva - Gerente Centro',
  'gerente',
  l.id
FROM lojas l 
WHERE l.nome = 'Loja Centro'
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios_sistema (email, senha, nome, role, loja_id) 
SELECT 
  'gerente2@fastsistemas.com',
  'gerente123',
  'Maria Santos - Gerente Shopping',
  'gerente',
  l.id
FROM lojas l 
WHERE l.nome = 'Loja Shopping'
ON CONFLICT (email) DO NOTHING;

-- 9. Criar view para consulta unificada de usuários
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
  u.created_at,
  'usuarios_sistema' as source
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
  c.created_at,
  'clientes_fast' as source
FROM clientes_fast c
LEFT JOIN lojas l ON c.loja_id = l.id
WHERE c.email IS NOT NULL;

-- 10. Comentários nas tabelas
COMMENT ON TABLE usuarios_sistema IS 'Usuários administrativos do sistema (admin supremo, gerentes)';
COMMENT ON TABLE lojas IS 'Lojas para associar gerentes';
COMMENT ON VIEW v_usuarios_completo IS 'View unificada de todos os usuários do sistema';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de usuários e roles criado com sucesso!';
  RAISE NOTICE 'Admin: admin@fastsistemas.com / admin123';
  RAISE NOTICE 'Gerente 1: gerente1@fastsistemas.com / gerente123';
  RAISE NOTICE 'Gerente 2: gerente2@fastsistemas.com / gerente123';
END$$;
