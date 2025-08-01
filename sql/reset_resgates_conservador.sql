-- =======================================================
-- RESET CONSERVADOR DOS RESGATES - VERSÃO SEGURA
-- =======================================================
-- Execute as seções individualmente para maior controle
-- =======================================================

-- SEÇÃO 1: CONSULTAR DADOS ANTES DA LIMPEZA
-- (Execute primeiro para ver o que será afetado)
-- =======================================================

SELECT 'RESUMO ATUAL DOS RESGATES:' as info;

SELECT 
    COUNT(*) as total_resgates,
    COUNT(DISTINCT cliente_id) as clientes_com_resgates,
    COALESCE(SUM(pontos_utilizados), 0) as total_pontos_utilizados,
    SUM(quantidade) as total_itens_resgatados
FROM resgates;

SELECT 'RESGATES POR STATUS:' as info;

SELECT 
    status,
    COUNT(*) as quantidade,
    COALESCE(SUM(pontos_utilizados), 0) as pontos_utilizados
FROM resgates 
GROUP BY status
ORDER BY quantidade DESC;

SELECT 'CLIENTES COM MAIS RESGATES:' as info;

SELECT 
    c.nome,
    c.email,
    c.saldo_pontos as pontos_atuais,
    COUNT(r.id) as total_resgates,
    COALESCE(SUM(r.pontos_utilizados), 0) as pontos_utilizados_resgates
FROM clientes_fast c
INNER JOIN resgates r ON c.id = r.cliente_id
GROUP BY c.id, c.nome, c.email, c.saldo_pontos
ORDER BY total_resgates DESC
LIMIT 10;

-- =======================================================
-- SEÇÃO 2: BACKUP DE SEGURANÇA (Opcional)
-- =======================================================

-- Descomentar se quiser fazer backup:
-- CREATE TABLE resgates_backup AS SELECT * FROM resgates;
-- SELECT 'Backup criado: resgates_backup' as info;

-- =======================================================
-- SEÇÃO 3: RESTAURAR PONTOS AOS CLIENTES
-- Execute apenas se quiser restaurar os pontos gastos
-- =======================================================

-- Prévia do que será restaurado:
SELECT 'PONTOS QUE SERÃO RESTAURADOS:' as info;

SELECT 
    c.nome,
    c.email,
    c.saldo_pontos as pontos_atuais,
    COALESCE(SUM(r.pontos_utilizados), 0) as pontos_a_restaurar,
    c.saldo_pontos + COALESCE(SUM(r.pontos_utilizados), 0) as pontos_finais
FROM clientes_fast c
LEFT JOIN resgates r ON c.id = r.cliente_id
WHERE r.cliente_id IS NOT NULL
GROUP BY c.id, c.nome, c.email, c.saldo_pontos
ORDER BY pontos_a_restaurar DESC;

-- Executar restauração (descomente para executar):
/*
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

SELECT 'Pontos restaurados com sucesso!' as info;
*/

-- =======================================================
-- SEÇÃO 4: LIMPEZA DOS RESGATES
-- =======================================================

-- Opção A: Deletar apenas resgates de teste (mais seguro)
-- (descomente para executar):
/*
DELETE FROM resgates 
WHERE status IN ('processando', 'cancelado')
   OR created_at >= '2024-12-01'  -- Ajuste a data conforme necessário
   OR observacoes ILIKE '%teste%';

SELECT 'Resgates de teste removidos!' as info;
*/

-- Opção B: Limpar TODOS os resgates (cuidado!)
-- (descomente para executar):
/*
TRUNCATE TABLE resgates RESTART IDENTITY;
SELECT 'TODOS os resgates foram removidos!' as info;
*/

-- =======================================================
-- SEÇÃO 5: VERIFICAÇÃO FINAL
-- =======================================================

SELECT 'VERIFICAÇÃO FINAL:' as info;

SELECT 
    COUNT(*) as resgates_restantes
FROM resgates;

SELECT 
    'TOP 10 CLIENTES COM MAIS PONTOS:' as info;

SELECT 
    nome,
    email,
    saldo_pontos
FROM clientes_fast 
WHERE saldo_pontos > 0
ORDER BY saldo_pontos DESC
LIMIT 10;
