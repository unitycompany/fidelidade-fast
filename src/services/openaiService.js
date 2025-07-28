import OpenAI from 'openai'

class OpenAIService {
    constructor() {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.REACT_APP_OPENAI_API_KEY

        if (!apiKey) {
            throw new Error('VITE_OPENAI_API_KEY não configurada')
        }

        this.openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true // Para uso no browser (não recomendado em produção)
        })
    }

    // Prompt especializado para análise de notas fiscais Fast Sistemas
    getPromptNotaFiscal() {
        return `
ANÁLISE COMPLETA DE DOCUMENTOS COMERCIAIS - FAST SISTEMAS

Você é um especialista em análise de documentos da construção civil. Sua missão é extrair TODOS os produtos da nota/pedido, não apenas os elegíveis.

ETAPA 1 - EXTRAÇÃO COMPLETA:
1. Leia TODO o documento linha por linha
2. Identifique TODOS os produtos listados (elegíveis E não elegíveis)
3. Para cada produto, extraia: código, descrição, quantidade, valor unitário, valor total
4. NÃO ignore produtos - liste TUDO que encontrar

ETAPA 2 - CLASSIFICAÇÃO:
Produtos Fast Sistemas elegíveis para pontos:
- Placa ST (códigos: DW00057, DW00058, ST-*) → 0,5 pontos por R$1,00
- Placa RU (códigos: DW00007, DW00075, RU-*) → 1 ponto por R$1,00
- Placa Glasroc X (códigos: GR00001, GR00002, GLASROC*) → 2 pontos por R$1,00
- Placomix/Massa Drywall (códigos: PM00001, PM00002, DW00078, PLACOMIX*) → 1 ponto por R$1,00
- Malha Glasroc (códigos: MT00001, MT00002, MALHA*GLASROC*) → 2 pontos por R$1,00
- Basecoat (códigos: BC00001, BC00002, BASECOAT*) → 2 pontos por R$1,00

ETAPA 3 - TOLERÂNCIA A ERROS OCR:
- "PLAGA ST" = "PLACA ST"
- "DW0O057" = "DW00057" (O maiúsculo = zero)
- "1OO,OO" = "100,00" (O maiúsculo = zero)
- Aceite variações de grafia e espaços

REGRAS DE EXTRAÇÃO:
1. Se encontrar tabela de produtos, liste TODOS
2. Se quantidade não especificada = 1
3. Se valor não claro, use qualquer valor numérico da linha
4. Se código ausente, use descrição
5. NUNCA ignore um produto por falta de dados

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "numeroPedido": "número do pedido/nota",
  "dataEmissao": "DD/MM/YYYY",
  "cliente": "nome do cliente",
  "valorTotalPedido": 1234.56,
  "produtos": [
    {
      "nome": "Nome exato do produto",
      "codigo": "Código se disponível",
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

IMPORTANTE:
- "produtos": TODOS os produtos encontrados
- "produtosFast": APENAS os elegíveis para pontos
- Calcule os pontos: pontosCalculados = Math.floor(valorTotal * pontosPorReal)
- Seja preciso com valores numéricos
- Se não encontrar dados, retorne arrays vazios mas mantenha a estrutura
`
    }

    async analyzeOrderDocument(base64Image, fileType = 'image/jpeg') {
        try {
            console.log('[OpenAI] Iniciando análise do documento...')

            // Preparar a mensagem com a imagem
            const messages = [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: this.getPromptNotaFiscal()
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Image,
                                detail: "high" // Para melhor qualidade de análise
                            }
                        }
                    ]
                }
            ]

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o", // GPT-4 Omni (mais recente e barato)
                messages: messages,
                max_tokens: 4000,
                temperature: 0.1, // Baixa criatividade para precisão
                response_format: { type: "json_object" }
            })

            const content = response.choices[0].message.content
            console.log('[OpenAI] Resposta recebida:', content)

            try {
                const result = JSON.parse(content)
                console.log('[OpenAI] Resultado parseado:', result)

                return {
                    success: true,
                    data: result,
                    usage: response.usage,
                    model: 'gpt-4o'
                }
            } catch (parseError) {
                console.error('[OpenAI] Erro ao fazer parse do JSON:', parseError)
                return {
                    success: false,
                    error: 'Erro ao processar resposta da IA: JSON inválido',
                    rawResponse: content
                }
            }

        } catch (error) {
            console.error('[OpenAI] Erro na API:', error)

            // Tratar diferentes tipos de erro
            if (error.status === 429) {
                return {
                    success: false,
                    error: 'Limite de requisições excedido. Tente novamente em alguns minutos.',
                    status: 429
                }
            } else if (error.status === 401) {
                return {
                    success: false,
                    error: 'Chave da API OpenAI inválida ou expirada.',
                    status: 401
                }
            } else if (error.status === 402) {
                return {
                    success: false,
                    error: 'Créditos da OpenAI esgotados. Verifique sua conta.',
                    status: 402
                }
            } else {
                return {
                    success: false,
                    error: error.message || 'Erro desconhecido na OpenAI API',
                    status: error.status || 500
                }
            }
        }
    }

    // Verificar se o serviço está funcionando
    async checkHealth() {
        try {
            const response = await this.openai.models.list()
            return {
                success: true,
                available: true,
                models: response.data.map(m => m.id)
            }
        } catch (error) {
            console.error('[OpenAI] Health check failed:', error)
            return {
                success: false,
                available: false,
                error: error.message
            }
        }
    }
}

// Função principal para análise de pedidos
export const analyzeOrderWithOpenAI = async (base64Image, fileType = 'image/jpeg') => {
    try {
        const service = new OpenAIService()
        return await service.analyzeOrderDocument(base64Image, fileType)
    } catch (error) {
        console.error('Erro ao inicializar OpenAI Service:', error)
        return {
            success: false,
            error: error.message || 'Erro ao inicializar serviço OpenAI'
        }
    }
}

// Verificar disponibilidade do serviço
export const checkOpenAIServiceHealth = async () => {
    try {
        const service = new OpenAIService()
        return await service.checkHealth()
    } catch (error) {
        console.error('Erro ao verificar OpenAI:', error)
        return {
            success: false,
            available: false,
            error: error.message
        }
    }
}

export default OpenAIService
