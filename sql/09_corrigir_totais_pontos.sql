-- Script para corrigir totais de pontos ganhos e gastos dos clientes
-- Este script recalcula os totais com base no histórico de pontos

-- Atualizar total_pontos_ganhos baseado no histórico
UPDATE clientes_fast 
SET total_pontos_ganhos = COALESCE((
    SELECT SUM(pontos) 
    FROM historico_pontos 
    WHERE cliente_id = clientes_fast.id 
    AND tipo_operacao = 'ganho'
    AND pontos > 0
), 0);

-- Atualizar total_pontos_gastos baseado no histórico
UPDATE clientes_fast 
SET total_pontos_gastos = COALESCE((
    SELECT SUM(ABS(pontos)) 
    FROM historico_pontos 
    WHERE cliente_id = clientes_fast.id 
    AND tipo_operacao = 'resgate'
    AND pontos < 0
), 0);

-- Verificar os resultados
SELECT 
    id,
    nome,
    saldo_pontos,
    total_pontos_ganhos,
    total_pontos_gastos,
    (total_pontos_ganhos - total_pontos_gastos) as saldo_calculado,
    CASE 
        WHEN saldo_pontos = (total_pontos_ganhos - total_pontos_gastos) THEN 'CORRETO'
        ELSE 'DIVERGENTE'
    END as status_saldo
FROM clientes_fast
ORDER BY nome;

-- Se houver divergências no saldo, corrigir (opcional):
-- UPDATE clientes_fast 
-- SET saldo_pontos = (total_pontos_ganhos - total_pontos_gastos)
-- WHERE saldo_pontos != (total_pontos_ganhos - total_pontos_gastos);
