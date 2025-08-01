-- =======================================================
-- SCRIPT DE RESET DOS RESGATES DE TESTE
-- =======================================================
-- Este script limpa todos os resgates de teste e restaura 
-- os pontos gastos para os clientes.
-- 
-- IMPORTANTE: Execute este script apenas em ambiente de teste!
-- =======================================================

-- 1. Backup dos dados antes da limpeza (opcional - para auditoria)
-- CREATE TABLE resgates_backup_$(date +%Y%m%d) AS SELECT * FROM resgates;

-- 2. Restaurar pontos gastos nos resgates para os clientes
-- (Soma os pontos gastos em resgates de volta ao saldo dos clientes)
UPDATE clientes_fast 
SET saldo_pontos = saldo_pontos + (
    SELECT COALESCE(SUM(r.pontos_utilizados), 0)
    FROM resgates r 
    WHERE r.cliente_id = clientes_fast.id
)
WHERE id IN (
    SELECT DISTINCT cliente_id 
    FROM resgates 
    WHERE cliente_id IS NOT NULL
);

-- 3. Mostrar quantos resgates serão removidos
SELECT 
    COUNT(*) as total_resgates,
    COUNT(DISTINCT cliente_id) as clientes_afetados,
    COALESCE(SUM(pontos_utilizados), 0) as total_pontos_restaurados
FROM resgates;

-- 4. Limpar todos os resgates
TRUNCATE TABLE resgates RESTART IDENTITY CASCADE;

-- 5. Verificação final - mostrar clientes com seus novos saldos
SELECT 
    id,
    nome,
    email,
    saldo_pontos
FROM clientes_fast 
WHERE saldo_pontos > 0
ORDER BY saldo_pontos DESC;

-- 6. Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Reset de resgates concluído com sucesso!';
    RAISE NOTICE 'Todos os resgates foram removidos e pontos restaurados aos clientes.';
    RAISE NOTICE 'Verifique os saldos acima para confirmar.';
END $$;
