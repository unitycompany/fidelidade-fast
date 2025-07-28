-- Script para configurar apenas os 7 prêmios especificados
-- Execute este script no Supabase

-- Primeiro, limpar todos os prêmios existentes
DELETE FROM premios_catalogo;

-- Inserir apenas os 7 prêmios especificados
INSERT INTO premios_catalogo (
  nome, 
  descricao, 
  categoria, 
  pontos_necessarios, 
  valor_estimado, 
  estoque_disponivel, 
  estoque_ilimitado, 
  ativo, 
  destaque, 
  ordem_exibicao,
  created_at, 
  updated_at
) VALUES
('Nível Laser', 'Nível laser profissional de alta precisão para obras e acabamentos', 'ferramentas', 10000, 500.00, 5, false, true, true, 1, now(), now()),
('Parafusadeira', 'Parafusadeira profissional com bateria de longa duração', 'ferramentas', 5000, 300.00, 10, false, true, false, 2, now(), now()),
('Trena Digital', 'Trena digital com display LCD e precisão milimétrica', 'ferramentas', 3000, 200.00, 15, false, true, false, 3, now(), now()),
('Kit Brocas SDS (5 unid.)', 'Kit com 5 brocas SDS para furadeiras profissionais', 'ferramentas', 1500, 80.00, 20, false, true, false, 4, now(), now()),
('Vale-compras em produtos Fast', 'Vale-compras de R$ 100 para usar em qualquer produto Fast', 'vale_compras', 2000, 100.00, 0, true, true, false, 5, now(), now()),
('Camiseta personalizada Fast', 'Camiseta 100% algodão com logo Fast Sistemas', 'brindes', 1000, 50.00, 50, false, true, false, 6, now(), now()),
('Boné Fast', 'Boné com logo Fast Sistemas - modelo snap back', 'brindes', 800, 40.00, 30, false, true, false, 7, now(), now());

-- Verificar os dados inseridos
SELECT 
  id,
  nome,
  categoria,
  pontos_necessarios,
  CONCAT('R$ ', CAST(valor_estimado AS DECIMAL(10,2))) as valor_estimado,
  ativo,
  destaque,
  ordem_exibicao
FROM premios_catalogo 
ORDER BY ordem_exibicao;
