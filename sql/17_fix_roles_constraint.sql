-- ====================================
-- SCRIPT PARA CORRIGIR CONSTRAINT DE ROLES
-- Remove constraints antigas e cria nova
-- ====================================

-- 1. Remover TODAS as constraints relacionadas ao campo role
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Listar e remover todas as constraints relacionadas ao campo role
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'clientes_fast'::regclass 
        AND (conname LIKE '%role%' OR conname LIKE '%check%')
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE clientes_fast DROP CONSTRAINT IF EXISTS ' || constraint_name;
            RAISE NOTICE 'Removed constraint: %', constraint_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not remove constraint: %', constraint_name;
        END;
    END LOOP;
END$$;

-- 2. Adicionar coluna role se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='clientes_fast' AND column_name='role'
  ) THEN
    ALTER TABLE clientes_fast ADD COLUMN role VARCHAR(20) DEFAULT 'cliente';
    RAISE NOTICE 'Added role column';
  ELSE
    RAISE NOTICE 'Role column already exists';
  END IF;
END$$;

-- 3. Atualizar todos os registros para ter role válido
UPDATE clientes_fast 
SET role = CASE 
  WHEN role IS NULL OR role NOT IN ('admin', 'gerente', 'cliente') THEN 'cliente'
  ELSE role
END;

-- 4. Atualizar usuários que deveriam ser admin
UPDATE clientes_fast 
SET role = 'admin' 
WHERE email LIKE '%admin%' OR email LIKE '%fast%' OR is_admin = true;

-- 5. Criar nova constraint
ALTER TABLE clientes_fast ADD CONSTRAINT check_clientes_fast_role_new 
  CHECK (role IN ('admin', 'gerente', 'cliente'));

-- 6. Criar índice
CREATE INDEX IF NOT EXISTS idx_clientes_fast_role ON clientes_fast(role);

-- 7. Inserir/atualizar usuários de exemplo de forma segura
DO $$
BEGIN
  -- Admin Sistema
  IF EXISTS (SELECT 1 FROM clientes_fast WHERE email = 'admin@fastsistemas.com.br') THEN
    UPDATE clientes_fast SET role = 'admin', nome = 'Admin Sistema' 
    WHERE email = 'admin@fastsistemas.com.br';
  ELSIF EXISTS (SELECT 1 FROM clientes_fast WHERE cpf_cnpj = '00000000000') THEN
    UPDATE clientes_fast SET role = 'admin', nome = 'Admin Sistema', email = 'admin@fastsistemas.com.br' 
    WHERE cpf_cnpj = '00000000000';
  ELSE
    INSERT INTO clientes_fast (nome, email, cpf_cnpj, tipo, role, saldo_pontos) 
    VALUES ('Admin Sistema', 'admin@fastsistemas.com.br', '00000000000', 'CPF', 'admin', 0);
  END IF;

  -- Gerente 1
  IF EXISTS (SELECT 1 FROM clientes_fast WHERE email = 'gerente1@loja.com') THEN
    UPDATE clientes_fast SET role = 'gerente', nome = 'Gerente Loja 1' 
    WHERE email = 'gerente1@loja.com';
  ELSIF EXISTS (SELECT 1 FROM clientes_fast WHERE cpf_cnpj = '11111111111') THEN
    UPDATE clientes_fast SET role = 'gerente', nome = 'Gerente Loja 1', email = 'gerente1@loja.com' 
    WHERE cpf_cnpj = '11111111111';
  ELSE
    INSERT INTO clientes_fast (nome, email, cpf_cnpj, tipo, role, saldo_pontos) 
    VALUES ('Gerente Loja 1', 'gerente1@loja.com', '11111111111', 'CPF', 'gerente', 0);
  END IF;

  -- Gerente 2
  IF EXISTS (SELECT 1 FROM clientes_fast WHERE email = 'gerente2@loja.com') THEN
    UPDATE clientes_fast SET role = 'gerente', nome = 'Gerente Loja 2' 
    WHERE email = 'gerente2@loja.com';
  ELSIF EXISTS (SELECT 1 FROM clientes_fast WHERE cpf_cnpj = '22222222222') THEN
    UPDATE clientes_fast SET role = 'gerente', nome = 'Gerente Loja 2', email = 'gerente2@loja.com' 
    WHERE cpf_cnpj = '22222222222';
  ELSE
    INSERT INTO clientes_fast (nome, email, cpf_cnpj, tipo, role, saldo_pontos) 
    VALUES ('Gerente Loja 2', 'gerente2@loja.com', '22222222222', 'CPF', 'gerente', 0);
  END IF;
END$$;

-- 8. Verificar resultado
SELECT nome, email, role FROM clientes_fast WHERE role IN ('admin', 'gerente') ORDER BY role;

COMMIT;
