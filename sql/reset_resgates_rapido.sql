-- =======================================================
-- RESET RÁPIDO DOS RESGATES
-- =======================================================
-- Script simples para limpeza rápida dos resgates de teste
-- =======================================================

-- 1. Ver quantos resgates existem
SELECT 
    'Resgates atuais: ' || COUNT(*) || ' registros' as status,
    'Pontos utilizados: ' || COALESCE(SUM(pontos_utilizados), 0) || ' pontos' as pontos,
    'Clientes afetados: ' || COUNT(DISTINCT cliente_id) || ' clientes' as clientes
FROM resgates;

-- 2. Restaurar pontos dos resgates para os clientes
UPDATE clientes_fast 
SET saldo_pontos = saldo_pontos + (
    SELECT COALESCE(SUM(pontos_utilizados), 0)
    FROM resgates 
    WHERE cliente_id = clientes_fast.id
)
WHERE EXISTS (
    SELECT 1 FROM resgates WHERE cliente_id = clientes_fast.id
);

-- 3. Limpar todos os resgates
DELETE FROM resgates;

-- 4. Resetar contador de IDs (opcional)
-- ALTER SEQUENCE resgates_id_seq RESTART WITH 1;

-- 5. Confirmação
SELECT 
    'Reset concluído!' as status,
    'Resgates restantes: ' || COUNT(*) as resgates_restantes
FROM resgates;

-- 6. Ver clientes com pontos restaurados
SELECT 
    nome,
    email,
    saldo_pontos
FROM clientes_fast 
WHERE saldo_pontos > 0
ORDER BY saldo_pontos DESC
LIMIT 5;
