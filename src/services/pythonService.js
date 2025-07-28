// Serviço para integração com API Python Completa
// Sistema autônomo que substitui completamente APIs externas como Gemini
// Inclui OCR avançado, reconhecimento inteligente de produtos e cálculo preciso de pontos

const PYTHON_API_URL = 'http://localhost:5001';

export const analyzeOrderWithPython = async (base64Image, fileType) => {
    try {
        console.log('[Python Complete] 🔍 Iniciando análise completa com sistema Python...');
        console.log('[Python Complete] 📊 Imagem tamanho:', Math.round(base64Image.length / 1024), 'KB');
        console.log('[Python Complete] 📋 Tipo do arquivo:', fileType);

        // Limpar base64 se necessário (remover prefixo data:image)
        const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
        console.log('[Python Complete] 🧹 Base64 limpo, tamanho:', Math.round(cleanBase64.length / 1024), 'KB');

        const payload = {
            image: cleanBase64,
            fileType: fileType || 'image/jpeg'
        };

        console.log('[Python Complete] 📦 Enviando payload para:', `${PYTHON_API_URL}/process-order`);
        console.log('[Python Complete] 📊 Tamanho do payload:', JSON.stringify(payload).length, 'bytes');

        // Criar um AbortController para timeout manual
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log('[Python Complete] ⏱️ Timeout de 30s atingido, abortando...');
            controller.abort();
        }, 30000);

        console.log('[Python Complete] 🌐 Fazendo requisição HTTP...');
        const startTime = Date.now();

        const response = await fetch(`${PYTHON_API_URL}/process-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const requestTime = Date.now() - startTime;
        console.log('[Python Complete] ⏱️ Tempo de resposta:', requestTime, 'ms');

        console.log('[Python Complete] 📊 Status da resposta:', response.status, response.statusText);
        console.log('[Python Complete] 📋 Headers da resposta:', Object.fromEntries(response.headers));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Python Complete] ❌ Erro HTTP:', response.status, errorText);
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        console.log('[Python Complete] 📥 Parseando resposta JSON...');
        const result = await response.json();

        console.log('[Python Complete] 📋 Resposta completa do servidor:', result);
        console.log('[Python Complete] 🔍 Campos presentes:', Object.keys(result));
        console.log('[Python Complete] ✅ Campo success:', result.success);
        console.log('[Python Complete] 📊 Campo data presente:', !!result.data);

        if (result.success && result.data) {
            console.log('[Python Complete] ✅ Análise concluída com sucesso!');
            console.log('[Python Complete] 📦 Produtos elegíveis:', result.data.products?.length || 0);
            console.log('[Python Complete] ⭐ Total de pontos:', result.data.totalPoints || 0);
            console.log('[Python Complete] 💰 Valor total:', `R$ ${result.data.totalValue || 0}`);
            console.log('[Python Complete] 🔧 Processado por:', result.data.processedBy);
            console.log('[Python Complete] 📝 OCR disponível:', result.data.ocrAvailable);

            // Verificar se há produtos identificados
            if (result.data.products && result.data.products.length > 0) {
                console.log('[Python Complete] 🎯 Produtos identificados:');
                result.data.products.forEach((product, index) => {
                    console.log(`  ${index + 1}. ${product.product_name} - ${product.points} pts (R$ ${product.total_value})`);
                });
            }

            return {
                success: true,
                data: {
                    // Formato compatível com o frontend
                    products: result.data.products || [],
                    totalPoints: result.data.totalPoints || 0,
                    orderNumber: result.data.orderNumber || `PYTHON-${Date.now()}`,
                    orderDate: result.data.orderDate || new Date().toISOString().split('T')[0],
                    totalValue: result.data.totalValue || 0,
                    customer: result.data.customer || 'Cliente Python',
                    processedBy: result.data.processedBy || 'python-complete',
                    allProducts: result.data.allProducts || [],
                    processingMethod: result.data.processingMethod || 'python_ocr',
                    ocrAvailable: result.data.ocrAvailable || false,
                    productsDatabaseSize: result.data.productsDatabaseSize || 0
                },
                metodo: 'python_complete_ocr'
            };
        } else {
            throw new Error(result.error || 'Erro desconhecido no processamento Python');
        }

    } catch (error) {
        console.error('[Python Complete] ❌ Erro na análise:', error);
        console.error('[Python Complete] 🔍 Tipo do erro:', error.name);
        console.error('[Python Complete] 📄 Mensagem completa:', error.message);
        console.error('[Python Complete] 📊 Stack trace:', error.stack);

        // Classificar o tipo de erro para melhor debugging
        let errorType = 'unknown';
        let errorMessage = error.message;

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorType = 'network';
            errorMessage = 'Erro de rede - servidor Python pode estar offline';
        } else if (error.name === 'AbortError') {
            errorType = 'timeout';
            errorMessage = 'Timeout - servidor Python não respondeu em 30s';
        } else if (error.message.includes('HTTP')) {
            errorType = 'http';
            errorMessage = `Erro HTTP - ${error.message}`;
        } else if (error.message.includes('JSON')) {
            errorType = 'parse';
            errorMessage = 'Erro ao processar resposta do servidor Python';
        }

        console.error('[Python Complete] 🏷️ Classificação do erro:', errorType);

        return {
            success: false,
            error: errorMessage,
            errorType: errorType,
            originalError: error.message,
            data: null
        };
    }
};

export const checkPythonServiceHealth = async () => {
    try {
        console.log('[Python Complete] 🔍 Verificando status do serviço...');

        // Usar AbortController para timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${PYTHON_API_URL}/health`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'ok') {
            console.log('[Python Complete] ✅ Serviço Python funcionando');
            console.log('[Python Complete] 📊 Status:', {
                ocr: result.ocr_available ? '✅' : '❌',
                opencv: result.opencv_available ? '✅' : '❌',
                produtos: result.products_database || 0
            });
            return true;
        } else {
            throw new Error('Status inválido');
        }
    } catch (error) {
        console.error('[Python Complete] ❌ Serviço indisponível:', error.message);

        // Log mais detalhado do erro
        if (error.name === 'AbortError') {
            console.error('[Python Complete] ⏱️ Timeout ao conectar com Python (5s)');
        } else if (error.name === 'TypeError') {
            console.error('[Python Complete] 🌐 Erro de conexão - servidor pode estar offline');
        }

        return false;
    }
};

export const testPythonOCR = async (base64Image) => {
    try {
        console.log('[Python Complete] 🧪 Testando apenas OCR...');

        const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

        const response = await fetch(`${PYTHON_API_URL}/test-ocr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: cleanBase64
            }),
            timeout: 20000
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('[Python Complete] ✅ OCR funcionando!');
            console.log('[Python Complete] 📝 Texto extraído:', result.length, 'caracteres');
            console.log('[Python Complete] 📄 Linhas:', result.lines);

            return {
                success: true,
                text: result.text,
                length: result.length,
                lines: result.lines,
                ocrAvailable: result.ocr_available
            };
        } else {
            throw new Error(result.error || 'Erro no OCR');
        }
    } catch (error) {
        console.error('[Python Complete] ❌ Erro no teste OCR:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
