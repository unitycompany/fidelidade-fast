-- Inserir dados iniciais dos produtos elegíveis do Clube Fast de Recompensas
-- APENAS os produtos oficiais conforme regras do programa

-- === PLACA ST (0,5 pontos por R$ 1,00) ===
INSERT INTO produtos_elegiveis (codigo, nome, pontos_por_real, categoria, descricao, ativa) VALUES
('PLACA_ST', 'Placa ST', 0.5, 'placa_st', 'Placas ST para drywall - qualquer espessura', true)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    pontos_por_real = EXCLUDED.pontos_por_real,
    categoria = EXCLUDED.categoria,
    descricao = EXCLUDED.descricao,
    ativa = EXCLUDED.ativa,
    updated_at = CURRENT_TIMESTAMP;

-- === PLACA RU (1 ponto por R$ 1,00) ===
INSERT INTO produtos_elegiveis (codigo, nome, pontos_por_real, categoria, descricao, ativa) VALUES
('PLACA_RU', 'Placa RU', 1.0, 'placa_ru', 'Placas RU resistentes à umidade - qualquer espessura', true)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    pontos_por_real = EXCLUDED.pontos_por_real,
    categoria = EXCLUDED.categoria,
    descricao = EXCLUDED.descricao,
    ativa = EXCLUDED.ativa,
    updated_at = CURRENT_TIMESTAMP;

-- === PLACA GLASROC X (2 pontos por R$ 1,00) ===
INSERT INTO produtos_elegiveis (codigo, nome, pontos_por_real, categoria, descricao, ativa) VALUES
('PLACA_GLASROC_X', 'Placa Glasroc X', 2.0, 'glasroc_x', 'Placas cimentícias Glasroc X para áreas úmidas', true)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    pontos_por_real = EXCLUDED.pontos_por_real,
    categoria = EXCLUDED.categoria,
    descricao = EXCLUDED.descricao,
    ativa = EXCLUDED.ativa,
    updated_at = CURRENT_TIMESTAMP;

-- === PLACOMIX (1 ponto por R$ 1,00) ===
INSERT INTO produtos_elegiveis (codigo, nome, pontos_por_real, categoria, descricao, ativa) VALUES
('PLACOMIX', 'Placomix', 1.0, 'placomix', 'Massa para rejunte e acabamento Placomix', true)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    pontos_por_real = EXCLUDED.pontos_por_real,
    categoria = EXCLUDED.categoria,
    descricao = EXCLUDED.descricao,
    ativa = EXCLUDED.ativa,
    updated_at = CURRENT_TIMESTAMP;

-- === MALHA TELADA PARA GLASROC X (2 pontos por R$ 1,00) ===
INSERT INTO produtos_elegiveis (codigo, nome, pontos_por_real, categoria, descricao, ativa) VALUES
('MALHA_GLASROC_X', 'Malha telada para Glasroc X', 2.0, 'malha_glasroc', 'Malha telada específica para uso com Glasroc X', true)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    pontos_por_real = EXCLUDED.pontos_por_real,
    categoria = EXCLUDED.categoria,
    descricao = EXCLUDED.descricao,
    ativa = EXCLUDED.ativa,
    updated_at = CURRENT_TIMESTAMP;

-- === BASECOAT - MASSA PARA GLASROC X (2 pontos por R$ 1,00) ===
INSERT INTO produtos_elegiveis (codigo, nome, pontos_por_real, categoria, descricao, ativa) VALUES
('BASECOAT_GLASROC_X', 'Basecoat (massa para Glasroc X)', 2.0, 'basecoat', 'Massa base específica para tratamento de juntas Glasroc X', true)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    pontos_por_real = EXCLUDED.pontos_por_real,
    categoria = EXCLUDED.categoria,
    descricao = EXCLUDED.descricao,
    ativa = EXCLUDED.ativa,
    updated_at = CURRENT_TIMESTAMP;

-- Verificar quantos produtos foram inseridos
SELECT 
    categoria,
    COUNT(*) as total_produtos,
    AVG(pontos_por_real) as media_pontos
FROM produtos_elegiveis 
WHERE ativa = true
GROUP BY categoria
ORDER BY media_pontos DESC, categoria;

-- Mostrar resumo por nível de pontuação
SELECT 
    pontos_por_real,
    COUNT(*) as total_produtos,
    STRING_AGG(DISTINCT categoria, ', ') as categorias
FROM produtos_elegiveis 
WHERE ativa = true
GROUP BY pontos_por_real
ORDER BY pontos_por_real DESC;
