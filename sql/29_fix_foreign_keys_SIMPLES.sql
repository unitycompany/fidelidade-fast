-- ========================================
-- VERSÃO SIMPLES - EXECUTAR LINHA POR LINHA
-- Para resolver: Key is still referenced from table "pedidos_vendas"
-- ========================================

-- 1. VER O PROBLEMA ATUAL
SELECT 
    tc.table_name,
    tc.constraint_name,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name IN ('pedidos_vendas', 'historico_pontos')
AND tc.constraint_type = 'FOREIGN KEY';

-- 2. CORRIGIR pedidos_vendas (PRINCIPAL PROBLEMA)
ALTER TABLE pedidos_vendas DROP CONSTRAINT IF EXISTS pedidos_vendas_cliente_id_fkey;
ALTER TABLE pedidos_vendas ADD CONSTRAINT pedidos_vendas_cliente_id_fkey 
    FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;

-- 3. CORRIGIR historico_pontos  
ALTER TABLE historico_pontos DROP CONSTRAINT IF EXISTS historico_pontos_cliente_id_fkey;
ALTER TABLE historico_pontos ADD CONSTRAINT historico_pontos_cliente_id_fkey 
    FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;

-- 4. VERIFICAR SE FUNCIONOU
SELECT 
    'RESULTADO' as status,
    tc.table_name,
    rc.delete_rule,
    CASE WHEN rc.delete_rule = 'CASCADE' THEN '✅ OK' ELSE '❌ AINDA COM PROBLEMA' END as situacao
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name IN ('pedidos_vendas', 'historico_pontos')
AND tc.constraint_type = 'FOREIGN KEY';

-- 5. TESTE (OPCIONAL - APENAS PARA VERIFICAR)
-- Este comando mostra se ainda há registros que impediriam a exclusão:
-- SELECT count(*) as pedidos_total FROM pedidos_vendas;
-- SELECT count(*) as historico_total FROM historico_pontos;
