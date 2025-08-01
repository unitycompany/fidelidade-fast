-- SCRIPT RÁPIDO PARA CORRIGIR CONSTRAINT DE ROLES

-- 1. Remover constraint problemática
ALTER TABLE clientes_fast DROP CONSTRAINT IF EXISTS clientes_fast_role_check;
ALTER TABLE clientes_fast DROP CONSTRAINT IF EXISTS check_clientes_fast_role;

-- 2. Garantir que todos os registros tenham role válido
UPDATE clientes_fast 
SET role = 'cliente' 
WHERE role IS NULL OR role NOT IN ('admin', 'gerente', 'cliente');

-- 3. Atualizar admins
UPDATE clientes_fast 
SET role = 'admin' 
WHERE email LIKE '%admin%' OR email LIKE '%fast%' OR is_admin = true;

-- 4. Criar nova constraint
ALTER TABLE clientes_fast ADD CONSTRAINT check_clientes_fast_role_new 
  CHECK (role IN ('admin', 'gerente', 'cliente'));

-- Verificar resultado
SELECT nome, email, role FROM clientes_fast WHERE role IN ('admin', 'gerente') ORDER BY role;
