// Utilitários específicos para Pedidos de Vendas Fast Sistemas - Versão Corrigida

// Mapeamento de códigos de produtos Fast
export const PRODUTOS_FAST = {
    // Placas ST (0,5 pontos/R$)
    'DW00057': { nome: 'Placa ST', pontosPorReal: 0.5, categoria: 'drywall' },
    'DW00058': { nome: 'Placa ST', pontosPorReal: 0.5, categoria: 'drywall' },

    // Placas RU/Guias/Montantes (1 ponto/R$)
    'DW00074': { nome: 'Guia Drywall', pontosPorReal: 1.0, categoria: 'drywall' },
    'DW00007': { nome: 'Placa RU', pontosPorReal: 1.0, categoria: 'drywall' },
    'DW00075': { nome: 'Placa RU', pontosPorReal: 1.0, categoria: 'drywall' },
    'DW00087': { nome: 'Montante Drywall', pontosPorReal: 1.0, categoria: 'drywall' },

    // Placa Glasroc X (2 pontos/R$)
    'GR00001': { nome: 'Placa Glasroc X', pontosPorReal: 2.0, categoria: 'glasroc' },
    'GR00002': { nome: 'Placa Glasroc X', pontosPorReal: 2.0, categoria: 'glasroc' },

    // Placomix (1 ponto/R$)
    'PM00001': { nome: 'Placomix', pontosPorReal: 1.0, categoria: 'acabamento' },
    'PM00002': { nome: 'Placomix', pontosPorReal: 1.0, categoria: 'acabamento' },

    // Malha telada Glasroc X (2 pontos/R$)
    'MT00001': { nome: 'Malha telada Glasroc X', pontosPorReal: 2.0, categoria: 'glasroc' },
    'MT00002': { nome: 'Malha telada Glasroc X', pontosPorReal: 2.0, categoria: 'glasroc' },

    // Basecoat (2 pontos/R$)
    'BC00001': { nome: 'Basecoat', pontosPorReal: 2.0, categoria: 'glasroc' },
    'BC00002': { nome: 'Basecoat', pontosPorReal: 2.0, categoria: 'glasroc' }
}

// Identificar produto por código ou nome e verificar se está na lista elegível
export const identificarProdutoElegivel = (codigo, nome) => {
    // Primeiro, verificar por código exato
    if (codigo && PRODUTOS_FAST[codigo]) {
        return PRODUTOS_FAST[codigo]
    }

    // Depois, verificar por nome/padrões específicos apenas para produtos elegíveis
    const nomeUpper = nome ? nome.toUpperCase() : ''

    // Placa ST - apenas códigos específicos
    if ((codigo === 'DW00057' || codigo === 'DW00058') ||
        (nomeUpper.includes('PLACA ST') && nomeUpper.includes('13'))) {
        return { nome: nome, pontosPorReal: 0.5, categoria: 'drywall' }
    }

    // Guia Drywall - código DW00074
    if (codigo === 'DW00074' || nomeUpper.includes('GUIA DRYWALL')) {
        return { nome: nome, pontosPorReal: 1.0, categoria: 'drywall' }
    }

    // Montante Drywall - código DW00087
    if (codigo === 'DW00087' || nomeUpper.includes('MONTANTE DRYWALL')) {
        return { nome: nome, pontosPorReal: 1.0, categoria: 'drywall' }
    }

    // Outras placas RU - códigos DW00007, DW00075
    if (codigo === 'DW00007' || codigo === 'DW00075') {
        return { nome: nome, pontosPorReal: 1.0, categoria: 'drywall' }
    }

    // Glasroc X - apenas códigos específicos
    if ((codigo === 'GR00001' || codigo === 'GR00002') ||
        (nomeUpper.includes('GLASROC') && nomeUpper.includes('PLACA'))) {
        return { nome: nome, pontosPorReal: 2.0, categoria: 'glasroc' }
    }

    // Placomix - apenas códigos específicos
    if ((codigo === 'PM00001' || codigo === 'PM00002') ||
        nomeUpper.includes('PLACOMIX')) {
        return { nome: nome, pontosPorReal: 1.0, categoria: 'acabamento' }
    }

    // Malha telada - apenas códigos específicos
    if ((codigo === 'MT00001' || codigo === 'MT00002') ||
        (nomeUpper.includes('MALHA') && nomeUpper.includes('GLASROC'))) {
        return { nome: nome, pontosPorReal: 2.0, categoria: 'glasroc' }
    }

    // Basecoat - apenas códigos específicos
    if ((codigo === 'BC00001' || codigo === 'BC00002') ||
        (nomeUpper.includes('BASECOAT') || (nomeUpper.includes('MASSA') && nomeUpper.includes('GLASROC')))) {
        return { nome: nome, pontosPorReal: 2.0, categoria: 'glasroc' }
    }

    return null // Produto não elegível
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
export const processOrderResult = (aiData) => {
    try {
        console.log('=== PROCESSANDO DADOS DA IA ===')
        console.log('Dados recebidos:', JSON.stringify(aiData, null, 2))

        // Processar data para formato correto
        let processedDate = new Date().toISOString().split('T')[0] // Data padrão: hoje

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

        const orderData = {
            orderNumber: aiData.numeroPedido || aiData.numero || `PEDIDO-${Date.now()}`,
            orderDate: processedDate,
            customer: aiData.cliente || aiData.nomeCliente || 'Cliente',
            totalValue: parseFloat(aiData.valorTotalPedido || aiData.valorTotal || aiData.total || 0),
            items: [],
            totalPoints: 0,
            documentHash: '',
            allProducts: []
        }

        // Processar TODOS os produtos identificados primeiro
        const todosProdutos = []

        // Adicionar produtos Fast específicos
        if (aiData.produtosFast && Array.isArray(aiData.produtosFast)) {
            todosProdutos.push(...aiData.produtosFast)
        }

        // Adicionar produtos gerais
        if (aiData.produtos && Array.isArray(aiData.produtos)) {
            todosProdutos.push(...aiData.produtos)
        }

        // Adicionar itens
        if (aiData.itens && Array.isArray(aiData.itens)) {
            todosProdutos.push(...aiData.itens)
        }

        console.log('Total de produtos encontrados:', todosProdutos.length)

        // Processar cada produto
        todosProdutos.forEach((produto, index) => {
            const nomeProduto = produto.nome || produto.descricao || produto.product_name || ''

            if (!nomeProduto.trim()) {
                console.warn('Produto sem nome identificado, ignorando:', produto)
                return
            }

            const quantidade = parseInt(produto.quantidade || produto.qtd || produto.quantity || 1)
            const valorUnitario = parseFloat(produto.valorUnitario || produto.preco || produto.valor || produto.unit_price || 0)
            const valorTotal = produto.valorTotal ? parseFloat(produto.valorTotal) : (quantidade * valorUnitario)

            // Verificar se o produto está na lista de elegíveis
            const produtoElegivel = identificarProdutoElegivel(produto.codigo || produto.code, nomeProduto)

            // Criar informações do produto
            const produtoInfo = {
                product_name: nomeProduto,
                product_code: produto.codigo || produto.code || `ITEM-${index + 1}`,
                quantity: quantidade > 0 ? quantidade : 1,
                unit_price: valorUnitario,
                total_value: valorTotal > 0 ? valorTotal : 0,
                isEligible: !!produtoElegivel,
                category: produtoElegivel ? produtoElegivel.categoria : 'outros',
                points: 0
            }

            // Se produto é elegível e tem dados válidos, calcular pontos
            if (produtoElegivel && valorTotal > 0) {
                const pontos = Math.floor(valorTotal * produtoElegivel.pontosPorReal)

                produtoInfo.points = pontos
                produtoInfo.isEligible = true

                // Adicionar aos itens que geram pontos
                orderData.items.push({
                    product_id: null,
                    product_name: nomeProduto,
                    product_code: produtoInfo.product_code,
                    quantity: quantidade,
                    unit_price: valorUnitario,
                    total_value: valorTotal,
                    points: pontos,
                    category: produtoElegivel.categoria
                })

                orderData.totalPoints += pontos
            }

            // Adicionar à lista de todos os produtos
            orderData.allProducts.push(produtoInfo)
        })

        console.log('Produtos elegíveis encontrados:', orderData.items.length)
        console.log('Total de produtos na nota:', orderData.allProducts.length)
        console.log('Total de pontos:', orderData.totalPoints)

        // Se não tem itens elegíveis, retornar resultado com 0 pontos
        if (orderData.items.length === 0) {
            console.log('Nenhum produto elegível encontrado - retornando 0 pontos')

            return {
                ...orderData,
                noEligibleProducts: true,
                message: 'Nenhum produto elegível para pontos',
                details: 'Os produtos na nota fiscal não fazem parte do programa de fidelidade Fast Sistemas.',
                totalPoints: 0,
                documentHash: gerarHashPedido(orderData)
            }
        }

        // Gerar hash do documento
        orderData.documentHash = gerarHashPedido(orderData)

        return orderData

    } catch (error) {
        console.error('Erro ao processar resultado da IA:', error)
        throw new Error('Erro ao processar dados do pedido')
    }
}

// Função para validar pedido (versão mais flexível)
export const validateOrder = async (orderData) => {
    const errors = []
    const warnings = []

    try {
        // Validações básicas e flexíveis
        if (!orderData.orderNumber) {
            warnings.push('Número do pedido não encontrado - será usado número automático')
        }

        if (!orderData.orderDate) {
            warnings.push('Data do pedido não encontrada - será usada data atual')
        }

        // Aceitar qualquer valor maior que 0
        if (orderData.totalValue <= 0) {
            warnings.push('Valor total baixo - validando se é um pedido de demonstração')
        }

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

// Função para obter lista de todos os produtos elegíveis (para exibição)
export const getProdutosElegiveis = () => {
    const produtosElegiveis = []

    // Converter mapeamento de produtos para array com informações detalhadas
    Object.entries(PRODUTOS_FAST).forEach(([codigo, produto]) => {
        produtosElegiveis.push({
            codigo,
            nome: produto.nome,
            pontosPorReal: produto.pontosPorReal,
            categoria: produto.categoria,
            descricaoPontos: `${produto.pontosPorReal} ${produto.pontosPorReal === 1 ? 'ponto' : 'pontos'} por R$1,00`
        })
    })

    // Adicionar produtos por padrão de nome (sem código específico)
    const produtosPorNome = [
        { nome: 'Placa ST 13mm', pontosPorReal: 0.5, categoria: 'drywall', codigo: 'Padrão' },
        { nome: 'Guia Drywall (qualquer)', pontosPorReal: 1.0, categoria: 'drywall', codigo: 'Padrão' },
        { nome: 'Montante Drywall (qualquer)', pontosPorReal: 1.0, categoria: 'drywall', codigo: 'Padrão' },
        { nome: 'Placa Glasroc X (qualquer)', pontosPorReal: 2.0, categoria: 'glasroc', codigo: 'Padrão' },
        { nome: 'Placomix (qualquer)', pontosPorReal: 1.0, categoria: 'acabamento', codigo: 'Padrão' },
        { nome: 'Malha telada Glasroc X', pontosPorReal: 2.0, categoria: 'glasroc', codigo: 'Padrão' },
        { nome: 'Basecoat / Massa Glasroc', pontosPorReal: 2.0, categoria: 'glasroc', codigo: 'Padrão' }
    ]

    produtosPorNome.forEach(produto => {
        if (!produtosElegiveis.find(p => p.nome.toLowerCase().includes(produto.nome.toLowerCase().split(' ')[0]))) {
            produtosElegiveis.push({
                ...produto,
                descricaoPontos: `${produto.pontosPorReal} ${produto.pontosPorReal === 1 ? 'ponto' : 'pontos'} por R$1,00`
            })
        }
    })

    return produtosElegiveis.sort((a, b) => b.pontosPorReal - a.pontosPorReal)
}
