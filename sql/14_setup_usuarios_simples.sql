-- Script simplificado para criar as tabelas básicas
-- Execute este script no SQL Editor do Supabase

-- 1. Criar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar tabela de lojas
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
ALTER TABLE clientes_fast 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'cliente' CHECK (role IN ('admin_supremo', 'gerente', 'cliente'));

ALTER TABLE clientes_fast 
ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES lojas(id);

ALTER TABLE clientes_fast 
ADD COLUMN IF NOT EXISTS senha VARCHAR(255);

-- 5. Inserir admin supremo padrão
INSERT INTO usuarios_sistema (email, senha, nome, role) 
VALUES ('admin@fastsistemas.com', 'admin123', 'Administrador Supremo', 'admin_supremo')
ON CONFLICT (email) DO UPDATE SET
  senha = EXCLUDED.senha,
  nome = EXCLUDED.nome,
  role = EXCLUDED.role;

-- 6. Inserir algumas lojas de exemplo
INSERT INTO lojas (nome, cnpj, cidade, estado) VALUES
('Loja Centro', '12.345.678/0001-90', 'São Paulo', 'SP'),
('Loja Shopping', '12.345.678/0002-71', 'São Paulo', 'SP'),
('Loja Bairro Sul', '12.345.678/0003-52', 'São Paulo', 'SP')
ON CONFLICT (cnpj) DO NOTHING;

-- 7. Criar alguns gerentes de exemplo
INSERT INTO usuarios_sistema (email, senha, nome, role, loja_id) 
SELECT 
  'gerente1@fastsistemas.com',
  'gerente123',
  'Gerente Loja Centro',
  'gerente',
  l.id
FROM lojas l 
WHERE l.nome = 'Loja Centro'
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios_sistema (email, senha, nome, role, loja_id) 
SELECT 
  'gerente2@fastsistemas.com',
  'gerente123',
  'Gerente Loja Shopping',
  'gerente',
  l.id
FROM lojas l 
WHERE l.nome = 'Loja Shopping'
ON CONFLICT (email) DO NOTHING;

-- 8. Criar índices
CREATE INDEX IF NOT EXISTS idx_usuarios_sistema_email ON usuarios_sistema(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_sistema_role ON usuarios_sistema(role);
CREATE INDEX IF NOT EXISTS idx_clientes_fast_role ON clientes_fast(role);
CREATE INDEX IF NOT EXISTS idx_lojas_ativa ON lojas(ativa);

-- 9. Atualizar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para as novas tabelas
CREATE TRIGGER update_usuarios_sistema_updated_at 
  BEFORE UPDATE ON usuarios_sistema 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lojas_updated_at 
  BEFORE UPDATE ON lojas 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE usuarios_sistema IS 'Tabela para usuários administrativos do sistema (admin supremo, gerentes)';
COMMENT ON TABLE lojas IS 'Tabela de lojas para associar gerentes';
