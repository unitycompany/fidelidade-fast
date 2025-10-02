-- ========================================
-- Fixar ON DELETE CASCADE para clientes_fast
-- Execute no Supabase SQL Editor (com cuidado)
-- ========================================

-- 1) pedidos_vendas.cliente_id -> clientes_fast.id (CASCADE)
DO $$
DECLARE c_name text; BEGIN
  SELECT tc.constraint_name INTO c_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
  WHERE tc.table_name='pedidos_vendas' AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='cliente_id' AND ccu.table_name='clientes_fast' LIMIT 1;
  IF c_name IS NOT NULL THEN EXECUTE 'ALTER TABLE pedidos_vendas DROP CONSTRAINT '||c_name; END IF;
  ALTER TABLE pedidos_vendas ADD CONSTRAINT pedidos_vendas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;
END $$;

-- 2) historico_pontos.cliente_id -> clientes_fast.id (CASCADE)
DO $$
DECLARE c_name text; BEGIN
  SELECT tc.constraint_name INTO c_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
  WHERE tc.table_name='historico_pontos' AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='cliente_id' AND ccu.table_name='clientes_fast' LIMIT 1;
  IF c_name IS NOT NULL THEN EXECUTE 'ALTER TABLE historico_pontos DROP CONSTRAINT '||c_name; END IF;
  ALTER TABLE historico_pontos ADD CONSTRAINT historico_pontos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;
END $$;

-- 3) resgates.cliente_id -> clientes_fast.id (CASCADE) (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='resgates') THEN
    BEGIN
      ALTER TABLE resgates DROP CONSTRAINT IF EXISTS resgates_cliente_id_fkey;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    ALTER TABLE resgates ADD CONSTRAINT resgates_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4) resgates_premios.cliente_id -> clientes_fast.id (CASCADE) (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='resgates_premios') THEN
    BEGIN
      ALTER TABLE resgates_premios DROP CONSTRAINT IF EXISTS resgates_premios_cliente_id_fkey; 
    EXCEPTION WHEN OTHERS THEN NULL; END;
    ALTER TABLE resgates_premios ADD CONSTRAINT resgates_premios_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5) Verificação
SELECT tc.table_name, tc.constraint_name, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_name IN ('pedidos_vendas','historico_pontos','resgates','resgates_premios');
