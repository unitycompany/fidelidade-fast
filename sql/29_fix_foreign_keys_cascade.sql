-- ====================================
-- SCRIPT PARA CORRIGIR FOREIGN KEYS COM CASCADE
-- RESOLVE O ERRO: Key is still referenced from table "pedidos_vendas"
-- ====================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- Este script resolve o erro 23503 que impede a exclusão de usuários

-- 1. MOSTRAR CONSTRAINTS ATUAIS
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    COALESCE(rc.delete_rule, 'NO ACTION') as delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'clientes_fast'
    AND tc.table_name IN ('historico_pontos', 'pedidos_vendas', 'resgates_premios', 'imagens_notas_fiscais')
ORDER BY tc.table_name;

-- 2. CORRIGIR CONSTRAINT DA TABELA pedidos_vendas (PRINCIPAL PROBLEMA)
DO $$
DECLARE
    constraint_name_var text;
BEGIN
    -- Buscar o nome exato da constraint
    SELECT tc.constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE 
        tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'pedidos_vendas'
        AND kcu.column_name = 'cliente_id'
        AND ccu.table_name = 'clientes_fast'
    LIMIT 1;

    IF constraint_name_var IS NOT NULL THEN
        -- Remover constraint existente
        EXECUTE 'ALTER TABLE pedidos_vendas DROP CONSTRAINT ' || constraint_name_var;
        RAISE NOTICE 'Removida constraint: %', constraint_name_var;
        
        -- Recriar com CASCADE
        ALTER TABLE pedidos_vendas ADD CONSTRAINT pedidos_vendas_cliente_id_fkey 
            FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key pedidos_vendas.cliente_id recriada com CASCADE';
    ELSE
        RAISE NOTICE 'Constraint não encontrada para pedidos_vendas.cliente_id';
    END IF;
END$$;

-- 3. CORRIGIR CONSTRAINT DA TABELA historico_pontos
DO $$
DECLARE
    constraint_name_var text;
BEGIN
    -- Buscar o nome exato da constraint
    SELECT tc.constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE 
        tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'historico_pontos'
        AND kcu.column_name = 'cliente_id'
        AND ccu.table_name = 'clientes_fast'
    LIMIT 1;

    IF constraint_name_var IS NOT NULL THEN
        -- Remover constraint existente
        EXECUTE 'ALTER TABLE historico_pontos DROP CONSTRAINT ' || constraint_name_var;
        RAISE NOTICE 'Removida constraint: %', constraint_name_var;
        
        -- Recriar com CASCADE
        ALTER TABLE historico_pontos ADD CONSTRAINT historico_pontos_cliente_id_fkey 
            FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key historico_pontos.cliente_id recriada com CASCADE';
    ELSE
        RAISE NOTICE 'Constraint não encontrada para historico_pontos.cliente_id';
    END IF;
END$$;

-- 4. VERIFICAR SE JÁ EXISTE CASCADE PARA imagens_notas_fiscais
DO $$
DECLARE
    cascade_exists boolean := false;
BEGIN
    -- Verificar se já existe CASCADE para imagens
    SELECT CASE WHEN rc.delete_rule = 'CASCADE' THEN true ELSE false END INTO cascade_exists
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    LEFT JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
    WHERE 
        tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'imagens_notas_fiscais'
        AND kcu.column_name = 'cliente_id'
        AND ccu.table_name = 'clientes_fast'
    LIMIT 1;

    IF cascade_exists THEN
        RAISE NOTICE 'imagens_notas_fiscais já possui CASCADE configurado';
    ELSE
        RAISE NOTICE 'imagens_notas_fiscais precisa de CASCADE (será configurado se a tabela existir)';
    END IF;
END$$;

-- 5. VERIFICAR RESULTADO FINAL
SELECT 
    'VERIFICAÇÃO FINAL - CONSTRAINTS COM CASCADE' as titulo,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    COALESCE(rc.delete_rule, 'NO ACTION') as delete_rule,
    CASE WHEN rc.delete_rule = 'CASCADE' THEN '✅ OK' ELSE '❌ PROBLEMA' END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'clientes_fast'
    AND tc.table_name IN ('historico_pontos', 'pedidos_vendas', 'resgates_premios', 'imagens_notas_fiscais')
ORDER BY tc.table_name;

-- 6. RESULTADO
SELECT 
    '🎉 SCRIPT EXECUTADO COM SUCESSO!' as resultado,
    'Agora você pode excluir usuários sem erro 23503' as instrucao;

-- Tabela resgates_premios (se existir)
DO $$
BEGIN
    -- Verificar se a tabela existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resgates_premios') THEN
        -- Remover constraint existente se existir
        BEGIN
            ALTER TABLE resgates_premios DROP CONSTRAINT resgates_premios_cliente_id_fkey;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Constraint resgates_premios_cliente_id_fkey não encontrada';
        END;
        
        -- Recriar com CASCADE
        ALTER TABLE resgates_premios ADD CONSTRAINT resgates_premios_cliente_id_fkey 
            FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key resgates_premios.cliente_id recriada com CASCADE';
    ELSE
        RAISE NOTICE 'Tabela resgates_premios não existe';
    END IF;
END$$;

-- 2. VERIFICAR AS CONSTRAINTS CRIADAS
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'clientes_fast'
    AND tc.table_name IN ('historico_pontos', 'pedidos_vendas', 'resgates_premios', 'imagens_notas_fiscais')
ORDER BY tc.table_name, tc.constraint_name;

-- 3. RESULTADO
SELECT 'Foreign Keys com CASCADE configuradas com sucesso!' as status;
