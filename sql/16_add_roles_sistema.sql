-- ====================================
-- SCRIPT PARA ADICIONAR SISTEMA DE ROLES
-- Sistema de 3 níveis: cliente, gerente, admin
-- ====================================

-- 1. Adicionar coluna role na tabela clientes_fast se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='clientes_fast' AND column_name='role'
  ) THEN
    ALTER TABLE clientes_fast ADD COLUMN role VARCHAR(20) DEFAULT 'cliente';
  END IF;
END$$;

-- 2. Remover todas as constraints de role antigas e criar nova
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Buscar e remover todas as constraints relacionadas ao campo role
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'clientes_fast'::regclass 
        AND conname LIKE '%role%'
    LOOP
        EXECUTE 'ALTER TABLE clientes_fast DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
    
    -- Criar nova constraint com os 3 níveis
    ALTER TABLE clientes_fast ADD CONSTRAINT check_clientes_fast_role 
      CHECK (role IN ('admin', 'gerente', 'cliente'));
END$$;

-- 3. Criar índice para role se não existir
CREATE INDEX IF NOT EXISTS idx_clientes_fast_role ON clientes_fast(role);

-- 4. Atualizar usuários existentes que são admin
UPDATE clientes_fast 
SET role = 'admin' 
WHERE email LIKE '%admin%' OR email LIKE '%fast%' OR is_admin = true;

-- 5. Adicionar alguns usuários de exemplo com diferentes roles
INSERT INTO clientes_fast (nome, email, cpf_cnpj, tipo, role, saldo_pontos, senha) VALUES
('Admin Sistema', 'admin@fastsistemas.com.br', '00000000000', 'CPF', 'admin', 0, 'admin123'),
('Gerente Loja 1', 'gerente1@loja.com', '11111111111', 'CPF', 'gerente', 0, 'gerente123'),
('Gerente Loja 2', 'gerente2@loja.com', '22222222222', 'CPF', 'gerente', 0, 'gerente123')
ON CONFLICT (cpf_cnpj) DO UPDATE SET
  role = EXCLUDED.role,
  email = EXCLUDED.email,
  nome = EXCLUDED.nome;

-- 6. Função para verificar permissões
CREATE OR REPLACE FUNCTION tem_permissao(user_role TEXT, permissao_requerida TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  CASE permissao_requerida
    WHEN 'cliente' THEN
      RETURN user_role IN ('cliente', 'gerente', 'admin');
    WHEN 'gerente' THEN
      RETURN user_role IN ('gerente', 'admin');
    WHEN 'admin' THEN
      RETURN user_role = 'admin';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

COMMIT;
