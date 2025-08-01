-- RESET RÁPIDO DOS PRÊMIOS - FERRAMENTAS PROFISSIONAIS
-- Remove todos e adiciona apenas os 10 itens especificados

-- Limpar prêmios atuais
DELETE FROM premios_catalogo;

-- Inserir novos prêmios
INSERT INTO premios_catalogo (nome, descricao, categoria, pontos_necessarios, valor_estimado, estoque_ilimitado, ativo, destaque, ordem_exibicao, imagem_url) VALUES 
('Bosch Furadeira GSR 7-14', 'Furadeira profissional Bosch GSR 7-14', 'Ferramentas', 268250, 150.00, true, true, false, 1, 'https://via.placeholder.com/300x200?text=Bosch+GSR+7-14'),
('Bosch GSR 6-45TE', 'Parafusadeira Bosch GSR 6-45TE', 'Ferramentas', 318235, 180.00, true, true, false, 2, 'https://via.placeholder.com/300x200?text=Bosch+GSR+6-45TE'),
('Bosch Furadeira GSR1000 Smart', 'Furadeira Bosch GSR1000 Smart', 'Ferramentas', 344047, 200.00, true, true, true, 3, 'https://via.placeholder.com/300x200?text=GSR1000+Smart'),
('Stanley Nível Laser 10m', 'Nível a laser Stanley 10m', 'Ferramentas', 361753, 220.00, true, true, false, 4, 'https://via.placeholder.com/300x200?text=Stanley+Laser'),
('Skil Serra Mármore 9815 - 127V', 'Serra mármore Skil 9815 - 127V', 'Ferramentas', 362025, 230.00, true, true, false, 5, 'https://via.placeholder.com/300x200?text=Skil+9815'),
('Bosch Serra Mármore GDC150', 'Serra mármore Bosch GDC150', 'Ferramentas', 611306, 350.00, true, true, false, 6, 'https://via.placeholder.com/300x200?text=Bosch+GDC150'),
('Bosch Serra Circular GKS 20-65 220V', 'Serra circular Bosch GKS 20-65 220V', 'Ferramentas', 632556, 380.00, true, true, true, 7, 'https://via.placeholder.com/300x200?text=GKS+20-65'),
('DEWALT Parafusadeira Drywall', 'Parafusadeira DEWALT Drywall', 'Ferramentas', 1018940, 600.00, true, true, false, 8, 'https://via.placeholder.com/300x200?text=DEWALT+Drywall'),
('Bosch Nível GCL 2-15', 'Nível a laser Bosch GCL 2-15', 'Ferramentas', 1265004, 750.00, true, true, true, 9, 'https://via.placeholder.com/300x200?text=GCL+2-15'),
('Bosch Martelete GBH 2-20D', 'Martelete Bosch GBH 2-20D', 'Ferramentas', 1898280, 1100.00, true, true, true, 10, 'https://via.placeholder.com/300x200?text=GBH+2-20D');

-- Verificar resultado
SELECT nome, pontos_necessarios FROM premios_catalogo ORDER BY pontos_necessarios;
