// Serviço Python com Retry e Melhor Tratamento de Erros
// Versão robusta para substituir o pythonService.js atual

const PYTHON_API_URL = 'http://localhost:5001';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// Função auxiliar para delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função auxiliar para fazer requisições com retry
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`[Python Robust] 🔄 Tentativa ${attempt}/${retries} para ${url}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log(`[Python Robust] ⏱️ Timeout na tentativa ${attempt}`);
                controller.abort();
            }, 30000);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                console.log(`[Python Robust] ✅ Sucesso na tentativa ${attempt}`);
                return response;
            } else {
                console.log(`[Python Robust] ❌ HTTP ${response.status} na tentativa ${attempt}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

        } catch (error) {
            console.log(`[Python Robust] ❌ Erro na tentativa ${attempt}: ${error.message}`);

            if (attempt === retries) {
                throw error; // Re-throw no último attempt
            }

            // Delay progressivo: 1s, 2s, 3s...
            const delayTime = RETRY_DELAY * attempt;
            console.log(`[Python Robust] ⏱️ Aguardando ${delayTime}ms antes da próxima tentativa...`);
            await delay(delayTime);
        }
    }
}

export const analyzeOrderWithPythonRobust = async (base64Image, fileType) => {
    console.log('[Python Robust] 🚀 Iniciando análise robusta...');
    console.log('[Python Robust] 📊 Tamanho da imagem:', Math.round(base64Image.length / 1024), 'KB');

    try {
        // 1. Verificar se o servidor está respondendo
        console.log('[Python Robust] 🔍 Verificando conectividade...');
        const healthCheck = await fetchWithRetry(`${PYTHON_API_URL}/health`, {
            method: 'GET'
        }, 2); // Só 2 tentativas para health

        const healthResult = await healthCheck.json();
        console.log('[Python Robust] ✅ Servidor está online:', healthResult.status);

        // 2. Preparar dados
        const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

        const payload = {
            image: cleanBase64,
            fileType: fileType || 'image/jpeg'
        };

        console.log('[Python Robust] 📦 Payload preparado, tamanho:', JSON.stringify(payload).length, 'bytes');

        // 3. Fazer requisição principal com retry
        console.log('[Python Robust] 🔄 Enviando para processamento...');
        const response = await fetchWithRetry(`${PYTHON_API_URL}/process-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        // 4. Processar resposta
        console.log('[Python Robust] 📥 Processando resposta...');
        const result = await response.json();

        console.log('[Python Robust] 📋 Resposta recebida:', {
            success: result.success,
            hasData: !!result.data,
            campos: Object.keys(result),
            dataFields: result.data ? Object.keys(result.data) : []
        });

        // 5. Validar estrutura
        if (!result.hasOwnProperty('success')) {
            throw new Error('Resposta inválida: campo "success" ausente');
        }

        if (!result.success) {
            throw new Error(result.error || 'Processamento falhou no servidor Python');
        }

        if (!result.data) {
            throw new Error('Resposta inválida: campo "data" ausente');
        }

        // 6. Validar dados essenciais
        const data = result.data;
        if (!Array.isArray(data.products)) {
            console.warn('[Python Robust] ⚠️ Campo products não é array, corrigindo...');
            data.products = [];
        }

        if (typeof data.totalPoints !== 'number') {
            console.warn('[Python Robust] ⚠️ Campo totalPoints inválido, corrigindo...');
            data.totalPoints = 0;
        }

        if (typeof data.totalValue !== 'number') {
            console.warn('[Python Robust] ⚠️ Campo totalValue inválido, corrigindo...');
            data.totalValue = 0;
        }

        // 7. Formatar resposta padronizada
        const response_formatted = {
            success: true,
            data: {
                products: data.products,
                totalPoints: data.totalPoints,
                orderNumber: data.orderNumber || `PYTHON-${Date.now()}`,
                orderDate: data.orderDate || new Date().toISOString().split('T')[0],
                totalValue: data.totalValue,
                customer: data.customer || 'Cliente Python',
                processedBy: data.processedBy || 'python-robust',
                allProducts: data.allProducts || data.products,
                processingMethod: data.processingMethod || 'python_robust_ocr',
                ocrAvailable: data.ocrAvailable || false,
                productsDatabaseSize: data.productsDatabaseSize || 0
            },
            metodo: 'python_robust',
            timestamp: new Date().toISOString()
        };

        console.log('[Python Robust] ✅ Análise concluída com sucesso!');
        console.log('[Python Robust] 📦 Produtos encontrados:', response_formatted.data.products.length);
        console.log('[Python Robust] ⭐ Total de pontos:', response_formatted.data.totalPoints);
        console.log('[Python Robust] 💰 Valor total:', `R$ ${response_formatted.data.totalValue}`);

        return response_formatted;

    } catch (error) {
        console.error('[Python Robust] ❌ Erro na análise robusta:', error);
        console.error('[Python Robust] 🔍 Detalhes do erro:', {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n')[0] // Primeira linha do stack
        });

        return {
            success: false,
            error: error.message,
            errorType: error.name,
            data: null,
            timestamp: new Date().toISOString()
        };
    }
};

export const checkPythonServiceHealthRobust = async () => {
    try {
        console.log('[Python Robust] 🔍 Verificação robusta de saúde...');

        const response = await fetchWithRetry(`${PYTHON_API_URL}/health`, {
            method: 'GET'
        }, 2);

        const result = await response.json();

        console.log('[Python Robust] ✅ Saúde verificada:', result);

        return result.status === 'ok';

    } catch (error) {
        console.error('[Python Robust] ❌ Falha na verificação de saúde:', error.message);
        return false;
    }
};

// Manter compatibilidade com os nomes originais
export const analyzeOrderWithPython = analyzeOrderWithPythonRobust;
export const checkPythonServiceHealth = checkPythonServiceHealthRobust;
