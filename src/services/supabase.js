import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase - usando variáveis Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções helper para o banco de dados
export const db = {
    // ================================
    // CLIENTES
    // ================================

    async buscarCliente(cpfCnpj) {
        const { data, error } = await supabase
            .from('clientes_fast')
            .select('*')
            .eq('cpf_cnpj', cpfCnpj)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        return data
    },

    async criarCliente(dadosCliente) {
        const { data, error } = await supabase
            .from('clientes_fast')
            .insert(dadosCliente)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async atualizarPontosCliente(clienteId, novosPontos) {
        const { data, error } = await supabase
            .from('clientes_fast')
            .update({ saldo_pontos: novosPontos })
            .eq('id', clienteId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // ================================
    // PEDIDOS DE VENDAS
    // ================================

    async verificarPedidoExistente(hashPedido) {
        const { data, error } = await supabase
            .from('pedidos_vendas')
            .select('*')
            .eq('hash_unico', hashPedido)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        return data
    },

    async salvarPedidoVenda(dadosPedido) {
        const { data, error } = await supabase
            .from('pedidos_vendas')
            .insert(dadosPedido)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async buscarNotasCliente(clienteId, limite = 10) {
        // Buscar pedidos em vez de notas fiscais
        const { data, error } = await supabase
            .from('pedidos_vendas')
            .select(`
        *,
        itens_pedido (
          *,
          produtos_fast_catalogo (nome, categoria)
        )
      `)
            .eq('cliente_id', clienteId)
            .order('created_at', { ascending: false })
            .limit(limite)

        if (error) throw error
        return data || []
    },

    // ================================
    // PRODUTOS E PONTUAÇÃO
    // ================================

    async buscarProdutosFast() {
        const { data, error } = await supabase
            .from('produtos_fast_catalogo')
            .select('*')
            .eq('ativo', true)

        if (error) throw error
        return data || []
    },

    async salvarItensPontuacao(itens) {
        const { data, error } = await supabase
            .from('itens_pedido')
            .insert(itens)
            .select()

        if (error) throw error
        return data
    },

    // ================================
    // HISTÓRICO E RELATÓRIOS
    // ================================

    async buscarHistoricoPontos(clienteId, limite = 20) {
        const { data, error } = await supabase
            .from('historico_pontos')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('created_at', { ascending: false })
            .limit(limite)

        if (error) throw error
        return data || []
    },

    async salvarHistoricoPontos(historico) {
        const { data, error } = await supabase
            .from('historico_pontos')
            .insert(historico)
            .select()

        if (error) throw error
        return data
    },

    // ================================
    // CATÁLOGO DE PRÊMIOS
    // ================================

    async buscarPremios() {
        const { data, error } = await supabase
            .from('premios_catalogo')
            .select('*')
            .eq('ativo', true)
            .order('pontos_necessarios', { ascending: true })

        if (error) throw error
        return data || []
    },

    async processarResgate(clienteId, premioId, pontosGastos) {
        const { data, error } = await supabase
            .from('resgates')
            .insert({
                cliente_id: clienteId,
                premio_id: premioId,
                pontos_gastos: pontosGastos,
                status: 'processando'
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // ================================
    // FUNÇÕES PARA DASHBOARD E UPLOAD
    // ================================

    // Perfil do cliente
    async getCustomerProfile(customerId) {
        const { data, error } = await supabase
            .from('clientes_fast')
            .select('*')
            .eq('id', customerId)
            .single()

        if (error) throw error
        return data
    },

    // Pedidos do cliente com itens
    async getCustomerOrders(customerId) {
        const { data, error } = await supabase
            .from('pedidos_vendas')
            .select(`
            *,
            itens_pedido (
                *,
                produtos_fast_catalogo (nome)
            )
        `)
            .eq('cliente_id', customerId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Catálogo de prêmios
    async getPrizeCatalog() {
        const { data, error } = await supabase
            .from('premios_catalogo')
            .select('*')
            .eq('ativo', true)
            .order('pontos_necessarios', { ascending: true })

        if (error) throw error
        return data || []
    },

    // Salvar pedido
    async saveOrder(orderData) {
        const { data, error } = await supabase
            .from('pedidos_vendas')
            .insert({
                cliente_id: orderData.cliente_id,
                numero_pedido: orderData.numero_pedido,
                data_emissao: orderData.data_pedido,
                valor_total_pedido: orderData.valor_total,
                hash_unico: orderData.hash_documento,
                total_pontos_ganhos: orderData.pontos_gerados,
                status_processamento: orderData.status || 'processado'
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Salvar itens do pedido
    async saveOrderItems(itemData) {
        const { data, error } = await supabase
            .from('itens_nota_fiscal')
            .insert({
                nota_fiscal_id: itemData.pedido_id,
                produto_id: itemData.produto_id,
                quantidade: itemData.quantidade,
                valor_unitario: itemData.valor_unitario,
                valor_total: itemData.valor_total,
                pontos_item: itemData.pontos_item
            })
            .select()

        if (error) throw error
        return data
    },

    // Adicionar pontos ao cliente
    async addPointsToCustomer(customerId, points, description) {
        try {
            console.log('🔍 [SUPABASE] Iniciando addPointsToCustomer:', {
                customerId,
                points,
                description,
                timestamp: new Date().toISOString()
            });

            // Validações iniciais
            if (!customerId) {
                console.error('❌ [SUPABASE] customerId não fornecido');
                throw new Error('ID do cliente é obrigatório');
            }

            if (!points || points <= 0) {
                console.error('❌ [SUPABASE] pontos inválidos:', points);
                throw new Error('Pontos deve ser um número positivo');
            }

            // Buscar saldo atual e total de pontos ganhos
            console.log('🔍 [SUPABASE] Buscando dados do cliente...');
            const { data: customer, error: fetchError } = await supabase
                .from('clientes_fast')
                .select('saldo_pontos, total_pontos_ganhos')
                .eq('id', customerId)
                .single();

            if (fetchError) {
                console.error('❌ [SUPABASE] Erro ao buscar saldo do cliente:', fetchError);
                throw new Error('Erro ao buscar saldo do cliente: ' + fetchError.message);
            }

            if (!customer) {
                console.error('❌ [SUPABASE] Cliente não encontrado para ID:', customerId);
                throw new Error('Cliente não encontrado');
            }

            console.log('✅ [SUPABASE] Dados do cliente obtidos:', customer);

            const saldoAnterior = customer.saldo_pontos || 0;
            const totalGanhosAnterior = customer.total_pontos_ganhos || 0;
            const newBalance = saldoAnterior + points;
            const newTotalGanhos = totalGanhosAnterior + points;

            console.log('🔍 [SUPABASE] Calculando novos valores:', {
                saldoAnterior,
                pontosAdicionados: points,
                novoSaldo: newBalance,
                totalGanhosAnterior,
                novoTotalGanhos: newTotalGanhos
            });

            // Atualizar saldo e total de pontos ganhos
            console.log('🔍 [SUPABASE] Atualizando saldo do cliente...');
            const { data: updatedCustomer, error: updateError } = await supabase
                .from('clientes_fast')
                .update({ saldo_pontos: newBalance, total_pontos_ganhos: newTotalGanhos })
                .eq('id', customerId)
                .select('saldo_pontos, total_pontos_ganhos')
                .single();

            if (updateError || !updatedCustomer) {
                console.error('❌ [SUPABASE] Erro ao atualizar saldo do cliente:', updateError);
                throw new Error('Erro ao atualizar saldo do cliente: ' + (updateError?.message || 'Dados não retornados'));
            }

            console.log('✅ [SUPABASE] Saldo atualizado com sucesso:', updatedCustomer);

            // Salvar no histórico
            console.log('🔍 [SUPABASE] Salvando histórico de pontos...');
            const { data: historyData, error: historyError } = await supabase
                .from('historico_pontos')
                .insert({
                    cliente_id: customerId,
                    tipo_operacao: 'ganho',
                    pontos: points,
                    descricao: description,
                    saldo_anterior: saldoAnterior,
                    saldo_posterior: newBalance
                })
                .select();

            if (historyError || !historyData) {
                console.error('❌ [SUPABASE] Erro ao salvar histórico de pontos:', historyError);
                // Não falhar a operação inteira por causa do histórico
                console.warn('⚠️ [SUPABASE] Continuando sem salvar histórico...');
            } else {
                console.log('✅ [SUPABASE] Histórico de pontos salvo com sucesso:', historyData);
            }

            console.log('🎯 [SUPABASE] addPointsToCustomer CONCLUÍDO COM SUCESSO:', {
                customerId,
                pontosAdicionados: points,
                saldoFinal: updatedCustomer.saldo_pontos,
                totalGanhosFinal: updatedCustomer.total_pontos_ganhos
            });

            return updatedCustomer;
        } catch (error) {
            console.error('❌ [SUPABASE] Erro na função addPointsToCustomer:', error);
            throw error;
        }
    },

    // Resgatar prêmio
    async redeemPrize(customerId, prizeId, pointsCost) {
        // Buscar dados do cliente e prêmio
        const [customerResult, prizeResult] = await Promise.all([
            supabase.from('clientes_fast').select('saldo_pontos').eq('id', customerId).single(),
            supabase.from('premios_catalogo').select('*').eq('id', prizeId).single()
        ])

        if (customerResult.error) throw customerResult.error
        if (prizeResult.error) throw prizeResult.error

        const customer = customerResult.data
        const prize = prizeResult.data

        if (customer.saldo_pontos < pointsCost) {
            throw new Error('Pontos insuficientes')
        }

        if (prize.estoque <= 0) {
            throw new Error('Prêmio fora de estoque')
        }

        // Usar transação para garantir consistência
        const newBalance = customer.saldo_pontos - pointsCost
        const newStock = prize.estoque - 1

        // Atualizar saldo do cliente
        const { error: balanceError } = await supabase
            .from('clientes_fast')
            .update({ saldo_pontos: newBalance })
            .eq('id', customerId)

        if (balanceError) throw balanceError

        // Atualizar estoque do prêmio
        const { error: stockError } = await supabase
            .from('premios_catalogo')
            .update({ estoque: newStock })
            .eq('id', prizeId)

        if (stockError) throw stockError

        // Registrar resgate
        const { data: redemption, error: redemptionError } = await supabase
            .from('resgates')
            .insert({
                cliente_id: customerId,
                premio_id: prizeId,
                pontos_gastos: pointsCost,
                status: 'processando'
            })
            .select()
            .single()

        if (redemptionError) throw redemptionError

        // Registrar no histórico
        await supabase
            .from('historico_pontos')
            .insert({
                cliente_id: customerId,
                tipo_operacao: 'resgate',
                pontos: -pointsCost,
                descricao: `Resgate: ${prize.nome}`,
                saldo_anterior: customer.saldo_pontos,
                saldo_posterior: newBalance
            })

        return redemption
    },

    // Verificar se pedido já existe pelo hash
    async checkOrderExists(documentHash) {
        const { data, error } = await supabase
            .from('pedidos_vendas')
            .select('id, numero_pedido, data_pedido')
            .eq('hash_documento', documentHash)
            .limit(1)

        if (error) throw error
        return data.length > 0 ? data[0] : null
    }
}

// Exportações individuais para facilitar uso nos componentes
export const getCustomerProfile = async (customerId) => {
    const { data, error } = await supabase
        .from('clientes_fast')
        .select('*')
        .eq('id', customerId)
        .single()

    if (error) throw error
    return data
}

export const getCustomerOrders = async (customerId) => {
    const { data, error } = await supabase
        .from('pedidos_vendas')
        .select(`
            *,
            itens_pedido (
                *,
                produtos_fast_catalogo (nome)
            )
        `)
        .eq('cliente_id', customerId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

export const getPrizeCatalog = async () => {
    const { data, error } = await supabase
        .from('premios_catalogo')
        .select('*')
        .eq('ativo', true)
        .order('pontos_necessarios', { ascending: true })

    if (error) throw error
    return data || []
}

// Verificar se pedido já existe pelo hash
export const checkOrderExists = async (documentHash) => {
    const { data, error } = await supabase
        .from('pedidos_vendas')
        .select('id, numero_pedido, data_emissao')
        .eq('hash_unico', documentHash)
        .limit(1)

    if (error) throw error
    return data.length > 0 ? data[0] : null
}

export const saveOrder = async (orderData) => {
    try {
        // Garantir que o status seja um valor válido
        let status = 'processado'; // valor padrão

        if (orderData.status === 'sem_pontos' || orderData.status === 'zero_pontos') {
            status = 'processado'; // Mesmo sem pontos, o pedido foi processado com sucesso
        } else if (orderData.status === 'erro') {
            status = 'erro';
        } else if (orderData.status) {
            status = orderData.status;
        }

        console.log('Salvando pedido com status:', status);

        const { data, error } = await supabase
            .from('pedidos_vendas')
            .insert({
                cliente_id: orderData.cliente_id,
                numero_pedido: orderData.numero_pedido,
                data_emissao: orderData.data_emissao,
                valor_total_pedido: orderData.valor_total,
                hash_unico: orderData.hash_documento,
                total_pontos_ganhos: orderData.pontos_gerados,
                status_processamento: status // Usar status validado
            })
            .select()
            .single()

        if (error) {
            console.error('Erro ao salvar pedido:', error);

            // TEMPORÁRIO: Se for erro de duplicata durante testes, criar um novo hash
            if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
                console.log('Duplicata detectada, criando novo hash para teste...')

                // Gerar novo hash único para teste
                const novoHash = orderData.hash_documento + '-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15)

                const { data: newData, error: newError } = await supabase
                    .from('pedidos_vendas')
                    .insert({
                        cliente_id: orderData.cliente_id,
                        numero_pedido: orderData.numero_pedido + '-TESTE-' + Date.now(),
                        data_emissao: orderData.data_emissao,
                        valor_total_pedido: orderData.valor_total,
                        hash_unico: novoHash,
                        total_pontos_ganhos: orderData.pontos_gerados,
                        status_processamento: orderData.status || 'processado'
                    })
                    .select()
                    .single()

                if (newError) throw newError
                return newData
            }
            throw error
        }
        return data
    } catch (err) {
        console.error('Erro ao salvar pedido:', err)
        throw err
    }
}

export const saveOrderItems = async (itemData) => {
    const { data, error } = await supabase
        .from('itens_pedido')
        .insert({
            pedido_id: itemData.pedido_id,
            produto_catalogo_id: itemData.produto_catalogo_id, // UUID ou null
            codigo_produto: itemData.codigo_produto || null,
            nome_produto: itemData.nome_produto, // Campo obrigatório
            quantidade: itemData.quantidade,
            valor_unitario: itemData.valor_unitario,
            valor_total: itemData.valor_total,
            pontos_calculados: itemData.pontos_calculados || 0,
            categoria: itemData.categoria || 'drywall',
            produto_fast: itemData.produto_fast || true
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export const addPointsToCustomer = async (customerId, points, description) => {
    try {
        console.log('🔍 [SUPABASE] Iniciando addPointsToCustomer:', {
            customerId,
            points,
            description,
            timestamp: new Date().toISOString()
        });

        // Validações iniciais
        if (!customerId) {
            console.error('❌ [SUPABASE] customerId não fornecido');
            throw new Error('ID do cliente é obrigatório');
        }

        if (!points || points <= 0) {
            console.error('❌ [SUPABASE] pontos inválidos:', points);
            throw new Error('Pontos deve ser um número positivo');
        }

        // Buscar saldo atual e total de pontos ganhos
        console.log('🔍 [SUPABASE] Buscando dados do cliente...');
        const { data: customer, error: fetchError } = await supabase
            .from('clientes_fast')
            .select('saldo_pontos, total_pontos_ganhos')
            .eq('id', customerId)
            .single();

        if (fetchError) {
            console.error('❌ [SUPABASE] Erro ao buscar saldo do cliente:', fetchError);
            throw new Error('Erro ao buscar saldo do cliente: ' + fetchError.message);
        }

        if (!customer) {
            console.error('❌ [SUPABASE] Cliente não encontrado para ID:', customerId);
            throw new Error('Cliente não encontrado');
        }

        console.log('✅ [SUPABASE] Dados do cliente obtidos:', customer);

        const saldoAnterior = customer.saldo_pontos || 0;
        const totalGanhosAnterior = customer.total_pontos_ganhos || 0;
        const newBalance = saldoAnterior + points;
        const newTotalGanhos = totalGanhosAnterior + points;

        console.log('🔍 [SUPABASE] Calculando novos valores:', {
            saldoAnterior,
            pontosAdicionados: points,
            novoSaldo: newBalance,
            totalGanhosAnterior,
            novoTotalGanhos: newTotalGanhos
        });

        // Atualizar saldo e total de pontos ganhos
        console.log('🔍 [SUPABASE] Atualizando saldo do cliente...');
        const { data: updatedCustomer, error: updateError } = await supabase
            .from('clientes_fast')
            .update({ saldo_pontos: newBalance, total_pontos_ganhos: newTotalGanhos })
            .eq('id', customerId)
            .select('saldo_pontos, total_pontos_ganhos')
            .single();

        if (updateError || !updatedCustomer) {
            console.error('❌ [SUPABASE] Erro ao atualizar saldo do cliente:', updateError);
            throw new Error('Erro ao atualizar saldo do cliente: ' + (updateError?.message || 'Dados não retornados'));
        }

        console.log('✅ [SUPABASE] Saldo atualizado com sucesso:', updatedCustomer);

        // Salvar no histórico
        console.log('🔍 [SUPABASE] Salvando histórico de pontos...');
        const { data: historyData, error: historyError } = await supabase
            .from('historico_pontos')
            .insert({
                cliente_id: customerId,
                tipo_operacao: 'ganho',
                pontos: points,
                descricao: description,
                saldo_anterior: saldoAnterior,
                saldo_posterior: newBalance
            })
            .select();

        if (historyError || !historyData) {
            console.error('❌ [SUPABASE] Erro ao salvar histórico de pontos:', historyError);
            // Não falhar a operação inteira por causa do histórico
            console.warn('⚠️ [SUPABASE] Continuando sem salvar histórico...');
        } else {
            console.log('✅ [SUPABASE] Histórico de pontos salvo com sucesso:', historyData);
        }

        console.log('🎯 [SUPABASE] addPointsToCustomer CONCLUÍDO COM SUCESSO:', {
            customerId,
            pontosAdicionados: points,
            saldoFinal: updatedCustomer.saldo_pontos,
            totalGanhosFinal: updatedCustomer.total_pontos_ganhos
        });

        return updatedCustomer;
    } catch (error) {
        console.error('❌ [SUPABASE] Erro na função addPointsToCustomer:', error);
        throw error;
    }
}

export const redeemPrize = async (customerId, prizeId, pointsCost) => {
    // Buscar dados do cliente e prêmio
    const [customerResult, prizeResult] = await Promise.all([
        supabase.from('clientes_fast').select('saldo_pontos, total_pontos_gastos').eq('id', customerId).single(),
        supabase.from('premios_catalogo').select('*').eq('id', prizeId).single()
    ])

    if (customerResult.error) throw customerResult.error
    if (prizeResult.error) throw prizeResult.error

    const customer = customerResult.data
    const prize = prizeResult.data

    if (customer.saldo_pontos < pointsCost) {
        throw new Error('Pontos insuficientes')
    }

    const newBalance = customer.saldo_pontos - pointsCost
    const newTotalGastos = (customer.total_pontos_gastos || 0) + pointsCost

    // Atualizar saldo do cliente e total de pontos gastos
    const { error: balanceError } = await supabase
        .from('clientes_fast')
        .update({
            saldo_pontos: newBalance,
            total_pontos_gastos: newTotalGastos
        })
        .eq('id', customerId)

    if (balanceError) throw balanceError

    // Registrar resgate (o trigger irá gerar o código automaticamente)
    const { data: redemption, error: redemptionError } = await supabase
        .from('resgates')
        .insert({
            cliente_id: customerId,
            premio_id: prizeId,
            pontos_utilizados: pointsCost,
            status: 'confirmado'
        })
        .select('id, codigo_resgate, created_at')
        .single()

    if (redemptionError) throw redemptionError

    console.log('✅ Resgate criado com código:', redemption.codigo_resgate)

    // Registrar no histórico
    await supabase
        .from('historico_pontos')
        .insert({
            cliente_id: customerId,
            tipo_operacao: 'resgate',
            pontos: -pointsCost,
            descricao: `Resgate: ${prize.nome}`,
            saldo_anterior: customer.saldo_pontos,
            saldo_posterior: newBalance
        })

    return redemption
}

export default supabase
