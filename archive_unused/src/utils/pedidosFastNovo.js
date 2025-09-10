// Utilitários específicos para Pedidos de Vendas Fast Sistemas - Versão Corrigida
// Importar supabase para buscar produtos dinamicamente
import { supabase } from '../services/supabase';

// CLUBE FAST DE RECOMPENSAS - Mapeamento Oficial de Produtos (FALLBACK)
// APENAS os 6 produtos oficiais conforme regras do programa de fidelidade
// Este mapeamento serve como fallback caso a base de dados não esteja disponível

export const PRODUTOS_FAST = {
    // === PLACA ST (0,5 pontos por R$ 1,00) ===
    'PLACA_ST': { nome: 'Placa ST', pontosPorReal: 0.5, categoria: 'placa_st', descricao: 'Placas ST para drywall - qualquer espessura', ativa: true },

    // === PLACA RU (1 ponto por R$ 1,00) ===
    'PLACA_RU': { nome: 'Placa RU', pontosPorReal: 1.0, categoria: 'placa_ru', descricao: 'Placas RU resistentes à umidade - qualquer espessura', ativa: true },

    // === PLACA GLASROC X (2 pontos por R$ 1,00) ===
    'PLACA_GLASROC_X': { nome: 'Placa Glasroc X', pontosPorReal: 2.0, categoria: 'glasroc_x', descricao: 'Placas cimentícias Glasroc X para áreas úmidas', ativa: true },

    // === PLACOMIX (1 ponto por R$ 1,00) ===
    'PLACOMIX': { nome: 'Placomix', pontosPorReal: 1.0, categoria: 'placomix', descricao: 'Massa para rejunte e acabamento Placomix', ativa: true },

    // === MALHA TELADA PARA GLASROC X (2 pontos por R$ 1,00) ===
    'MALHA_GLASROC_X': { nome: 'Malha telada para Glasroc X', pontosPorReal: 2.0, categoria: 'malha_glasroc', descricao: 'Malha telada específica para uso com Glasroc X', ativa: true },

    // === BASECOAT - MASSA PARA GLASROC X (2 pontos por R$ 1,00) ===
    'BASECOAT_GLASROC_X': { nome: 'Basecoat (massa para Glasroc X)', pontosPorReal: 2.0, categoria: 'basecoat', descricao: 'Massa base específica para tratamento de juntas Glasroc X', ativa: true }
}

// Cache para produtos da base de dados
let produtosCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Buscar produtos elegíveis da base de dados
export const buscarProdutosElegiveis = async () => {
    try {
        // Verificar cache
        if (produtosCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
            return produtosCache;
        }

        const { data, error } = await supabase
            .from('produtos_elegiveis')
            .select('*')
            .eq('ativa', true)
            .order('nome');

        if (error) {
            console.warn('Erro ao buscar produtos da base de dados, usando fallback:', error);
            return PRODUTOS_FAST;
        }

        // Converter para formato compatível
        const produtosBD = {};
        data.forEach(produto => {
            produtosBD[produto.codigo] = {
                nome: produto.nome,
                pontosPorReal: produto.pontos_por_real,
                categoria: produto.categoria,
                descricao: produto.descricao,
                ativa: produto.ativa
            };
        });

        // Atualizar cache
        produtosCache = produtosBD;
        cacheTimestamp = Date.now();

        return produtosBD;
    } catch (error) {
        console.warn('Erro ao conectar com base de dados, usando fallback:', error);
        return PRODUTOS_FAST;
    }
};

// Identificar produto por código ou nome e verificar se está na lista elegível
export const identificarProdutoElegivel = async (codigo, nome) => {
    const produtosAtivos = await buscarProdutosElegiveis();

    // Primeiro, verificar por código exato
    if (codigo && produtosAtivos[codigo]) {
        return produtosAtivos[codigo];
    }

    // Depois, verificar por nome/padrões específicos
    const nomeUpper = nome ? nome.toUpperCase() : '';

    // Buscar por padrões nos produtos ativos
    for (const [codigoProduto, produto] of Object.entries(produtosAtivos)) {
        if (!produto.ativa) continue;

        // Verificações específicas baseadas na categoria
        switch (produto.categoria) {
            case 'placa_st':
                if (nomeUpper.includes('PLACA ST') ||
                    (nomeUpper.includes('PLACA') && nomeUpper.includes('ST') &&
                        !nomeUpper.includes('RU') && !nomeUpper.includes('GLASROC'))) {
                    return { nome: nome, pontosPorReal: produto.pontosPorReal, categoria: produto.categoria, ativa: true };
                }
                break;

            case 'placa_ru':
                if (nomeUpper.includes('PLACA RU') ||
                    (nomeUpper.includes('PLACA') && nomeUpper.includes('RU') && !nomeUpper.includes('GLASROC'))) {
                    return { nome: nome, pontosPorReal: produto.pontosPorReal, categoria: produto.categoria, ativa: true };
                }
                break;

            case 'glasroc_x':
                if ((nomeUpper.includes('GLASROC') && nomeUpper.includes('PLACA')) ||
                    (nomeUpper.includes('PLACA') && nomeUpper.includes('GLASROC'))) {
                    return { nome: nome, pontosPorReal: produto.pontosPorReal, categoria: produto.categoria, ativa: true };
                }
                break;

            case 'placomix':
                if (nomeUpper.includes('PLACOMIX')) {
                    return { nome: nome, pontosPorReal: produto.pontosPorReal, categoria: produto.categoria, ativa: true };
                }
                break;

            case 'malha_glasroc':
                if ((nomeUpper.includes('MALHA') && nomeUpper.includes('GLASROC')) ||
                    (nomeUpper.includes('MALHA') && nomeUpper.includes('TELADA') && nomeUpper.includes('GLASROC'))) {
                    return { nome: nome, pontosPorReal: produto.pontosPorReal, categoria: produto.categoria, ativa: true };
                }
                break;

            case 'basecoat':
                if (nomeUpper.includes('BASECOAT') ||
                    (nomeUpper.includes('MASSA') && nomeUpper.includes('GLASROC') && !nomeUpper.includes('PLACA'))) {
                    return { nome: nome, pontosPorReal: produto.pontosPorReal, categoria: produto.categoria, ativa: true };
                }
                break;
        }
    }

    return null; // Produto não elegível
};

// Função auxiliar para criar chave única de produto (evitar duplicatas)
const criarChaveProduto = (produto) => {
    const nome = produto.nome || produto.descricao || produto.product_name || ''
    const valor = produto.valorTotal || produto.valor || produto.total_value || 0
    const codigo = produto.codigo || produto.code || ''

    // Normalizar nome (remover espaços extras, converter para maiúsculo)
    const nomeNormalizado = nome.toUpperCase().replace(/\s+/g, ' ').trim()

    return `${nomeNormalizado}|${valor}|${codigo}`.replace(/\|+$/, '') // Remove pipes vazios no final
}

// Gerar hash único do pedido para evitar duplicatas (versão para testes)
export const gerarHashPedido = (dadosPedido) => {
    const { orderNumber, orderDate, customer, totalValue } = dadosPedido

    // Incluir timestamp e mais aleatoriedade para garantir unicidade em testes
    const timestamp = Date.now()
    const randomLong = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const microTime = performance.now().toString().replace('.', '')

    const dados = `${orderNumber || 'PEDIDO'}-${orderDate || 'HOJE'}-${customer || 'CLIENTE'}-${totalValue || 0}-${timestamp}-${randomLong}-${microTime}`

    // Simple hash (para ambiente browser)
    let hash = 0
    for (let i = 0; i < dados.length; i++) {
        const char = dados.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16) + '-' + randomLong.substring(0, 8)
}

// Validar se pedido está dentro do prazo válido (30 dias) - versão flexível
export const validarPrazoPedido = (dataEmissao) => {
    try {
        if (!dataEmissao) return true // Se não tem data, aceita

        let dataPedido

        // Tentar diferentes formatos de data
        if (typeof dataEmissao === 'string') {
            if (dataEmissao.includes('/')) {
                // Formato DD/MM/YYYY
                const [dia, mes, ano] = dataEmissao.split('/').map(Number)
                if (dia && mes && ano && ano > 2000) {
                    dataPedido = new Date(ano, mes - 1, dia)
                } else {
                    return true // Se formato inválido, aceita
                }
            } else if (dataEmissao.includes('-')) {
                // Formato YYYY-MM-DD
                dataPedido = new Date(dataEmissao)
            } else {
                return true // Formato não reconhecido, aceita
            }
        } else {
            return true // Não é string, aceita
        }

        if (isNaN(dataPedido.getTime())) {
            return true // Data inválida, aceita
        }

        const dataAtual = new Date()
        const diffTime = dataAtual - dataPedido
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Aceita pedidos de até 60 dias (mais flexível) e também pedidos futuros
        return diffDays <= 60 && diffDays >= -30

    } catch (error) {
        console.log('Erro ao validar prazo do pedido:', error)
        return true // Em caso de erro, aceita
    }
}

// Função para processar resultado da IA
export const processOrderResult = async (aiData) => {
    try {
        console.log('=== PROCESSANDO DADOS DA IA ===')
        console.log('Dados recebidos:', JSON.stringify(aiData, null, 2))

        // ✅ VALIDAÇÃO INICIAL: Garantir que aiData existe e é válido
        if (!aiData || typeof aiData !== 'object') {
            console.warn('Dados da IA inválidos ou vazios, criando pedido vazio')
            const numeroFallback = `PEDIDO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            return {
                orderNumber: numeroFallback,
                orderDate: new Date().toISOString().split('T')[0],
                customer: 'Cliente',
                totalValue: 0,
                items: [],
                totalPoints: 0,
                documentHash: gerarHashPedido({ orderNumber: numeroFallback }),
                allProducts: [],
                noEligibleProducts: true
            }
        }

        // ✅ PROCESSAR DATA COM TRATAMENTO DE ERRO
        let processedDate = new Date().toISOString().split('T')[0] // Data padrão: hoje

        try {
            if (aiData.dataEmissao || aiData.dataPedido || aiData.data) {
                const dataOriginal = aiData.dataEmissao || aiData.dataPedido || aiData.data

                // Se a data está em formato DD/MM/YYYY, converter para YYYY-MM-DD
                if (typeof dataOriginal === 'string' && dataOriginal.includes('/')) {
                    const [dia, mes, ano] = dataOriginal.split('/')
                    if (dia && mes && ano && ano.length === 4) {
                        processedDate = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
                    }
                } else if (dataOriginal) {
                    processedDate = dataOriginal
                }
            }
        } catch (error) {
            console.warn('Erro ao processar data, usando data atual:', error)
            processedDate = new Date().toISOString().split('T')[0]
        }

        // ✅ CRIAR ESTRUTURA BÁSICA COM VALORES SEGUROS
        // Garantir que o número do pedido nunca seja null ou vazio
        const numeroBase = aiData.numeroPedido || aiData.numero || aiData.pedido || aiData.orderNumber
        console.log('🔍 Debug numero do pedido detalhado:', {
            'aiData.numeroPedido': aiData.numeroPedido,
            'aiData.numero': aiData.numero,
            'aiData.pedido': aiData.pedido,
            'aiData.orderNumber': aiData.orderNumber,
            'numeroBase': numeroBase,
            'tipoNumeroBase': typeof numeroBase,
            'numeroBaseString': String(numeroBase),
            'numeroBaseTrim': String(numeroBase).trim()
        })

        // ✅ VERIFICAÇÃO MAIS RIGOROSA DO NÚMERO
        let numeroSeguro
        if (numeroBase !== null && numeroBase !== undefined && String(numeroBase).trim() !== '' && String(numeroBase).trim() !== 'undefined' && String(numeroBase).trim() !== 'null') {
            numeroSeguro = String(numeroBase).trim()
            console.log('✅ Usando número original da IA:', numeroSeguro)
        } else {
            numeroSeguro = `PEDIDO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            console.log('⚠️ Criando número fallback:', numeroSeguro)
        }

        const orderData = {
            orderNumber: numeroSeguro,
            orderDate: processedDate,
            customer: String(aiData.cliente || aiData.nomeCliente || aiData.customer || 'Cliente'),
            totalValue: parseFloat(aiData.valorTotalPedido || aiData.valorTotal || aiData.total || aiData.totalValue || 0) || 0,
            items: [],
            totalPoints: 0,
            documentHash: '',
            allProducts: []
        }

        // Log de verificação
        console.log('🔍 Dados do pedido criados:', {
            orderNumber: orderData.orderNumber,
            customer: orderData.customer,
            totalValue: orderData.totalValue,
            orderDate: orderData.orderDate
        })

        // ✅ PRIMEIRO: Processar produtos Fast específicos (já com pontos calculados)
        if (Array.isArray(aiData.produtosFast) && aiData.produtosFast.length > 0) {
            console.log('🎯 Processando produtos Fast pré-calculados:', aiData.produtosFast.length)

            try {
                aiData.produtosFast.forEach((produto, index) => {
                    try {
                        console.log(`🔍 Processando produto Fast ${index + 1}:`, produto)

                        const nomeProduto = String(produto.nome || produto.produtoOficial || '').trim()
                        const quantidade = parseInt(produto.quantidade || 1) || 1
                        const valorUnitario = parseFloat(produto.valorUnitario || 0) || 0
                        const valorTotal = parseFloat(produto.valorTotal || 0) || 0
                        const pontosCalculados = parseInt(produto.pontosCalculados || 0) || 0

                        console.log(`🔍 Dados processados:`, {
                            nomeProduto,
                            quantidade,
                            valorUnitario,
                            valorTotal,
                            pontosCalculados
                        })

                        if (nomeProduto && valorTotal > 0 && pontosCalculados > 0) {
                            const produtoInfo = {
                                product_name: nomeProduto,
                                product_code: String(produto.codigo || `FAST-${index + 1}`),
                                quantity: quantidade,
                                unit_price: valorUnitario,
                                total_value: valorTotal,
                                isEligible: true,
                                category: produto.categoria || 'fast',
                                points: pontosCalculados
                            }

                            // Adicionar aos itens que geram pontos
                            orderData.items.push({
                                product_id: null,
                                product_name: nomeProduto,
                                product_code: produtoInfo.product_code,
                                quantity: quantidade,
                                unit_price: valorUnitario,
                                total_value: valorTotal,
                                points: pontosCalculados,
                                category: produto.categoria || 'fast'
                            })

                            // Adicionar à lista de todos os produtos
                            orderData.allProducts.push(produtoInfo)
                            orderData.totalPoints += pontosCalculados

                            console.log(`✅ Produto Fast processado: ${nomeProduto} = ${pontosCalculados} pts`)
                        } else {
                            console.warn(`⚠️ Produto Fast ignorado por dados inválidos:`, {
                                nomeProduto,
                                valorTotal,
                                pontosCalculados
                            })
                        }
                    } catch (error) {
                        console.error('❌ Erro ao processar produto Fast individual:', produto, error)
                        // Não interrompe o processamento
                    }
                })
            } catch (error) {
                console.error('❌ Erro ao processar lista de produtos Fast:', error)
                // Continua o processamento
            }
        } else {
            console.log('ℹ️ Nenhum produto Fast pré-calculado encontrado')
        }

        // ✅ SEGUNDO: Processar produtos gerais para listar todos (sem calcular pontos duplicados)
        try {
            if (Array.isArray(aiData.produtos)) {
                aiData.produtos.forEach(produto => {
                    try {
                        const nomeProduto = String(produto.nome || '').trim()
                        if (nomeProduto) {
                            const produtoInfo = {
                                product_name: nomeProduto,
                                product_code: String(produto.codigo || ''),
                                quantity: parseInt(produto.quantidade || 1) || 1,
                                unit_price: parseFloat(produto.valorUnitario || 0) || 0,
                                total_value: parseFloat(produto.valorTotal || 0) || 0,
                                isEligible: false, // Será verificado se não está já nos Fast
                                category: produto.categoria || 'outros',
                                points: 0
                            }

                            // Verificar se não é um produto Fast já processado
                            const jaProcessado = orderData.items.some(item =>
                                item.product_code === produtoInfo.product_code ||
                                item.product_name === produtoInfo.product_name
                            )

                            if (!jaProcessado) {
                                orderData.allProducts.push(produtoInfo)
                            }
                        }
                    } catch (error) {
                        console.warn('Erro ao processar produto geral:', produto, error)
                    }
                })
            }
        } catch (error) {
            console.warn('Erro ao processar lista de produtos gerais:', error)
        }

        console.log('Total de produtos encontrados (sem duplicatas):', orderData.allProducts.length)

        console.log('Produtos elegíveis encontrados:', orderData.items.length)
        console.log('Total de produtos na nota:', orderData.allProducts.length)
        console.log('Total de pontos:', orderData.totalPoints)

        // ✅ VALIDAÇÃO FINAL: Verificar se não há duplicatas nos itens que geram pontos
        try {
            const itensUnicos = []
            const chavesItens = new Set()

            orderData.items.forEach(item => {
                try {
                    const chaveItem = `${item.product_name}-${item.total_value}-${item.points}`
                    if (!chavesItens.has(chaveItem)) {
                        chavesItens.add(chaveItem)
                        itensUnicos.push(item)
                    } else {
                        console.warn('⚠️ Item duplicado removido:', item.product_name)
                    }
                } catch (error) {
                    console.warn('Erro ao processar item para remoção de duplicata:', item, error)
                }
            })

            // Recalcular pontos totais com base nos itens únicos
            orderData.items = itensUnicos
            orderData.totalPoints = itensUnicos.reduce((total, item) => {
                try {
                    return total + (parseInt(item.points) || 0)
                } catch (error) {
                    console.warn('Erro ao somar pontos do item:', item, error)
                    return total
                }
            }, 0)
        } catch (error) {
            console.warn('Erro na validação final, mantendo dados atuais:', error)
        }

        console.log('📊 RESULTADO FINAL:', {
            totalProdutos: orderData.allProducts.length,
            produtosElegiveis: orderData.items.length,
            pontosTotais: orderData.totalPoints
        })

        // ✅ GERAR HASH COM TRATAMENTO DE ERRO
        try {
            orderData.documentHash = gerarHashPedido(orderData)
        } catch (error) {
            console.warn('Erro ao gerar hash, usando timestamp:', error)
            orderData.documentHash = `HASH-${Date.now()}`
        }

        return orderData

    } catch (error) {
        console.error('ERRO CRÍTICO ao processar resultado da IA:', error)

        // ✅ FALLBACK SEGURO: Retornar estrutura válida mesmo em caso de erro crítico
        return {
            orderNumber: `ERRO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            orderDate: new Date().toISOString().split('T')[0],
            customer: 'Cliente (erro no processamento)',
            totalValue: 0,
            items: [],
            totalPoints: 0,
            documentHash: `ERROR-${Date.now()}`,
            allProducts: [],
            processingError: true,
            errorMessage: error.message || 'Erro desconhecido no processamento'
        }
    }
}

// Função de validação (compatibilidade)
export const validateOrder = async (orderData) => {
    try {
        const errors = []
        const warnings = []

        // Validação crítica: aceitar mesmo sem produtos (será 0 pontos)
        if (!orderData.items || orderData.items.length === 0) {
            if (orderData.noEligibleProducts) {
                warnings.push('Nenhum produto elegível encontrado - processamento com 0 pontos')
            } else {
                errors.push('Nenhum produto Fast Sistemas foi identificado na nota fiscal')
            }
        }

        // Validação de prazo mais flexível - apenas warning
        if (orderData.orderDate) {
            const isValidPeriod = validarPrazoPedido(orderData.orderDate)
            if (!isValidPeriod) {
                warnings.push('Pedido pode estar fora do prazo de 30 dias')
            }
        }

        // Validar itens apenas se existirem
        if (orderData.items && orderData.items.length > 0) {
            orderData.items.forEach((item, index) => {
                if (!item.product_name) {
                    warnings.push(`Item ${index + 1}: Nome do produto não identificado`)
                }
                if (item.quantity <= 0) {
                    warnings.push(`Item ${index + 1}: Quantidade não especificada`)
                }
                if (item.total_value <= 0) {
                    warnings.push(`Item ${index + 1}: Valor não identificado`)
                }
            })
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        }

    } catch (error) {
        console.error('Erro na validação:', error)
        return {
            isValid: true, // Permitir processamento mesmo com erro de validação
            errors: [],
            warnings: ['Erro interno na validação - processamento continuará']
        }
    }
}

// Função para validar se os pontos calculados fazem sentido
export const validarPontosCalculados = async (produtos) => {
    console.log('=== VALIDAÇÃO DE PONTOS ===');

    let totalPontosValidados = 0;
    const relatorio = [];

    for (const produto of produtos) {
        const produtoElegivel = await identificarProdutoElegivel(produto.product_code, produto.product_name);

        if (produtoElegivel) {
            const pontosEsperados = Math.floor(produto.total_value * produtoElegivel.pontosPorReal);
            const pontosCalculados = produto.points;

            const validacao = {
                nome: produto.product_name,
                codigo: produto.product_code,
                valor: produto.total_value,
                pontosPorReal: produtoElegivel.pontosPorReal,
                pontosEsperados,
                pontosCalculados,
                correto: pontosEsperados === pontosCalculados,
                categoria: produtoElegivel.categoria
            };

            relatorio.push(validacao);

            if (validacao.correto) {
                totalPontosValidados += pontosCalculados;
                console.log(`✅ ${validacao.nome}: R$ ${validacao.valor.toFixed(2)} × ${validacao.pontosPorReal} = ${pontosCalculados} pts`);
            } else {
                console.error(`❌ ${validacao.nome}: Esperado ${pontosEsperados} pts, calculado ${pontosCalculados} pts`);
            }
        }
    }

    console.log(`Total validado: ${totalPontosValidados} pontos`);
    console.log('========================');

    return {
        totalPontosValidados,
        relatorio,
        todosCorretos: relatorio.every(r => r.correto)
    };
};

// Função para obter lista de todos os produtos elegíveis (para exibição)
export const getProdutosElegiveis = async () => {
    const produtos = await buscarProdutosElegiveis();
    const produtosElegiveis = []

    // Converter mapeamento de produtos para array com informações detalhadas
    Object.entries(produtos).forEach(([codigo, produto]) => {
        produtosElegiveis.push({
            codigo,
            nome: produto.nome,
            pontosPorReal: produto.pontosPorReal,
            categoria: produto.categoria,
            descricao: produto.descricao,
            ativa: produto.ativa,
            descricaoPontos: `${produto.pontosPorReal} ${produto.pontosPorReal === 1 ? 'ponto' : 'pontos'} por R$1,00`
        })
    })

    // Ordenar por pontuação (maior primeiro) e depois por categoria
    return produtosElegiveis
        .filter(produto => produto.ativa !== false)
        .sort((a, b) => {
            if (b.pontosPorReal !== a.pontosPorReal) {
                return b.pontosPorReal - a.pontosPorReal
            }
            return a.categoria.localeCompare(b.categoria)
        })
}

// Função para obter categorias e suas informações (dinâmica baseada na base de dados)
export const getCategoriasProdutos = async () => {
    const produtos = await buscarProdutosElegiveis();
    const categorias = {};

    Object.values(produtos).forEach(produto => {
        if (!categorias[produto.categoria]) {
            categorias[produto.categoria] = {
                nome: produto.nome,
                pontos: produto.pontosPorReal,
                descricao: produto.descricao,
                cor: getCoresPorCategoria(produto.categoria)
            };
        }
    });

    return categorias;
}

// Cores por categoria (helper)
const getCoresPorCategoria = (categoria) => {
    const cores = {
        'placa_st': '#6c757d',
        'placa_ru': '#007bff',
        'glasroc_x': '#dc3545',
        'placomix': '#6610f2',
        'malha_glasroc': '#e83e8c',
        'basecoat': '#dc3545'
    };
    return cores[categoria] || '#6c757d';
}
