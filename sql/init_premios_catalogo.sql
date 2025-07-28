-- Script para inicializar catálogo de prêmios do Clube Fast de Recompensas
-- Este script deve ser executado uma única vez para popular a tabela com os prêmios iniciais

-- Limpar tabela se existir (apenas para reset durante desenvolvimento)
-- TRUNCATE TABLE premios_catalogo;

-- Inserir prêmios EXATAMENTE conforme tabela fornecida pelo cliente
INSERT INTO premios_catalogo (nome, descricao, categoria, pontos_necessarios, valor_estimado, estoque_disponivel, estoque_ilimitado, ativo, destaque, ordem_exibicao, imagem_url) VALUES

-- PRÊMIOS CONFORME TABELA EXATA DO CLIENTE
('Nível Laser', 'Nível laser profissional', 'ferramentas', 10000, 500.00, 5, false, true, true, 1, null),

('Parafusadeira', 'Parafusadeira elétrica profissional', 'ferramentas', 5000, 300.00, 8, false, true, true, 2, null),

('Trena Digital', 'Trena digital de precisão', 'ferramentas', 3000, 200.00, 10, false, true, true, 3, null),

('Kit Brocas SDS (5 unid.)', 'Kit com 5 brocas SDS profissionais', 'ferramentas', 1500, 80.00, 15, false, true, false, 4, null),

('Vale-compras em produtos Fast', 'Vale para compra de produtos Fast Sistemas', 'vale_compras', 2000, 100.00, 0, true, true, true, 5, null),

('Camiseta personalizada Fast', 'Camiseta personalizada com logo Fast Sistemas', 'brindes', 1000, 50.00, 50, false, true, false, 6, null),

('Boné Fast', 'Boné com logo Fast Sistemas', 'brindes', 800, 40.00, 60, false, true, false, 7, null)

ON CONFLICT (nome) DO UPDATE SET
    descricao = EXCLUDED.descricao,
    categoria = EXCLUDED.categoria,
    pontos_necessarios = EXCLUDED.pontos_necessarios,
    valor_estimado = EXCLUDED.valor_estimado,
    estoque_disponivel = EXCLUDED.estoque_disponivel,
    estoque_ilimitado = EXCLUDED.estoque_ilimitado,
    ativo = EXCLUDED.ativo,
    destaque = EXCLUDED.destaque,
    ordem_exibicao = EXCLUDED.ordem_exibicao,
    updated_at = CURRENT_TIMESTAMP;

-- Verificar inserção
SELECT 
    categoria,
    COUNT(*) as total_premios,
    MIN(pontos_necessarios) as pontos_min,
    MAX(pontos_necessarios) as pontos_max,
    SUM(CASE WHEN ativo THEN 1 ELSE 0 END) as ativos
FROM premios_catalogo 
GROUP BY categoria 
ORDER BY categoria;

-- Listar prêmios em destaque
SELECT nome, categoria, pontos_necessarios, valor_estimado 
FROM premios_catalogo 
WHERE destaque = true 
ORDER BY ordem_exibicao;
