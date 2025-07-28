-- ====================================
-- PARTE 6: DADOS INICIAIS
-- ====================================

-- Inserir fornecedor principal Fast
INSERT INTO fornecedores_fast (cnpj, razao_social, nome_fantasia, ativo, autorizado_fast) 
VALUES ('57.502.321/0001-39', 'DCS DISTRIBUIÇÃO DE MATERIAIS DE CONSTRUÇÃO A SECO LTDA', 'Fast Drywall & Steelframe', true, true);

-- Inserir produtos Fast no catálogo
INSERT INTO produtos_fast_catalogo (codigo, nome, categoria, pontos_por_real, keywords, aliases, ativo, destaque) VALUES
-- Placas ST (0,5 pontos/R$)
('DW00057', 'Placa ST 13 - 1.80 M', 'drywall', 0.5, '{"placa","st","13","1.80"}', '{"PLACA ST 13","ST 13"}', true, true),
('DW00058', 'Placa ST 15 - 1.80 M', 'drywall', 0.5, '{"placa","st","15","1.80"}', '{"PLACA ST 15","ST 15"}', true, true),

-- Placas RU / Montantes / Guias (1 ponto/R$)
('DW00074', 'Guia Drywall 670', 'drywall', 1.0, '{"guia","drywall","670"}', '{"GUIA 670","GUIA DRYWALL"}', true, true),
('DW00007', 'Montante Drywall 670', 'drywall', 1.0, '{"montante","drywall","670"}', '{"MONTANTE 670","MONTANTE DRYWALL"}', true, true),
('DW00075', 'Montante Drywall 900', 'drywall', 1.0, '{"montante","drywall","900"}', '{"MONTANTE 900"}', true, false),

-- Placa Glasroc X (2 pontos/R$)
('GR00001', 'Placa Glasroc X 12.5mm', 'glasroc', 2.0, '{"glasroc","placa","12.5"}', '{"GLASROC X","PLACA GLASROC"}', true, true),
('GR00002', 'Placa Glasroc X 15mm', 'glasroc', 2.0, '{"glasroc","placa","15"}', '{"GLASROC X 15"}', true, true),

-- Placomix (1 ponto/R$)
('PM00001', 'Placomix Acabamento', 'acabamento', 1.0, '{"placomix","acabamento"}', '{"PLACOMIX"}', true, true),

-- Malha telada Glasroc X (2 pontos/R$)
('MT00001', 'Malha telada para Glasroc X', 'glasroc', 2.0, '{"malha","telada","glasroc"}', '{"MALHA GLASROC","TELA GLASROC"}', true, true),

-- Basecoat (2 pontos/R$)
('BC00001', 'Basecoat - Massa para Glasroc X', 'glasroc', 2.0, '{"basecoat","massa","glasroc"}', '{"MASSA GLASROC","BASECOAT"}', true, true);

-- Inserir prêmios iniciais
INSERT INTO premios_catalogo (nome, descricao, categoria, pontos_necessarios, valor_estimado, estoque_ilimitado, ativo, destaque, ordem_exibicao) VALUES
('Nível Laser', 'Nível laser profissional para construção', 'ferramentas', 10000, 500.00, false, true, true, 1),
('Parafusadeira', 'Parafusadeira elétrica profissional', 'ferramentas', 5000, 300.00, false, true, true, 2),
('Trena Digital', 'Trena digital 5 metros', 'ferramentas', 3000, 200.00, false, true, true, 3),
('Kit Brocas SDS', 'Kit com 5 brocas SDS profissionais', 'ferramentas', 1500, 80.00, false, true, false, 4),
('Vale-compras Fast', 'Vale para compra de produtos Fast', 'vale', 2000, 100.00, true, true, true, 5),
('Camiseta Fast', 'Camiseta personalizada Fast Sistemas', 'brinde', 1000, 50.00, false, true, false, 6),
('Boné Fast', 'Boné com logo Fast Sistemas', 'brinde', 800, 40.00, false, true, false, 7);

-- Inserir configuração inicial
INSERT INTO configuracoes_sistema (data_minima_pedidos, prazo_maximo_dias, sistema_ativo) 
VALUES ('2024-01-01', 30, true);
