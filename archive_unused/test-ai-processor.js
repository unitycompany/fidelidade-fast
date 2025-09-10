// Teste do processador de IA com imagem real
import { AINotaProcessor } from './src/services/aiNotaProcessor.js';
import fs from 'fs';

async function testAIProcessor() {
    try {
        console.log('🤖 Testando processador de IA...');

        // Carregar imagem de teste
        const imageBuffer = fs.readFileSync('./public/nota.jpg');
        const imageFile = new File([imageBuffer], 'nota.jpg', { type: 'image/jpeg' });

        console.log('📁 Arquivo carregado:', {
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type
        });

        // Inicializar processador
        const processor = new AINotaProcessor();

        // Verificar quota
        const quota = processor.getQuotaStatus();
        console.log('📊 Status da quota:', quota);

        if (!quota.canProcess) {
            console.log('❌ Limite de requisições atingido');
            return;
        }

        console.log('🚀 Processando nota fiscal...');

        // Processar nota
        const result = await processor.processNotaFiscal(imageFile);

        console.log('✅ Resultado do processamento:');
        console.log(JSON.stringify(result, null, 2));

        if (result.success && result.data.products) {
            console.log(`📦 ${result.data.products.length} produtos Fast encontrados`);
            console.log(`⭐ ${result.data.totalPoints} pontos totais`);
            console.log(`💰 R$ ${result.data.totalValue} valor Fast`);

            result.data.products.forEach((product, index) => {
                console.log(`${index + 1}. ${product.product_name} - ${product.points} pontos`);
            });
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testAIProcessor();
