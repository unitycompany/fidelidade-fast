/**
 * Serviço para comunicação com o servidor Python OCR REAL
 * Este servidor:
 * 1. Extrai TODO o texto da imagem via OCR
 * 2. Busca valores reais próximos aos produtos
 * 3. NÃO inventa valores padrão
 * 4. Retorna apenas produtos com valores encontrados
 */

const PYTHON_OCR_REAL_URL = 'http://localhost:5002';

export const checkOcrRealServiceHealth = async () => {
  try {
    const response = await fetch(`${PYTHON_OCR_REAL_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 segundos timeout
    });

    if (!response.ok) {
      throw new Error(`Servidor OCR Real retornou status ${response.status}`);
    }

    const healthData = await response.json();

    console.log('🏥 Health check OCR Real:', healthData);

    return {
      success: true,
      status: healthData.status,
      easyocrAvailable: healthData.easyocr_available,
      ocrReaderLoaded: healthData.ocr_reader_loaded,
      service: healthData.service
    };

  } catch (error) {
    console.error('❌ Erro no health check OCR Real:', error);
    return {
      success: false,
      error: error.message,
      available: false
    };
  }
};

export const analyzeOrderWithOcrReal = async (imageData, customerId = 'cliente') => {
  try {
    console.log('🚀 Iniciando análise OCR REAL...');
    console.log(`📊 Tamanho da imagem: ${imageData ? imageData.length : 0} chars`);

    const requestPayload = {
      image: imageData,
      customerId: customerId,
      fileType: 'image/jpeg'
    };

    console.log('📡 Enviando para servidor OCR Real...');

    const response = await fetch(`${PYTHON_OCR_REAL_URL}/process-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: AbortSignal.timeout(60000), // 60 segundos timeout para OCR
    });

    console.log(`📡 Resposta OCR Real: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Servidor OCR Real erro ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido no servidor OCR Real');
    }

    console.log('✅ Análise OCR REAL concluída');
    console.log(`📦 Produtos REAIS encontrados: ${result.data.products?.length || 0}`);
    console.log(`🎯 Pontos REAIS: ${result.data.totalPoints || 0}`);
    console.log(`💰 Valor REAL: R$ ${result.data.totalValue || 0}`);

    // Log dos produtos encontrados
    if (result.data.products && result.data.products.length > 0) {
      console.log('📋 Produtos com valores REAIS:');
      result.data.products.forEach((produto, index) => {
        console.log(`  ${index + 1}. ${produto.product_name}`);
        console.log(`     Valor: R$ ${produto.total_value?.toFixed(2) || '0.00'}`);
        console.log(`     Pontos: ${produto.points || 0}`);
        console.log(`     Método: ${produto.metodo || 'N/A'}`);
      });
    } else {
      console.log('⚠️ Nenhum produto com valor real foi identificado');
    }

    return {
      success: true,
      data: {
        ...result.data,
        produtos: result.data.products || [], // Normaliza nome
        processedBy: 'ocr-real',
        observacao: result.data.observacao || ''
      }
    };

  } catch (error) {
    console.error('❌ Erro na análise OCR REAL:', error);

    return {
      success: false,
      error: error.message,
      data: {
        produtos: [],
        totalPoints: 0,
        totalValue: 0,
        processedBy: 'ocr-real-error',
        observacao: `Erro no OCR Real: ${error.message}`
      }
    };
  }
};

export const testOcrRealWithImage = async (imageFile) => {
  try {
    console.log('🧪 Teste OCR Real iniciado...');

    // Converte arquivo para base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const result = await analyzeOrderWithOcrReal(base64, 'teste');

    console.log('🧪 Resultado do teste OCR Real:', result);

    return result;

  } catch (error) {
    console.error('❌ Erro no teste OCR Real:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  checkOcrRealServiceHealth,
  analyzeOrderWithOcrReal,
  testOcrRealWithImage
};
