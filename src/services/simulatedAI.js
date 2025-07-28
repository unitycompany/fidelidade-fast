// Simulador de IA para análise de pedidos e cálculo de pontos

export const analyzeOrder = async (base64Image) => {
    console.log('[SimulatedAI] Iniciando análise do pedido...');

    // Simular delay de processamento para parecer realista
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular extração de texto da imagem
    const extractedText = simulateOCR(base64Image);

    // Simular validação de produtos e cálculo de pontos
    const products = simulateProductValidation(extractedText);

    const totalPoints = products.reduce((sum, product) => sum + product.points, 0);
    const totalValue = products.reduce((sum, product) => sum + product.total_value, 0);

    console.log('[SimulatedAI] Análise concluída:', { products, totalPoints, totalValue });

    return {
        products,
        totalPoints,
        orderNumber: generateOrderNumber(),
        orderDate: new Date().toISOString().split('T')[0],
        customer: 'Cliente Simulado LTDA',
        totalValue: totalValue
    };
};

const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FAST-${timestamp}-${random}`;
};

const simulateOCR = (base64Image) => {
    console.log('[SimulatedAI] Simulando OCR...');

    // Simular extração de texto com produtos Fast Sistemas reais
    return `
        NOTA FISCAL DE VENDAS - FAST SISTEMAS
        Data: ${new Date().toLocaleDateString('pt-BR')}
        Cliente: CLIENTE SIMULADO LTDA
        
        PRODUTOS:
        1. PLACA ST 13-1.80 M - Cod: DW00057 - Qtd: 35 - Valor Unit: R$ 33,20 - Total: R$ 1.162,00
        2. MASSA DRYWALL-25 KG-PLACOMIX - Cod: DW00078 - Qtd: 2 - Valor Unit: R$ 53,00 - Total: R$ 106,00
        3. PERFIL DRYWALL F530-3.00 M - Cod: DW00032 - Qtd: 40 - Valor Unit: R$ 9,15 - Total: R$ 366,12
        4. PARAFUSO DRYWALL 13-AGULHA - Cod: FX00020 - Qtd: 3 - Valor Unit: R$ 4,97 - Total: R$ 14,91
        
        VALOR TOTAL: R$ 1.649,03
    `;
};

const simulateProductValidation = (extractedText) => {
    console.log('[SimulatedAI] Validando produtos...');

    // Simular validação com produtos Fast Sistemas REAIS que são elegíveis
    const products = [
        {
            name: 'PLACA ST 13-1.80 M',
            product_name: 'PLACA ST 13-1.80 M',
            product_code: 'DW00057',
            quantity: 35,
            unit_price: 33.20,
            value: 1162.00,
            total_value: 1162.00,
            points: 581, // 0.5 pontos por real
            category: 'placa_st',
            product_id: 'sim-001'
        },
        {
            name: 'MASSA DRYWALL-25 KG-PLACOMIX',
            product_name: 'MASSA DRYWALL-25 KG-PLACOMIX',
            product_code: 'DW00078',
            quantity: 2,
            unit_price: 53.00,
            value: 106.00,
            total_value: 106.00,
            points: 106, // 1 ponto por real
            category: 'placomix',
            product_id: 'sim-002'
        },
        {
            name: 'PERFIL DRYWALL F530-3.00 M',
            product_name: 'PERFIL DRYWALL F530-3.00 M',
            product_code: 'DW00032',
            quantity: 40,
            unit_price: 9.15,
            value: 366.12,
            total_value: 366.12,
            points: 0, // Não elegível
            category: 'outros',
            product_id: 'sim-003'
        },
        {
            name: 'PARAFUSO DRYWALL 13-AGULHA',
            product_name: 'PARAFUSO DRYWALL 13-AGULHA',
            product_code: 'FX00020',
            quantity: 3,
            unit_price: 4.97,
            value: 14.91,
            total_value: 14.91,
            points: 0, // Não elegível
            category: 'outros',
            product_id: 'sim-004'
        },
    ];

    return products;
};
