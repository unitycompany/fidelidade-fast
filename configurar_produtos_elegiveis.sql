-- Script para configurar apenas os 6 produtos elegíveis corretos
-- Execute este script no Supabase

-- Primeiro, limpar todos os produtos existentes
DELETE FROM produtos_elegiveis;

-- Inserir apenas os 6 produtos especificados
INSERT INTO produtos_elegiveis (nome, codigo, categoria, pontos_por_real, ativo, created_at, updated_at) VALUES
('Placa ST', 'PLACA-ST', 'drywall', 0.5, true, now(), now()),
('Placa RU', 'PLACA-RU', 'drywall', 1.0, true, now(), now()),
('Placa Glasroc X', 'PLACA-GLASROC-X', 'glasroc', 2.0, true, now(), now()),
('Placomix', 'PLACOMIX', 'acabamento', 1.0, true, now(), now()),
('Malha telada para Glasroc X', 'MALHA-GLASROC-X', 'glasroc', 2.0, true, now(), now()),
('Basecoat (massa para Glasroc X)', 'BASECOAT-GLASROC-X', 'glasroc', 2.0, true, now(), now());

-- Verificar os dados inseridos
SELECT 
  id,
  nome,
  codigo,
  categoria,
  pontos_por_real,
  ativo,
  CONCAT(pontos_por_real, ' ponto', CASE WHEN pontos_por_real != 1 THEN 's' ELSE '' END, ' por R$ 1,00') as descricao_pontos
FROM produtos_elegiveis 
ORDER BY categoria, nome;
