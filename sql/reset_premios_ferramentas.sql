-- =======================================================
-- RESET DOS PRÊMIOS - NOVA LISTA DE FERRAMENTAS
-- =======================================================
-- Remove todos os prêmios atuais e adiciona a nova lista
-- =======================================================

-- 1. Ver prêmios atuais antes da limpeza
SELECT 
    'Prêmios atuais: ' || COUNT(*) || ' itens' as status
FROM premios_catalogo;

-- 2. Backup dos prêmios atuais (opcional)
-- CREATE TABLE premios_backup AS SELECT * FROM premios_catalogo;

-- 3. Limpar todos os prêmios atuais
TRUNCATE TABLE premios_catalogo RESTART IDENTITY CASCADE;

-- 4. Inserir novos prêmios com as pontuações especificadas
INSERT INTO premios_catalogo (
    nome, 
    descricao, 
    categoria, 
    pontos_necessarios, 
    valor_estimado, 
    estoque_ilimitado, 
    ativo, 
    destaque, 
    ordem_exibicao,
    imagem_url
) VALUES 
-- Ferramentas Bosch, Stanley, Skil e DEWALT
('Bosch Furadeira GSR 7-14', 'Furadeira profissional Bosch modelo GSR 7-14 com alta durabilidade', 'Ferramentas', 268250, 150.00, true, true, false, 1, 'https://via.placeholder.com/300x200?text=Bosch+GSR+7-14'),
('Bosch GSR 6-45TE', 'Parafusadeira Bosch GSR 6-45TE com controle de torque', 'Ferramentas', 318235, 180.00, true, true, false, 2, 'https://via.placeholder.com/300x200?text=Bosch+GSR+6-45TE'),
('Bosch Furadeira GSR1000 Smart', 'Furadeira inteligente Bosch GSR1000 Smart com tecnologia avançada', 'Ferramentas', 344047, 200.00, true, true, true, 3, 'https://via.placeholder.com/300x200?text=GSR1000+Smart'),
('Stanley Nível Laser 10m', 'Nível a laser Stanley com alcance de 10 metros para precisão profissional', 'Ferramentas', 361753, 220.00, true, true, false, 4, 'https://via.placeholder.com/300x200?text=Stanley+Laser'),
('Skil Serra Mármore 9815 - 127V', 'Serra mármore Skil 9815 voltagem 127V ideal para cortes precisos', 'Ferramentas', 362025, 230.00, true, true, false, 5, 'https://via.placeholder.com/300x200?text=Skil+9815'),
('Bosch Serra Mármore GDC150', 'Serra mármore profissional Bosch GDC150 com motor potente', 'Ferramentas', 611306, 350.00, true, true, false, 6, 'https://via.placeholder.com/300x200?text=Bosch+GDC150'),
('Bosch Serra Circular GKS 20-65 220V', 'Serra circular Bosch GKS 20-65 220V para trabalhos pesados', 'Ferramentas', 632556, 380.00, true, true, true, 7, 'https://via.placeholder.com/300x200?text=GKS+20-65'),
('DEWALT Parafusadeira Drywall', 'Parafusadeira DEWALT especializada para drywall com alta performance', 'Ferramentas', 1018940, 600.00, true, true, false, 8, 'https://via.placeholder.com/300x200?text=DEWALT+Drywall'),
('Bosch Nível GCL 2-15', 'Nível a laser Bosch GCL 2-15 com tecnologia de precisão avançada', 'Ferramentas', 1265004, 750.00, true, true, true, 9, 'https://via.placeholder.com/300x200?text=GCL+2-15'),
('Bosch Martelete GBH 2-20D', 'Martelete profissional Bosch GBH 2-20D para trabalhos pesados', 'Ferramentas', 1898280, 1100.00, true, true, true, 10, 'https://via.placeholder.com/300x200?text=GBH+2-20D');

-- 5. Confirmação dos novos prêmios
SELECT 
    'Prêmios inseridos: ' || COUNT(*) || ' itens' as status
FROM premios_catalogo;

-- 6. Visualizar todos os novos prêmios ordenados por pontos
SELECT 
    nome,
    FORMAT('%s pts', TO_CHAR(pontos_necessarios, 'FM999,999,999')) as pontos_formatados,
    pontos_necessarios,
    valor_estimado,
    categoria
FROM premios_catalogo 
ORDER BY pontos_necessarios ASC;

-- 7. Estatísticas dos novos prêmios
SELECT 
    'ESTATÍSTICAS DOS NOVOS PRÊMIOS:' as info;

SELECT
    COUNT(*) as total_premios,
    MIN(pontos_necessarios) as menor_pontuacao,
    MAX(pontos_necessarios) as maior_pontuacao,
    ROUND(AVG(pontos_necessarios)) as media_pontos,
    SUM(CASE WHEN destaque = true THEN 1 ELSE 0 END) as premios_destaque
FROM premios_catalogo;

SELECT 'Reset de prêmios concluído com sucesso!' as resultado;
