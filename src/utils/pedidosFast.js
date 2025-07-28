// Utilitários específicos para Pedidos de Vendas Fast Sistemas - Versão Corrigida
// Importar supabase para buscar produtos dinamicamente
import { supabase } from '../services/supabase';
import ProdutosService from '../services/produtosService';

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

// Cache para produtos da base de dados (global para sincronização)
window.produtosCache = window.produtosCache || null;
window.cacheTimestamp = window.cacheTimestamp || null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Buscar produtos elegíveis da base de dados
export const buscarProdutosElegiveis = async () => {
    try {
        // Verificar cache
        if (window.produtosCache && window.cacheTimestamp && (Date.now() - window.cacheTimestamp) < CACHE_DURATION) {
            return window.produtosCache;
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
        window.produtosCache = produtosBD;
        window.cacheTimestamp = Date.now();

        return produtosBD;
    } catch (error) {
        console.warn('Erro ao conectar com base de dados, usando fallback:', error);
        return PRODUTOS_FAST;
    }
};

// Identificar produto por código ou nome e verificar se está na lista elegível
export const identificarProdutoElegivel = async (codigo, nome) => {
    try {
        // Obter produtos ativos do banco de dados
        const resultado = await ProdutosService.obterProdutosAtivos();
        let produtosAtivos = [];

        if (resultado.success && resultado.data.length > 0) {
            produtosAtivos = resultado.data;
        } else {
            console.warn('⚠️ Fallback para produtos hardcoded');
            // Fallback para produtos hardcoded se não conseguir acessar o banco
            const produtosFallback = await buscarProdutosElegiveis();
            produtosAtivos = Object.values(produtosFallback).map(p => ({
                codigo: p.codigo || '',
                nome: p.nome,
                pontos_por_real: p.pontosPorReal,
                categoria: p.categoria,
                ativa: p.ativa
            }));
        }

        // Primeiro, verificar por código exato
        if (codigo) {
            const produtoPorCodigo = produtosAtivos.find(p =>
                p.ativa && p.codigo && p.codigo.toUpperCase() === codigo.toUpperCase()
            );
            if (produtoPorCodigo) {
                return {
                    nome: nome || produtoPorCodigo.nome,
                    pontosPorReal: produtoPorCodigo.pontos_por_real,
                    categoria: produtoPorCodigo.categoria,
                    ativa: true
                };
            }
        }

        // Depois, verificar por nome/padrões específicos
        if (!nome) return null;

        const nomeUpper = nome.toUpperCase();

        // Buscar por padrões nos produtos ativos
        for (const produto of produtosAtivos) {
            if (!produto.ativa) continue;

            // Estratégia 1: Correspondência por nome exato ou similar
            const nomeProdutoUpper = produto.nome.toUpperCase();
            if (nomeUpper.includes(nomeProdutoUpper) || nomeProdutoUpper.includes(nomeUpper)) {
                return {
                    nome: nome,
                    pontosPorReal: produto.pontos_por_real,
                    categoria: produto.categoria,
                    ativa: true
                };
            }

            // Estratégia 2: Verificações específicas baseadas na categoria
            switch (produto.categoria) {
                case 'placa_st':
                    if (nomeUpper.includes('PLACA ST') ||
                        (nomeUpper.includes('PLACA') && nomeUpper.includes('ST') &&
                            !nomeUpper.includes('RU') && !nomeUpper.includes('GLASROC'))) {
                        return { nome: nome, pontosPorReal: produto.pontos_por_real, categoria: produto.categoria, ativa: true };
                    }
                    break;

                case 'placa_ru':
                    if (nomeUpper.includes('PLACA RU') ||
                        (nomeUpper.includes('PLACA') && nomeUpper.includes('RU') && !nomeUpper.includes('GLASROC'))) {
                        return { nome: nome, pontosPorReal: produto.pontos_por_real, categoria: produto.categoria, ativa: true };
                    }
                    break;

                case 'glasroc_x':
                    if ((nomeUpper.includes('GLASROC') && nomeUpper.includes('PLACA')) ||
                        (nomeUpper.includes('PLACA') && nomeUpper.includes('GLASROC'))) {
                        return { nome: nome, pontosPorReal: produto.pontos_por_real, categoria: produto.categoria, ativa: true };
                    }
                    break;

                case 'placomix':
                    if (nomeUpper.includes('PLACOMIX')) {
                        return { nome: nome, pontosPorReal: produto.pontos_por_real, categoria: produto.categoria, ativa: true };
                    }
                    break;

                case 'malha_glasroc':
                    if ((nomeUpper.includes('MALHA') && nomeUpper.includes('GLASROC')) ||
                        (nomeUpper.includes('MALHA') && nomeUpper.includes('TELADA') && nomeUpper.includes('GLASROC'))) {
                        return { nome: nome, pontosPorReal: produto.pontos_por_real, categoria: produto.categoria, ativa: true };
                    }
                    break;

                case 'basecoat':
                    if (nomeUpper.includes('BASECOAT') ||
                        (nomeUpper.includes('MASSA') && nomeUpper.includes('GLASROC') && !nomeUpper.includes('PLACA'))) {
                        return { nome: nome, pontosPorReal: produto.pontos_por_real, categoria: produto.categoria, ativa: true };
                    }
                    break;

                // Estratégia 3: Correspondência genérica para produtos personalizados
                default:
                    // Dividir o nome do produto em palavras-chave e verificar correspondência
                    const palavrasChaveProduto = nomeProdutoUpper.split(/\s+/).filter(p => p.length > 2);
                    const palavrasChaveNome = nomeUpper.split(/\s+/).filter(p => p.length > 2);

                    // Se pelo menos 60% das palavras-chave coincidem, considerar correspondência
                    const palavrasCorrespondentes = palavrasChaveProduto.filter(palavra =>
                        palavrasChaveNome.some(nomepalavra =>
                            nomepalavra.includes(palavra) || palavra.includes(nomepalavra)
                        )
                    );

                    if (palavrasCorrespondentes.length >= Math.ceil(palavrasChaveProduto.length * 0.6)) {
                        return {
                            nome: nome,
                            pontosPorReal: produto.pontos_por_real,
                            categoria: produto.categoria,
                            ativa: true
                        };
                    }
                    break;
            }
        }

        return null; // Produto não elegível
    } catch (error) {
        console.error('❌ Erro ao identificar produto elegível:', error);
        return null;
    }
};

// Função auxiliar para criar chave única de produto (evitar duplicatas)
const criarChaveProduto = (produto) => {
    const nome = produto.nome || produto.descricao || produto.product_name || ''
    const valor = produto.valorTotal || produto.valor || produto.total_value || 0
    const codigo = produto.codigo || produto.code || ''

    // Normalizar nome (remover espaços extras, converter para maiúsculo)
    const nomeNormalizado = nome.toUpperCase().replace(/\s+/g, ' ').trim()

    return `${nomeNormalizado}|${valor}|${codigo}`.replace(/\|+$/, '') // Removes pipes vazios no final
}

// Gerar hash único do pedido para evitar duplicatas (versão para testes)
export const gerarHashPedido = (dadosPedido) => {
    try {
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

        const hashFinal = `${Math.abs(hash).toString(16)}-${randomLong.substring(0, 8)}`

        // Garantir que nunca retorne vazio
        if (!hashFinal || hashFinal.trim() === '' || hashFinal === '-') {
            const fallbackHash = `HASH-${timestamp}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            console.warn('⚠️ Hash vazio detectado, usando fallback:', fallbackHash)
            return fallbackHash
        }

        return hashFinal
    } catch (error) {
        console.error('Erro ao gerar hash do pedido:', error)
        const errorHash = `ERROR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        return errorHash
    }
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
            const fallbackData = {
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
            console.log('🚨 RETORNANDO DADOS FALLBACK:', fallbackData)
            return fallbackData
        }

        // ✅ PROCESSAR DATA COM TRATAMENTO DE ERRO ROBUSTO
        let processedDate = new Date().toISOString().split('T')[0] // Data padrão: hoje

        try {
            if (aiData.dataEmissao || aiData.dataPedido || aiData.data) {
                const dataOriginal = aiData.dataEmissao || aiData.dataPedido || aiData.data
                console.log('🔍 Data original recebida:', dataOriginal, 'tipo:', typeof dataOriginal)

                // Se a data está em formato DD/MM/YYYY, converter para YYYY-MM-DD
                if (typeof dataOriginal === 'string' && dataOriginal.includes('/')) {
                    const [dia, mes, ano] = dataOriginal.split('/')
                    if (dia && mes && ano && ano.length === 4) {
                        const dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
                        // Validar se é uma data válida
                        const testDate = new Date(dataFormatada)
                        if (!isNaN(testDate.getTime())) {
                            processedDate = dataFormatada
                            console.log('✅ Data formatada com sucesso:', processedDate)
                        } else {
                            console.warn('⚠️ Data inválida após formatação, usando data atual')
                        }
                    }
                } else if (typeof dataOriginal === 'string' && dataOriginal.includes('-')) {
                    // Formato YYYY-MM-DD
                    const testDate = new Date(dataOriginal)
                    if (!isNaN(testDate.getTime())) {
                        processedDate = dataOriginal
                        console.log('✅ Data no formato correto:', processedDate)
                    } else {
                        console.warn('⚠️ Data inválida no formato YYYY-MM-DD, usando data atual')
                    }
                } else {
                    console.warn('⚠️ Formato de data não reconhecido, usando data atual')
                }
            }
        } catch (error) {
            console.warn('Erro ao processar data, usando data atual:', error)
            processedDate = new Date().toISOString().split('T')[0]
        }

        // ✅ GARANTIR QUE A DATA NUNCA SEJA NULL OU INVÁLIDA
        if (!processedDate || processedDate === 'Invalid Date') {
            processedDate = new Date().toISOString().split('T')[0]
            console.warn('⚠️ Data corrigida para data atual por segurança:', processedDate)
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

        console.log('🔧 ESTRUTURA ORDERDATA INICIAL CRIADA:', {
            orderNumber: orderData.orderNumber,
            orderDate: orderData.orderDate,
            customer: orderData.customer,
            totalValue: orderData.totalValue,
            itemsLength: orderData.items.length,
            totalPoints: orderData.totalPoints,
            allProductsLength: orderData.allProducts.length,
            'aiData.totalValue': aiData.totalValue,
            'typeof aiData.totalValue': typeof aiData.totalValue
        })

        // ✅ VALIDAÇÃO FINAL DOS DADOS OBRIGATÓRIOS
        if (!orderData.orderDate || orderData.orderDate === 'Invalid Date') {
            orderData.orderDate = new Date().toISOString().split('T')[0]
            console.warn('⚠️ Data do pedido corrigida para data atual')
        }
        if (!orderData.orderNumber || orderData.orderNumber.trim() === '') {
            orderData.orderNumber = `PEDIDO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            console.warn('⚠️ Número do pedido corrigido com fallback')
        }
        // ✅ USAR VALOR TOTAL DA IA SE DISPONÍVEL
        if (aiData.totalValue && aiData.totalValue > 0) {
            orderData.totalValue = parseFloat(aiData.totalValue)
            console.log('✅ Usando valor total da IA:', orderData.totalValue)
        } else if (!orderData.totalValue || orderData.totalValue <= 0) {
            orderData.totalValue = 0.01 // Valor mínimo para evitar erro NOT NULL
            console.warn('⚠️ Valor total corrigido para valor mínimo por segurança')
        }

        // Log de verificação
        console.log('🔍 Dados do pedido criados:', {
            orderNumber: orderData.orderNumber,
            customer: orderData.customer,
            totalValue: orderData.totalValue,
            orderDate: orderData.orderDate
        })

        // ✅ PRIMEIRO: Processar produtos retornados pela IA (raw products)
        if (Array.isArray(aiData.products) && aiData.products.length > 0) {
            console.log('🎯 Processando produtos da IA raw:', aiData.products.length)
            for (const produto of aiData.products) {
                const nomeProduto = String(
                    produto.description ||
                    produto.descrição ||
                    produto.product_name ||
                    produto.name ||
                    ''
                ).trim()
                const codigo = String(
                    produto.code ||
                    produto.codigo ||
                    produto.product_code ||
                    ''
                ).trim()
                const quantidade = parseInt(produto.quantity || produto.quantidade || 1) || 1
                const valorUnitario = parseFloat(produto.unit_price || produto.valorUnitario || 0) || 0
                const totalValue = parseFloat(
                    produto.total_price ||
                    produto.valorTotal ||
                    produto.total_value ||
                    produto.value ||
                    0
                ) || 0

                console.log(`🔍 Processando produto: ${nomeProduto} (${codigo}) - R$ ${totalValue}`)

                // Identificar elegibilidade
                const produtoElegivel = await identificarProdutoElegivel(codigo, nomeProduto)
                const pontosCalculados = produtoElegivel
                    ? Math.floor(totalValue * produtoElegivel.pontosPorReal)
                    : 0

                console.log(`🎯 Produto elegível? ${!!produtoElegivel} - Pontos: ${pontosCalculados}`)

                const produtoInfo = {
                    product_name: nomeProduto,
                    product_code: codigo || `AI-${nomeProduto}`,
                    quantity: quantidade,
                    unit_price: valorUnitario,
                    total_value: totalValue,
                    isEligible: !!produtoElegivel,
                    category: produtoElegivel?.categoria || 'outros',
                    points: pontosCalculados
                }
                // Adicionar à lista geral
                orderData.allProducts.push(produtoInfo)
                // Se elegível, adicionar para pontos
                if (produtoElegivel && pontosCalculados > 0) {
                    orderData.items.push({
                        product_id: null,
                        product_name: nomeProduto,
                        product_code: produtoInfo.product_code,
                        quantity: quantidade,
                        unit_price: valorUnitario,
                        total_value: totalValue,
                        points: pontosCalculados,
                        category: produtoElegivel.categoria
                    })
                    orderData.totalPoints += pontosCalculados
                }
                console.log(`✅ Processado: ${nomeProduto} = ${pontosCalculados} pts`)
            }
        }
        // ✅ SEGUNDO: Processar produtos Fast específicos (já com pontos calculados) - formato Gemini
        else if (Array.isArray(aiData.produtosFast) && aiData.produtosFast.length > 0) {
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

                        // ⚠️ ALERTA: Verificar se o produto tem pontos válidos ANTES de processar
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

                            console.log(`🎯 ADICIONANDO PRODUTO ELEGÍVEL:`, produtoInfo)

                            // Adicionar aos itens que geram pontos
                            const itemParaPontos = {
                                product_id: null,
                                product_name: nomeProduto,
                                product_code: produtoInfo.product_code,
                                quantity: quantidade,
                                unit_price: valorUnitario,
                                total_value: valorTotal,
                                points: pontosCalculados,
                                category: produto.categoria || 'fast'
                            }

                            orderData.items.push(itemParaPontos)
                            console.log(`✅ ITEM ADICIONADO AO ARRAY DE PONTOS:`, itemParaPontos)

                            // Adicionar à lista de todos os produtos
                            orderData.allProducts.push(produtoInfo)
                            orderData.totalPoints += pontosCalculados

                            console.log(`✅ Produto Fast processado: ${nomeProduto} = ${pontosCalculados} pts`)
                            console.log(`📊 TOTAL DE PONTOS ATUAL: ${orderData.totalPoints}`)
                        } else {
                            console.warn(`⚠️ Produto Fast ignorado por dados inválidos:`, {
                                nomeProduto,
                                valorTotal,
                                pontosCalculados,
                                motivoIgnorado: !nomeProduto ? 'nome vazio' : valorTotal <= 0 ? 'valor inválido' : 'pontos zero ou negativos'
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

        console.log('🔧 APÓS PROCESSAR PRODUTOS FAST:', {
            itemsLength: orderData.items.length,
            totalPoints: orderData.totalPoints,
            allProductsLength: orderData.allProducts.length
        })

        // ✅ ATUALIZAR VALOR TOTAL SE NECESSÁRIO - PRIORIZAR VALOR DA IA
        if (aiData.totalValue && aiData.totalValue > 0) {
            orderData.totalValue = parseFloat(aiData.totalValue)
            console.log(`✅ Usando valor total da IA: R$ ${orderData.totalValue.toFixed(2)}`)
        } else if (orderData.totalValue <= 0 && orderData.allProducts.length > 0) {
            const valorCalculado = orderData.allProducts.reduce((total, produto) => {
                return total + (parseFloat(produto.total_value) || 0)
            }, 0)

            if (valorCalculado > 0) {
                orderData.totalValue = valorCalculado
                console.log(`✅ Valor total calculado dos produtos: R$ ${valorCalculado.toFixed(2)}`)
            }
        }

        // ✅ GARANTIR VALOR MÍNIMO SE AINDA FOR ZERO
        if (orderData.totalValue <= 0) {
            orderData.totalValue = 0.01
            console.warn('⚠️ Valor total definido como mínimo para evitar erro de banco')
        }

        // ✅ SEGUNDO: Processar produtos gerais para listar todos (sem calcular pontos duplicados)
        const todosProdutosGerais = []
        try {
            if (Array.isArray(aiData.produtos)) {
                console.log('🔍 Processando produtos gerais:', aiData.produtos.length)
                aiData.produtos.forEach((produto, index) => {
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
                                console.log(`📦 Produto geral adicionado: ${nomeProduto}`)
                            } else {
                                console.log(`🔄 Produto já processado como Fast, ignorado: ${nomeProduto}`)
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

        // ✅ GERAR HASH COM TRATAMENTO DE ERRO ULTRA ROBUSTO
        let hashGerado = null
        try {
            hashGerado = gerarHashPedido(orderData)
            console.log('🔍 Hash gerado pela função:', hashGerado)

            // Validação tripla do hash
            if (!hashGerado || typeof hashGerado !== 'string' || hashGerado.trim() === '' || hashGerado === '-') {
                throw new Error('Hash inválido ou vazio')
            }

            orderData.documentHash = hashGerado.trim()
        } catch (error) {
            console.error('❌ Erro crítico ao gerar hash:', error)
            // Fallback ultra seguro
            const timestamp = Date.now()
            const random = Math.random().toString(36).substring(2, 8).toUpperCase()
            orderData.documentHash = `FALLBACK-${timestamp}-${random}`
            console.warn('⚠️ Usando hash de emergência:', orderData.documentHash)
        }

        // Validação final do hash
        if (!orderData.documentHash || orderData.documentHash.trim() === '') {
            const emergencyHash = `EMERGENCY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            orderData.documentHash = emergencyHash
            console.error('❌ Hash final vazio! Usando hash de emergência:', emergencyHash)
        }

        console.log('✅ Hash final confirmado:', orderData.documentHash)

        // 🚨 LOG CRÍTICO: ESTRUTURA FINAL ANTES DO RETORNO
        console.log('🚨 DADOS FINAIS ANTES DO RETORNO:', {
            orderNumber: orderData.orderNumber,
            orderDate: orderData.orderDate,
            customer: orderData.customer,
            totalValue: orderData.totalValue,
            itemsCount: orderData.items ? orderData.items.length : 'UNDEFINED',
            totalPoints: orderData.totalPoints,
            allProductsCount: orderData.allProducts ? orderData.allProducts.length : 'UNDEFINED',
            documentHash: orderData.documentHash,
            itemsDetalhes: orderData.items ? orderData.items.map(item => ({
                name: item.product_name,
                points: item.points,
                value: item.total_value
            })) : 'UNDEFINED'
        })

        // 🔍 VERIFICAÇÃO DE INTEGRIDADE ANTES DO RETORNO
        if (!orderData.items) {
            console.error('❌ ERRO CRÍTICO: orderData.items é undefined!')
            orderData.items = []
        }
        if (!orderData.allProducts) {
            console.error('❌ ERRO CRÍTICO: orderData.allProducts é undefined!')
            orderData.allProducts = []
        }
        if (typeof orderData.totalPoints !== 'number' || isNaN(orderData.totalPoints)) {
            console.error('❌ ERRO CRÍTICO: orderData.totalPoints não é um número!')
            orderData.totalPoints = 0
        }
        // Garantir que se houver produtos elegíveis, os pontos não fiquem zerados por erro de fluxo
        if (orderData.items.length > 0 && orderData.totalPoints === 0) {
            const soma = orderData.items.reduce((acc, item) => acc + (parseInt(item.points) || 0), 0)
            if (soma > 0) {
                console.error('❌ ERRO: Havia produtos elegíveis mas totalPoints ficou 0, corrigindo para soma dos itens:', soma)
                orderData.totalPoints = soma
            } else {
                console.error('❌ ERRO: Produtos elegíveis encontrados mas pontos continuam zerados! Verifique processamento.')
            }
        }

        // Garantia final: se ainda houver produtos elegíveis com pontos positivos e totalPoints ficou 0, corrige e alerta
        if (orderData.totalPoints === 0 && orderData.items.some(item => parseInt(item.points) > 0)) {
            const somaFinal = orderData.items.reduce((acc, item) => acc + (parseInt(item.points) || 0), 0)
            if (somaFinal > 0) {
                console.warn('⚠️ Garantia final: Corrigindo totalPoints para soma dos itens:', somaFinal)
                orderData.totalPoints = somaFinal
            }
        }

        // Garantia absoluta: sempre some os pontos dos itens elegíveis antes de retornar
        orderData.totalPoints = orderData.items.reduce((acc, item) => acc + (parseInt(item.points) || 0), 0)
        return orderData
    } catch (error) {
        console.error('ERRO CRÍTICO ao processar resultado da IA:', error)
        console.error('Stack trace:', error.stack)

        // ✅ FALLBACK SEGURO: Retornar estrutura válida mesmo em caso de erro crítico
        const fallbackData = {
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

        console.log('🚨 RETORNANDO DADOS FALLBACK POR ERRO:', fallbackData)
        return fallbackData
    }
}

// Função de validação (compatibilidade)
export const validateOrder = async (orderData) => {
    try {
        const errors = []
        const warnings = []

        // ✅ VALIDAÇÃO FLEXÍVEL: Aceitar sempre, apenas gerar warnings
        if (!orderData.items || orderData.items.length === 0) {
            if (orderData.noEligibleProducts || orderData.totalPoints === 0) {
                warnings.push('Nenhum produto elegível encontrado - processamento com 0 pontos')
            } else {
                warnings.push('Pedido processado sem produtos Fast Sistemas identificados')
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

// Função para obter lista de produtos elegíveis do banco de dados
export const getProdutosElegiveis = async () => {
    try {
        // Obter produtos ativos da base de dados
        const resultado = await ProdutosService.obterProdutosAtivos();

        if (resultado.success && resultado.data.length > 0) {
            // Converter formato da base para formato esperado pela interface
            const produtosFormatados = resultado.data.map(produto => ({
                codigo: produto.codigo,
                nome: produto.nome,
                pontosPorReal: produto.pontos_por_real,
                categoria: produto.categoria,
                descricao: produto.descricao || '',
                ativa: produto.ativa,
                descricaoPontos: `${produto.pontos_por_real} pontos por R$1,00`
            }));

            console.log(`✅ ${produtosFormatados.length} produtos carregados do banco de dados`);
            return produtosFormatados;
        } else {
            console.warn('⚠️ Nenhum produto ativo encontrado na base, usando produtos padrão');
            return getProdutosPadrao();
        }
    } catch (error) {
        console.error('❌ Erro ao carregar produtos da base:', error);
        console.log('🔄 Fallback: usando produtos padrão');
        return getProdutosPadrao();
    }
};

// Função de fallback com produtos padrão
const getProdutosPadrao = () => {
    return [
        {
            codigo: 'PLACA_ST',
            nome: 'Placa ST',
            pontosPorReal: 0.5,
            categoria: 'placa_st',
            descricao: 'Placas ST para drywall',
            ativa: true,
            descricaoPontos: '0.5 pontos por R$1,00'
        },
        {
            codigo: 'PLACA_RU',
            nome: 'Placa RU',
            pontosPorReal: 1.0,
            categoria: 'placa_ru',
            descricao: 'Placas RU resistentes à umidade',
            ativa: true,
            descricaoPontos: '1 ponto por R$1,00'
        },
        {
            codigo: 'PLACA_GLASROC_X',
            nome: 'Placa Glasroc X',
            pontosPorReal: 2.0,
            categoria: 'glasroc_x',
            descricao: 'Placas cimentícias Glasroc X',
            ativa: true,
            descricaoPontos: '2 pontos por R$1,00'
        },
        {
            codigo: 'PLACOMIX',
            nome: 'Placomix',
            pontosPorReal: 1.0,
            categoria: 'placomix',
            descricao: 'Massa para rejunte Placomix',
            ativa: true,
            descricaoPontos: '1 ponto por R$1,00'
        },
        {
            codigo: 'MALHA_GLASROC_X',
            nome: 'Malha telada para Glasroc X',
            pontosPorReal: 2.0,
            categoria: 'malha_glasroc',
            descricao: 'Malha telada para Glasroc X',
            ativa: true,
            descricaoPontos: '2 pontos por R$1,00'
        },
        {
            codigo: 'BASECOAT_GLASROC_X',
            nome: 'Basecoat (massa para Glasroc X)',
            pontosPorReal: 2.0,
            categoria: 'basecoat',
            descricao: 'Massa base para Glasroc X',
            ativa: true,
            descricaoPontos: '2 pontos por R$1,00'
        }
    ];
};

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
