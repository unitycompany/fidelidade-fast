import Tesseract from 'tesseract.js'

// Função simples e direta para extrair texto de imagens
export const extrairTextoDeImagem = async (imageData) => {
    try {
        console.log('[OCR] Iniciando extração de texto...')

        // Limpar base64 se necessário
        const cleanBase64 = imageData.replace(/^data:image\/[a-z]+;base64,/, '')

        console.log('[OCR] Processando imagem com Tesseract...')
        console.log('[OCR] Tamanho da imagem:', cleanBase64.length)

        // Usar Tesseract de forma simples sem worker persistente
        const { data: { text, confidence } } = await Tesseract.recognize(
            `data:image/jpeg;base64,${cleanBase64}`,
            'por+eng'
        )

        console.log('[OCR] Texto extraído com sucesso!')
        console.log('[OCR] Confiança:', Math.round(confidence), '%')
        console.log('[OCR] Tamanho do texto:', text.length)
        console.log('[OCR] Primeiros 300 caracteres:', text.substring(0, 300))

        if (!text || text.trim().length === 0) {
            throw new Error('Nenhum texto foi extraído da imagem')
        }

        // Análise básica do conteúdo
        const analise = {
            temNumeros: /\d/.test(text),
            temValores: /R\$|\$|[0-9]+[,\.][0-9]{2}/.test(text),
            temProdutos: /placa|drywall|gesso|perfil|montante|guia|glasroc|placomix/i.test(text),
            temDatas: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text)
        }

        console.log('[OCR] Análise do conteúdo:', analise)

        return {
            success: true,
            text: text.trim(),
            confidence: confidence || 0,
            analysis: analise,
            method: 'tesseract_simple'
        }

    } catch (error) {
        console.error('[OCR] Erro na extração:', error)
        return {
            success: false,
            error: error.message || 'Erro desconhecido no OCR',
            text: null,
            confidence: 0
        }
    }
}

// Função de teste
export const testarOCR = async (imageData) => {
    console.log('[OCR Test] Testando OCR...')
    return await extrairTextoDeImagem(imageData)
}

export default { extrairTextoDeImagem, testarOCR }
