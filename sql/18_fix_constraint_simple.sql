-- ====================================
-- SCRIPT SIMPLES PARA CORRIGIR CONSTRAINT
-- Remove constraint problemática e cria nova
-- ====================================

-- 1. Remover constraint problemática
ALTER TABLE clientes_fast DROP CONSTRAINT IF EXISTS clientes_fast_role_check;
ALTER TABLE clientes_fast DROP CONSTRAINT IF EXISTS check_clientes_fast_role;

-- 2. Criar nova constraint
ALTER TABLE clientes_fast ADD CONSTRAINT check_clientes_fast_role_fixed 
  CHECK (role IN ('admin', 'gerente', 'cliente'));

-- 3. Atualizar usuários admin existentes
UPDATE clientes_fast SET role = 'admin' WHERE email = 'admin@fastsistemas.com.br';

-- 4. Verificar
SELECT nome, email, role FROM clientes_fast WHERE email LIKE '%admin%' OR role = 'admin';

COMMIT;
