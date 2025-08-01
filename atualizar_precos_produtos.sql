-- Atualização de preços dos produtos no catálogo de prêmios
-- Execute este SQL no seu banco de dados Supabase

-- Skil Serra Mármore 9815 - 127V – 24.135 pts
UPDATE premios_catalogo 
SET pontos_necessarios = 24135 
WHERE nome ILIKE '%Skil Serra Mármore 9815%' OR nome ILIKE '%Skil%Serra%Mármore%';

-- Bosch Furadeira GSR 7-14 – 26.825 pts
UPDATE premios_catalogo 
SET pontos_necessarios = 26825 
WHERE nome ILIKE '%Bosch Furadeira GSR 7-14%' OR nome ILIKE '%GSR 7-14%';

-- Bosch Furadeira GSR1000 Smart – 31.277 pts
UPDATE premios_catalogo 
SET pontos_necessarios = 31277 
WHERE nome ILIKE '%GSR1000 Smart%' OR nome ILIKE '%GSR1000%';

-- Bosch Serra Mármore GDC150 – 32.174 pts
UPDATE premios_catalogo 
SET pontos_necessarios = 32174 
WHERE nome ILIKE '%GDC150%' OR nome ILIKE '%Bosch Serra Mármore%GDC%';

-- DEWALT Parafusadeira Drywall – 50.947 pts
UPDATE premios_catalogo 
SET pontos_necessarios = 50947 
WHERE nome ILIKE '%DEWALT%Parafusadeira%Drywall%' OR nome ILIKE '%DEWALT%Drywall%';

-- Stanley Nível Laser 10m – 51.679 pts
UPDATE premios_catalogo 
SET pontos_necessarios = 51679 
WHERE nome ILIKE '%Stanley%Nível%Laser%' OR nome ILIKE '%Stanley%Laser%';

-- Bosch Martelete GBH 2-20D – 52.729 pts
UPDATE premios_catalogo 
SET pontos_necessarios = 52729 
WHERE nome ILIKE '%GBH 2-20D%' OR nome ILIKE '%Martelete%GBH%';

-- Bosch GSR 6-45TE – 63.647 pts
UPDATE premios_catalogo 
SET pontos_necessarios = 63647 
WHERE nome ILIKE '%GSR 6-45TE%' OR nome ILIKE '%GSR 6-45%';

-- Bosch Serra Circular GKS 20-65 220V – 70.284 pts
UPDATE premios_catalogo 
SET pontos_necessarios = 70284 
WHERE nome ILIKE '%GKS 20-65%' OR nome ILIKE '%Serra Circular%GKS%';

-- Bosch Nível GCL 2-15 – 74.412 pts
UPDATE premios_catalogo 
SET pontos_necessarios = 74412 
WHERE nome ILIKE '%GCL 2-15%' OR nome ILIKE '%Nível%GCL%';

-- Verificar os produtos atualizados
SELECT id, nome, pontos_necessarios, categoria 
FROM premios_catalogo 
WHERE categoria = 'ferramentas' 
ORDER BY pontos_necessarios;
