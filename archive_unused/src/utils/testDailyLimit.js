// Teste para simular limite diário excedido
// Este arquivo simula o comportamento quando todas as APIs falham

export const simulateAllAPIsFailure = () => {
    console.log('🚨 SIMULANDO LIMITE DIÁRIO EXCEDIDO - Todas as APIs falharão');

    // Sobrescrever funções temporariamente
    const originalOpenAI = window.analyzeOrderWithOpenAI;
    const originalClaude = window.analyzeOrderWithClaude;
    const originalOCR = window.analyzeOrderWithOcrReal;
    const originalGemini = window.analyzeOrderWithGemini;

    // Simular falha em todas as APIs
    window.analyzeOrderWithOpenAI = async () => {
        throw new Error('429 - Rate limit exceeded. Try again tomorrow.');
    };

    window.analyzeOrderWithClaude = async () => {
        throw new Error('429 - Usage limit reached for today.');
    };

    window.analyzeOrderWithOcrReal = async () => {
        return { success: false, error: 'OCR service temporarily unavailable' };
    };

    window.analyzeOrderWithGemini = async () => {
        throw new Error('resource_exhausted: Quota exceeded');
    };

    console.log('✅ Simulação ativada - próximo upload falhará com limite diário');

    // Retornar função para restaurar comportamento original
    return () => {
        window.analyzeOrderWithOpenAI = originalOpenAI;
        window.analyzeOrderWithClaude = originalClaude;
        window.analyzeOrderWithOcrReal = originalOCR;
        window.analyzeOrderWithGemini = originalGemini;
        console.log('🔄 Comportamento original restaurado');
    };
};

export const resetAllAPIs = () => {
    delete window.analyzeOrderWithOpenAI;
    delete window.analyzeOrderWithClaude;
    delete window.analyzeOrderWithOcrReal;
    delete window.analyzeOrderWithGemini;
    console.log('🔄 Todas as APIs resetadas para comportamento padrão');
};
