// Script para testar limite diário - Cole no console do navegador

// Função para simular limite diário excedido
window.testDailyLimit = () => {
    console.log('🚨 SIMULANDO LIMITE DIÁRIO EXCEDIDO');

    // Simular resultado de limite diário
    const mockResult = {
        orderNumber: `LIMIT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        customer: 'Sistema Fast',
        totalValue: 0,
        totalPoints: 0,
        items: [],
        allProducts: [],
        error: true,
        dailyLimitExceeded: true,
        errorMessage: 'Limite diário de análise de notas fiscais excedido. Tente novamente amanhã após 00:00h.',
        quotaExceeded: true
    };

    // Disparar evento customizado para atualizar a interface
    window.dispatchEvent(new CustomEvent('simulateDailyLimit', { detail: mockResult }));

    console.log('✅ Limite diário simulado! Verifique a interface.');
    console.log('💡 Para restaurar: window.resetDailyLimit()');
};

// Função para resetar simulação
window.resetDailyLimit = () => {
    console.log('🔄 RESETANDO SIMULAÇÃO');
    window.dispatchEvent(new CustomEvent('resetDailyLimit'));
    console.log('✅ Simulação resetada!');
};

// Instruções
console.log(`
🧪 TESTE DE LIMITE DIÁRIO DISPONÍVEL

Para testar:
1. window.testDailyLimit() - Simula limite excedido
2. window.resetDailyLimit() - Reseta simulação

Ou simplesmente faça upload de uma nota sem configurar APIs.
`);

// Auto-executar se não há APIs configuradas
if (!import.meta.env.VITE_OPENAI_API_KEY && !import.meta.env.VITE_ANTHROPIC_API_KEY) {
    console.log('📝 APIs não configuradas - sistema usará fallback automaticamente');
}
