-- Script para inicializar produtos elegíveis no banco de dados
-- Este script deve ser executado uma única vez para popular a tabela

-- Limpar tabela se existir (apenas para reset durante desenvolvimento)
-- TRUNCATE TABLE produtos_elegiveis;

-- Inserir produtos elegíveis padrão do Clube Fast de Recompensas
-- Pontuação estratégica: produtos de baixa margem = menos pontos, produtos estratégicos = mais pontos
INSERT INTO produtos_elegiveis (codigo, nome, pontos_por_real, categoria, descricao, ativa) VALUES

-- PLACAS ST (0.5 pontos por R$ 1,00) - Produtos de baixa margem
('PLACA_ST', 'Placa ST', 0.5, 'placa_st', 'Placas ST para drywall - linha padrão (baixa margem)', true),
('PLACA_ST_13MM', 'Placa ST 13mm', 0.5, 'placa_st', 'Placa ST espessura 13mm', true),
('PLACA_ST_15MM', 'Placa ST 15mm', 0.5, 'placa_st', 'Placa ST espessura 15mm', true),
('PLACA_ST_18MM', 'Placa ST 18mm', 0.5, 'placa_st', 'Placa ST espessura 18mm', true),

-- PLACAS RU (1.0 ponto por R$ 1,00) - Produtos intermediários
('PLACA_RU', 'Placa RU', 1.0, 'placa_ru', 'Placas RU resistentes à umidade', true),
('PLACA_RU_13MM', 'Placa RU 13mm', 1.0, 'placa_ru', 'Placa RU espessura 13mm', true),
('PLACA_RU_15MM', 'Placa RU 15mm', 1.0, 'placa_ru', 'Placa RU espessura 15mm', true),

-- PLACAS GLASROC X (2.0 pontos por R$ 1,00) - Produtos estratégicos e de valor agregado
('PLACA_GLASROC_X', 'Placa Glasroc X', 2.0, 'glasroc_x', 'Placas cimentícias Glasroc X - produto estratégico', true),
('PLACA_GLASROC_X_10MM', 'Placa Glasroc X 10mm', 2.0, 'glasroc_x', 'Placa Glasroc X espessura 10mm', true),
('PLACA_GLASROC_X_12MM', 'Placa Glasroc X 12mm', 2.0, 'glasroc_x', 'Placa Glasroc X espessura 12mm', true),

-- PLACOMIX (1.0 ponto por R$ 1,00) - Produto intermediário
('PLACOMIX', 'Placomix', 1.0, 'placomix', 'Massa para rejunte Placomix', true),
('PLACOMIX_20KG', 'Placomix 20kg', 1.0, 'placomix', 'Massa para rejunte Placomix embalagem 20kg', true),
('PLACOMIX_25KG', 'Placomix 25kg', 1.0, 'placomix', 'Massa para rejunte Placomix embalagem 25kg', true),

-- MALHA GLASROC X (2.0 pontos por R$ 1,00) - Produto estratégico
('MALHA_GLASROC_X', 'Malha telada para Glasroc X', 2.0, 'malha_glasroc', 'Malha telada para Glasroc X - acessório estratégico', true),
('MALHA_GLASROC_50M', 'Malha Glasroc X 50m', 2.0, 'malha_glasroc', 'Malha telada Glasroc X rolo 50m', true),
('MALHA_GLASROC_100M', 'Malha Glasroc X 100m', 2.0, 'malha_glasroc', 'Malha telada Glasroc X rolo 100m', true),

-- BASECOAT GLASROC X (2.0 pontos por R$ 1,00) - Produto estratégico
('BASECOAT_GLASROC_X', 'Basecoat (massa para Glasroc X)', 2.0, 'basecoat', 'Massa base para Glasroc X - produto de valor agregado', true),
('BASECOAT_20KG', 'Basecoat Glasroc X 20kg', 2.0, 'basecoat', 'Basecoat para Glasroc X embalagem 20kg', true),
('BASECOAT_25KG', 'Basecoat Glasroc X 25kg', 2.0, 'basecoat', 'Basecoat para Glasroc X embalagem 25kg', true)

ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    pontos_por_real = EXCLUDED.pontos_por_real,
    categoria = EXCLUDED.categoria,
    descricao = EXCLUDED.descricao,
    ativa = EXCLUDED.ativa,
    updated_at = CURRENT_TIMESTAMP;

-- Verificar inserção
SELECT 
    categoria,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN ativa THEN 1 END) as produtos_ativos,
    AVG(pontos_por_real) as pontos_medio
FROM produtos_elegiveis 
GROUP BY categoria 
ORDER BY pontos_medio DESC;

-- Verificar total geral
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN ativa THEN 1 END) as produtos_ativos,
    COUNT(CASE WHEN NOT ativa THEN 1 END) as produtos_inativos
FROM produtos_elegiveis;
