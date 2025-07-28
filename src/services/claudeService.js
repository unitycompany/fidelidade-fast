import Anthropic from '@anthropic-ai/sdk'

class ClaudeService {
    constructor() {
        const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.REACT_APP_ANTHROPIC_API_KEY

        if (!apiKey) {
            throw new Error('VITE_ANTHROPIC_API_KEY não configurada')
        }

        this.anthropic = new Anthropic({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true // Para uso no browser
        })
    }

    // Prompt especializado para Claude
    getPromptNotaFiscal() {
        return `
Analise esta nota fiscal/pedido da Fast Sistemas e extraia TODOS os produtos em formato JSON.

INSTRUÇÕES:
1. Extraia TODOS os produtos (elegíveis e não elegíveis para pontos)
2. Para produtos elegíveis Fast Sistemas, calcule os pontos:
   - Placa ST: 0,5 pontos por R$1,00
   - Placa RU: 1 ponto por R$1,00  
   - Placa Glasroc X: 2 pontos por R$1,00
   - Placomix/Massa Drywall: 1 ponto por R$1,00
   - Malha Glasroc: 2 pontos por R$1,00
   - Basecoat: 2 pontos por R$1,00

3. Seja tolerante a erros de OCR (PLAGA = PLACA, O = 0, etc.)

FORMATO JSON OBRIGATÓRIO:
{
  "numeroPedido": "número",
  "dataEmissao": "DD/MM/YYYY", 
  "cliente": "nome cliente",
  "valorTotalPedido": 1234.56,
  "produtos": [
    {
      "nome": "Nome produto",
      "codigo": "Código",
      "quantidade": 10,
      "valorUnitario": 12.34,
      "valorTotal": 123.40
    }
  ],
  "produtosFast": [
    {
      "nome": "PLACA ST 13-1.80 M",
      "codigo": "DW00057", 
      "quantidade": 35,
      "valorUnitario": 33.20,
      "valorTotal": 1162.00,
      "pontosCalculados": 581,
      "categoria": "placa_st",
      "produtoOficial": "Placa ST"
    }
  ]
}

Responda APENAS com o JSON, sem texto adicional.
`
    }

    async analyzeOrderDocument(base64Image, fileType = 'image/jpeg') {
        try {
            console.log('[Claude] Iniciando análise do documento...')

            // Claude usa formato diferente para imagens
            const imageData = base64Image.replace(/^data:image\/[a-z]+;base64,/, '')

            const response = await this.anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022", // Modelo mais recente
                max_tokens: 4000,
                temperature: 0.1,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "image",
                                source: {
                                    type: "base64",
                                    media_type: fileType === 'application/pdf' ? 'application/pdf' : 'image/jpeg',
                                    data: imageData
                                }
                            },
                            {
                                type: "text",
                                text: this.getPromptNotaFiscal()
                            }
                        ]
                    }
                ]
            })

            const content = response.content[0].text
            console.log('[Claude] Resposta recebida:', content)

            try {
                const result = JSON.parse(content)
                console.log('[Claude] Resultado parseado:', result)

                return {
                    success: true,
                    data: result,
                    usage: response.usage,
                    model: 'claude-3-5-sonnet'
                }
            } catch (parseError) {
                console.error('[Claude] Erro ao fazer parse do JSON:', parseError)
                return {
                    success: false,
                    error: 'Erro ao processar resposta da IA: JSON inválido',
                    rawResponse: content
                }
            }

        } catch (error) {
            console.error('[Claude] Erro na API:', error)

            if (error.status === 429) {
                return {
                    success: false,
                    error: 'Limite de requisições excedido. Tente novamente em alguns minutos.',
                    status: 429
                }
            } else if (error.status === 401) {
                return {
                    success: false,
                    error: 'Chave da API Anthropic inválida ou expirada.',
                    status: 401
                }
            } else if (error.status === 402) {
                return {
                    success: false,
                    error: 'Créditos da Anthropic esgotados. Verifique sua conta.',
                    status: 402
                }
            } else {
                return {
                    success: false,
                    error: error.message || 'Erro desconhecido na Anthropic API',
                    status: error.status || 500
                }
            }
        }
    }

    async checkHealth() {
        try {
            // Claude não tem endpoint de health, vamos fazer uma requisição simples
            const response = await this.anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 10,
                messages: [
                    {
                        role: "user",
                        content: "Test"
                    }
                ]
            })

            return {
                success: true,
                available: true,
                model: 'claude-3-5-sonnet-20241022'
            }
        } catch (error) {
            console.error('[Claude] Health check failed:', error)
            return {
                success: false,
                available: false,
                error: error.message
            }
        }
    }
}

// Função principal para análise de pedidos
export const analyzeOrderWithClaude = async (base64Image, fileType = 'image/jpeg') => {
    try {
        const service = new ClaudeService()
        return await service.analyzeOrderDocument(base64Image, fileType)
    } catch (error) {
        console.error('Erro ao inicializar Claude Service:', error)
        return {
            success: false,
            error: error.message || 'Erro ao inicializar serviço Claude'
        }
    }
}

// Verificar disponibilidade do serviço
export const checkClaudeServiceHealth = async () => {
    try {
        const service = new ClaudeService()
        return await service.checkHealth()
    } catch (error) {
        console.error('Erro ao verificar Claude:', error)
        return {
            success: false,
            available: false,
            error: error.message
        }
    }
}

export default ClaudeService
