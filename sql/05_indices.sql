-- ====================================
-- PARTE 5: ÍNDICES E OTIMIZAÇÕES
-- ====================================

-- Índices para performance

-- Clientes
CREATE INDEX idx_clientes_cpf_cnpj ON clientes_fast(cpf_cnpj);
CREATE INDEX idx_clientes_status ON clientes_fast(status);
CREATE INDEX idx_clientes_pontos ON clientes_fast(saldo_pontos);

-- Pedidos
CREATE INDEX idx_pedidos_numero ON pedidos_vendas(numero_pedido);
CREATE INDEX idx_pedidos_data ON pedidos_vendas(data_emissao);
CREATE INDEX idx_pedidos_cliente ON pedidos_vendas(cliente_id);
CREATE INDEX idx_pedidos_hash ON pedidos_vendas(hash_unico);
CREATE INDEX idx_pedidos_status ON pedidos_vendas(status_processamento);

-- Itens
CREATE INDEX idx_itens_pedido ON itens_pedido(pedido_id);
CREATE INDEX idx_itens_produto ON itens_pedido(produto_catalogo_id);
CREATE INDEX idx_itens_fast ON itens_pedido(produto_fast);

-- Histórico
CREATE INDEX idx_historico_cliente ON historico_pontos(cliente_id);
CREATE INDEX idx_historico_data ON historico_pontos(created_at);
CREATE INDEX idx_historico_tipo ON historico_pontos(tipo_operacao);

-- Produtos
CREATE INDEX idx_produtos_codigo ON produtos_fast_catalogo(codigo);
CREATE INDEX idx_produtos_categoria ON produtos_fast_catalogo(categoria);
CREATE INDEX idx_produtos_ativo ON produtos_fast_catalogo(ativo);
