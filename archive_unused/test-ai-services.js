// Teste rápido dos serviços de IA

import { checkOpenAIServiceHealth } from './src/services/openaiService.js';
import { checkClaudeServiceHealth } from './src/services/claudeService.js';
import { analyzeOrder as analyzeOrderWithSimulation } from './src/services/simulatedAI.js';

console.log('🧪 Testando serviços de IA...\n');

// Teste OpenAI
console.log('🤖 Testando OpenAI...');
try {
    const openaiHealth = await checkOpenAIServiceHealth();
    console.log('OpenAI Status:', openaiHealth.available ? '✅ Disponível' : '❌ Indisponível');
    if (!openaiHealth.available) {
        console.log('Erro:', openaiHealth.error);
    }
} catch (error) {
    console.log('OpenAI Status: ❌ Erro -', error.message);
}

console.log('');

// Teste Claude
console.log('🎭 Testando Claude...');
try {
    const claudeHealth = await checkClaudeServiceHealth();
    console.log('Claude Status:', claudeHealth.available ? '✅ Disponível' : '❌ Indisponível');
    if (!claudeHealth.available) {
        console.log('Erro:', claudeHealth.error);
    }
} catch (error) {
    console.log('Claude Status: ❌ Erro -', error.message);
}

console.log('');

// Teste IA Simulada (sempre funciona)
console.log('📋 Testando IA Simulada...');
try {
    const simulationResult = await analyzeOrderWithSimulation('fake_base64_image');
    console.log('IA Simulada Status: ✅ Funcionando');
    console.log('Produtos encontrados:', simulationResult.products.length);
    console.log('Total de pontos:', simulationResult.totalPoints);
} catch (error) {
    console.log('IA Simulada Status: ❌ Erro -', error.message);
}

console.log('\n🏁 Teste concluído!');
