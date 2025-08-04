import { GoogleGenerativeAI } from '@google/generative-ai'

class GeminiService {
    constructor() {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.REACT_APP_GEMINI_API_KEY

        if (!apiKey) {
            throw new Error('VITE_GEMINI_API_KEY não configurada')
        }

        this.genAI = new GoogleGenerativeAI(apiKey)
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    }

    // Prompt especializado para Pedidos de Vendas Fast Sistemas
    getPromptNotaFiscal() {
        return `
ANÁLISE COMPLETA DE DOCUMENTOS COMERCIAIS - FAST SISTEMAS

Você é um especialista em análise de documentos da construção civil. Sua missão é extrair TODOS os produtos da nota/pedido, não apenas os elegíveis.

ETAPA 1 - EXTRAÇÃO COMPLETA:
1. Leia TODO o documento linha por linha
2. Identifique TODOS os produtos listados (elegíveis E não elegíveis)
3. Para cada produto, extraia: código, descrição, quantidade, valor unitário, valor total
4. NÃO ignore produtos - liste TUDO que encontrar

ETAPA 2 - CÓDIGO DE BARRAS E CHAVE NFE:
1. Procure por códigos de barras (sequências longas de números)
2. Procure por "Chave de Acesso NFe" ou similar
3. Se encontrar código de barras, extraia TODOS os números
4. Códigos de barras NFe têm 44 dígitos numéricos

ETAPA 3 - CLASSIFICAÇÃO:
Produtos Fast Sistemas elegíveis para pontos:
- Placa ST (DW00057, DW00058) → 0,5 pontos/R$
- Guia Drywall (DW00074) → 1 ponto/R$
- Montante Drywall (DW00087) → 1 ponto/R$
- Placa RU (DW00007, DW00075) → 1 ponto/R$
- Placa Glasroc X (GR00001, GR00002) → 2 pontos/R$
- Placomix (PM00001, PM00002) → 1 ponto/R$
- Malha Glasroc (MT00001, MT00002) → 2 pontos/R$
- Basecoat (BC00001, BC00002) → 2 pontos/R$

ETAPA 4 - TOLERÂNCIA A ERROS OCR:
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
6. SEMPRE extraia códigos de barras e chaves NFe quando visíveis

IMPORTANTE - EXTRAÇÃO MÁXIMA:
- Prefira incluir produtos com dados incompletos a perdê-los
- Se ver "ITEM 1, ITEM 2, ITEM 3..." liste todos
- Se ver lista numerada, extraia todos os itens
- Se tabela tem 10+ linhas, retorne 10+ produtos
- Foque em produtos de construção a seco/drywall
- Calcule pontos conservadoramente
- Se houver dúvida sobre elegibilidade, inclua com observação

RETORNE APENAS JSON VÁLIDO com TODOS os produtos encontrados:
{
  "numeroPedido": "número encontrado ou 'N/A'",
  "dataEmissao": "data no formato dd/mm/aaaa",
  "fornecedor": "nome do fornecedor",
  "cliente": "nome do cliente",
  "valorTotalPedido": 0.00,
  "produtos": [
    {
      "sequencia": 1,
      "codigo": "código do produto ou 'N/A'",
      "nome": "descrição COMPLETA do produto",
      "descricao": "descrição detalhada",
      "unidade": "UN/M2/ML/KG",
      "quantidade": 1,
      "valorUnitario": 0.00,
      "valorTotal": 0.00,
      "categoria": "construção/material/outros",
      "observacao": "detalhes extras se houver"
    }
  ],
  "produtosFast": [
    {
      "sequencia": 1,
      "codigo": "código do produto",
      "nome": "descrição do produto Fast",
      "produtoOficial": "categoria Fast identificada",
      "unidade": "unidade",
      "quantidade": 1,
      "valorUnitario": 0.00,
      "valorTotal": 0.00,
      "pontosPorReal": 0.5,
      "pontosCalculados": 0,
      "categoria": "drywall/glasroc/acabamento"
    }
  ],
  "resumo": {
    "totalProdutos": 0,
    "totalProdutosFast": 0.00,
    "totalPontosGanhos": 0,
    "produtosElegiveis": 0,
    "produtosTotais": 0
  },
  "debug": {
    "produtosExtraidos": 0,
    "linhasAnalisadas": 0,
    "confiancaExtracao": 85
  }
}

⚠️ ATENÇÃO: RETORNE APENAS JSON VÁLIDO!
- Use APENAS aspas duplas (")
- NÃO adicione comentários
- NÃO use aspas simples (')
- NÃO coloque vírgulas extras
- NÃO adicione texto antes ou depois do JSON
- TESTE o JSON mentalmente antes de enviar

FORMATO FINAL OBRIGATÓRIO:
{"numeroPedido":"valor","dataEmissao":"valor",...}
`
    }

    // Prompt especializado para análise de TEXTO extraído por OCR
    getPromptTextoOCR() {
        return `
Você é um especialista em análise de TEXTO EXTRAÍDO de documentos comerciais da construção civil, especialmente da Fast Sistemas Construtivos.

O texto foi extraído por OCR e pode conter alguns erros ou formatação irregular. Sua tarefa é interpretar e estruturar as informações.

PRODUTOS ELEGÍVEIS FAST e PONTUAÇÃO:
- Placa ST (qualquer variação: PLACA ST, DW00057, etc.) → 0,5 pontos por R$ 1,00
- Placa RU (qualquer variação: GUIA DRYWALL, MONTANTE DRYWALL, DW00074, DW00007, etc.) → 1 ponto por R$ 1,00  
- Placa Glasroc X (qualquer variação) → 2 pontos por R$ 1,00
- Placomix (qualquer variação) → 1 ponto por R$ 1,00
- Malha telada para Glasroc X → 2 pontos por R$ 1,00
- Basecoat (massa para Glasroc X) → 2 pontos por R$ 1,00

PALAVRAS-CHAVE PARA IDENTIFICAR PRODUTOS FAST:
- PLACA, DRYWALL, GESSO, STEEL FRAME
- GUIA, MONTANTE, PERFIL
- GLASROC, PLACOMIX
- Códigos: DW, BD, ST, RU

INSTRUÇÕES PARA ANÁLISE DE TEXTO OCR:
1. Ignore erros menores de OCR (letras trocadas, espaços extras)
2. Procure padrões de números, valores em R$, códigos de produto
3. Identifique informações básicas: número do documento, data, empresa
4. Encontre tabelas de produtos (mesmo com formatação irregular)
5. Calcule pontos baseado nos produtos encontrados
6. Seja tolerante com variações de nomes de produtos

IMPORTANTE - TOLERÂNCIA A ERROS OCR:
- "PLAGA ST" pode ser "PLACA ST"
- "DW0O057" pode ser "DW00057" 
- "R$ 1OO,OO" pode ser "R$ 100,00"
- Números podem ter O no lugar de 0

EXTRAÇÃO DE QUANTIDADES E VALORES:
- Procure números antes dos nomes de produtos (ex: "2 PLACA ST")
- Se não encontrar quantidade explícita, assume 1 unidade
- Valores podem estar em formatos: R$ 100,00 | 100.00 | 10000 (centavos)
- Se valor total for conhecido mas unitário não, calcule: total/quantidade
- Se só tiver valor total sem quantidade, assume quantidade 1

REGRA IMPORTANTE: Se identificar produto Fast mas não conseguir quantidade/valor exatos:
- Quantidade: assuma 1 se não especificada
- Valor: use valor total encontrado na linha do produto
- Pontos: calcule sempre, mesmo com dados incompletos

EXEMPLO DE ANÁLISE:
Texto OCR: "O BNOOOSTEPLACASTIR- IAMOS pio oo mwa R$ 252,00"
Interpretação: Produto "PLACA ST", valor R$ 252,00, quantidade 1 (não especificada)
Resultado: quantidade=1, valorTotal=252.00, pontosCalculados=126 (252*0.5)

RETORNE APENAS JSON VÁLIDO:
{
  "numeroPedido": "número encontrado ou 'N/A'",
  "dataEmissao": "data no formato dd/mm/aaaa ou 'N/A'",
  "fornecedor": "nome do fornecedor ou 'N/A'",
  "cliente": "nome do cliente ou 'N/A'",
  "valorTotalPedido": 0.00,
  "produtosFast": [
    {
      "sequencia": 1,
      "codigo": "código do produto ou 'N/A'",
      "nome": "descrição do produto",
      "produtoOficial": "categoria Fast identificada",
      "unidade": "unidade de medida ou 'UN'",
      "quantidade": 0,
      "valorUnitario": 0.00,
      "valorTotal": 0.00,
      "pontosPorReal": 0.5,
      "pontosCalculados": 0,
      "categoria": "drywall",
      "observacao": "produto identificado via OCR"
    }
  ],
  "outrosProdutos": [
    {
      "codigo": "código ou 'N/A'",
      "nome": "descrição",
      "valorTotal": 0.00,
      "motivo": "não elegível para pontos"
    }
  ],
  "resumo": {
    "totalProdutosFast": 0.00,
    "totalOutrosProdutos": 0.00,
    "totalPontosGanhos": 0,
    "produtosElegiveis": 0,
    "produtosNaoElegiveis": 0
  },
  "validacoes": {
    "formatoValido": true,
    "calculosCorretos": true,
    "confianca": 85,
    "observacoes": "análise baseada em texto OCR",
    "metodoExtracao": "ocr_tesseract"
  }
}

RETORNE APENAS JSON, SEM TEXTO ADICIONAL!
`
    }

    // Processar nota fiscal com IA
    async processarNotaFiscal(imagemBase64) {
        try {
            console.log('[Gemini] Preparando chamada para API...');
            console.log('[Gemini] Tamanho da imagem base64:', imagemBase64.length);
            console.log('[Gemini] API Key configurada:', !!this.genAI.apiKey);

            // Detectar tipo de imagem baseado no base64
            let mimeType = "image/jpeg"; // padrão
            if (imagemBase64.startsWith('/9j/')) {
                mimeType = "image/jpeg";
            } else if (imagemBase64.startsWith('iVBORw0KGgo')) {
                mimeType = "image/png";
            } else if (imagemBase64.startsWith('R0lGOD')) {
                mimeType = "image/gif";
            } else if (imagemBase64.startsWith('UklGR')) {
                mimeType = "image/webp";
            }

            console.log('[Gemini] Tipo MIME detectado:', mimeType);

            // Preparar dados da imagem
            const imagePart = {
                inlineData: {
                    data: imagemBase64,
                    mimeType: mimeType
                }
            };

            console.log('[Gemini] Enviando para análise...');
            console.log('[Gemini] Prompt length:', this.getPromptNotaFiscal().length);

            const result = await this.model.generateContent([
                this.getPromptNotaFiscal(),
                imagePart
            ]);

            const response = await result.response;
            const text = response.text();

            console.log('[Gemini] Resposta recebida (primeiros 500 chars):', text.substring(0, 500));
            console.log('[Gemini] Resposta completa:', text);

            // Extrair JSON da resposta
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('[Gemini] Falha ao extrair JSON. Resposta completa:', text);
                throw new Error(`JSON não encontrado na resposta. Resposta: ${text.substring(0, 200)}...`);
            }

            console.log('[Gemini] JSON extraído bruto:', jsonMatch[0]);

            // Função para limpar e corrigir JSON comum da IA
            const limparJSON = (jsonString) => {
                try {
                    // Tentar parsing direto primeiro
                    return JSON.parse(jsonString);
                } catch (error) {
                    console.log('[Gemini] Erro no JSON original, tentando correções automáticas...');

                    let jsonLimpo = jsonString;

                    // Correção 1: Remover comentários de linha
                    jsonLimpo = jsonLimpo.replace(/\/\/.*$/gm, '');

                    // Correção 2: Remover comentários de bloco
                    jsonLimpo = jsonLimpo.replace(/\/\*[\s\S]*?\*\//g, '');

                    // Correção 3: Corrigir aspas simples para aspas duplas em chaves
                    jsonLimpo = jsonLimpo.replace(/'([^']+)':/g, '"$1":');

                    // Correção 4: Corrigir valores com aspas simples
                    jsonLimpo = jsonLimpo.replace(/:\s*'([^']*)'/g, ': "$1"');

                    // Correção 5: Adicionar aspas em propriedades sem aspas
                    jsonLimpo = jsonLimpo.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

                    // Correção 6: Remover vírgulas extras antes de }
                    jsonLimpo = jsonLimpo.replace(/,(\s*[}\]])/g, '$1');

                    // Correção 7: Corrigir true/false sem aspas (manter como boolean)
                    jsonLimpo = jsonLimpo.replace(/:\s*"(true|false)"/g, ': $1');

                    // Correção 8: Corrigir números com aspas desnecessárias
                    jsonLimpo = jsonLimpo.replace(/:\s*"(\d+\.?\d*)"/g, ': $1');

                    console.log('[Gemini] JSON após correções:', jsonLimpo);

                    // Tentar parsing novamente
                    try {
                        return JSON.parse(jsonLimpo);
                    } catch (secondError) {
                        console.error('[Gemini] Falha mesmo após correções:', secondError);
                        console.error('[Gemini] JSON problemático:', jsonLimpo);
                        throw new Error(`JSON inválido mesmo após correções automáticas: ${secondError.message}`);
                    }
                }
            };

            const dadosExtraidos = limparJSON(jsonMatch[0]);
            console.log('[Gemini] Dados extraídos após limpeza:', dadosExtraidos);

            // Validação mais flexível para debug
            const validarPedido = (dadosExtraidos) => {
                const erros = [];
                const warnings = [];

                // Validar valor total (warning apenas)
                if (!dadosExtraidos.valorTotalPedido || dadosExtraidos.valorTotalPedido <= 0) {
                    warnings.push('Valor total inválido ou não encontrado');
                }

                // Validar produtos Fast (warning apenas para debug)
                if (!dadosExtraidos.produtosFast || dadosExtraidos.produtosFast.length === 0) {
                    warnings.push('Nenhum produto Fast identificado - pode ser documento sem produtos elegíveis');
                }

                // Validar data do pedido - mais flexível
                if (dadosExtraidos.dataEmissao && dadosExtraidos.dataEmissao !== 'N/A') {
                    const dataPedido = new Date(dadosExtraidos.dataEmissao);
                    if (isNaN(dataPedido.getTime())) {
                        warnings.push('Data do pedido em formato inválido');
                    }
                }

                console.log('[Gemini] Warnings de validação:', warnings);
                return erros; // Retorna apenas erros críticos, warnings são só informativos
            };

            const errosValidacao = validarPedido(dadosExtraidos);
            if (errosValidacao.length > 0) {
                console.error('[Gemini] Erros de validação:', errosValidacao);
                throw new Error(errosValidacao.join(', '));
            }

            console.log('[Gemini] Dados processados com sucesso:', dadosExtraidos);

            return {
                sucesso: true,
                dados: dadosExtraidos,
                rawText: text, // Incluir resposta completa para validação anti-fraude
                confianca: dadosExtraidos.validacoes?.confianca || 0,
                metodo: 'gemini_visao'
            };

        } catch (error) {
            console.error('[Gemini] Erro no processamento:', error);
            return {
                sucesso: false,
                erro: error.message,
                dados: null
            };
        }
    }

    // Processar texto extraído por OCR
    async processarTextoOCR(textoExtraido) {
        try {
            console.log('[Gemini OCR] Preparando análise de texto...');

            // Validar entrada
            if (!textoExtraido) {
                throw new Error('Texto extraído está vazio ou nulo');
            }

            if (typeof textoExtraido !== 'string') {
                console.log('[Gemini OCR] Tipo recebido:', typeof textoExtraido);
                console.log('[Gemini OCR] Valor recebido:', textoExtraido);
                throw new Error(`Texto extraído deve ser uma string, recebido: ${typeof textoExtraido}`);
            }

            if (textoExtraido.trim().length === 0) {
                throw new Error('Texto extraído está vazio após limpeza');
            }

            console.log('[Gemini OCR] Tamanho do texto:', textoExtraido.length);
            console.log('[Gemini OCR] Texto (primeiros 500 chars):', textoExtraido.substring(0, 500));

            const promptCompleto = `${this.getPromptTextoOCR()}

TEXTO EXTRAÍDO PARA ANÁLISE:
${textoExtraido}

Analise o texto acima e retorne o JSON estruturado conforme especificado.`;

            console.log('[Gemini OCR] Enviando para análise...');

            const result = await this.model.generateContent(promptCompleto);
            const response = await result.response;
            const text = response.text();

            console.log('[Gemini OCR] Resposta recebida (primeiros 500 chars):', text.substring(0, 500));
            console.log('[Gemini OCR] Resposta completa:', text);

            // Extrair JSON da resposta
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('[Gemini OCR] Falha ao extrair JSON. Resposta completa:', text);
                throw new Error(`JSON não encontrado na resposta. Resposta: ${text.substring(0, 200)}...`);
            }

            console.log('[Gemini OCR] JSON extraído:', jsonMatch[0]);

            // Validação flexível para texto OCR
            const validarTextoOCR = (dadosExtraidos) => {
                const warnings = [];

                // Validações menos rígidas para OCR
                if (!dadosExtraidos.valorTotalPedido || dadosExtraidos.valorTotalPedido <= 0) {
                    warnings.push('Valor total não encontrado ou inválido no texto OCR');
                }

                if (!dadosExtraidos.produtosFast || dadosExtraidos.produtosFast.length === 0) {
                    warnings.push('Nenhum produto Fast identificado no texto OCR');
                }

                console.log('[Gemini OCR] Warnings de validação:', warnings);
                return []; // Retorna sempre vazio para não bloquear
            };

            const dadosExtraidos = JSON.parse(jsonMatch[0]);
            console.log('[Gemini OCR] Dados extraídos antes da validação:', dadosExtraidos);

            const errosValidacao = validarTextoOCR(dadosExtraidos);
            if (errosValidacao.length > 0) {
                console.error('[Gemini OCR] Erros de validação:', errosValidacao);
                throw new Error(errosValidacao.join(', '));
            }

            console.log('[Gemini OCR] Dados processados com sucesso:', dadosExtraidos);

            return {
                sucesso: true,
                dados: dadosExtraidos,
                confianca: dadosExtraidos.validacoes?.confianca || 0,
                metodo: 'gemini_ocr_texto'
            };

        } catch (error) {
            console.error('[Gemini OCR] Erro no processamento:', error);
            return {
                sucesso: false,
                erro: error.message,
                dados: null
            };
        }
    }

    // Teste de conectividade
    async testarConexao() {
        try {
            console.log('[Gemini] Testando conectividade...');

            const result = await this.model.generateContent([
                "Responda apenas: 'Gemini conectado com sucesso'"
            ]);

            const response = await result.response;
            const text = response.text();

            console.log('[Gemini] Teste de conectividade bem-sucedido:', text);

            return {
                sucesso: true,
                resposta: text
            };

        } catch (error) {
            console.error('[Gemini] Erro no teste de conectividade:', error);
            return {
                sucesso: false,
                erro: error.message
            };
        }
    }
}

// Exportação individual para facilitar importação
const geminiService = new GeminiService();

export const analyzeOrderWithGemini = async (base64Image, fileType) => {
    try {
        console.log('[Gemini] Iniciando análise...', {
            base64Length: base64Image.length,
            fileType: fileType,
            hasApiKey: !!import.meta.env.VITE_GEMINI_API_KEY
        });

        // Limpar base64 
        let base64Clean = base64Image;
        if (base64Image.includes(',')) {
            base64Clean = base64Image.split(',')[1];
        }

        console.log('[Gemini] Base64 limpo, tamanho:', base64Clean.length);        // Verificar se é PDF
        if (fileType === 'application/pdf') {
            console.log('[Gemini] Detectado PDF - usando análise especializada');

            try {
                // Para PDF, usar prompt mais específico
                const pdfPrompt = `
ANÁLISE CRÍTICA DE DOCUMENTO PDF - ZERO DUPLICAÇÃO

REGRAS ABSOLUTAS:
1. CADA PRODUTO DEVE APARECER APENAS UMA VEZ
2. SE VER O MESMO PRODUTO/CÓDIGO REPETIDO, LISTE APENAS ONCE
3. SOME AS QUANTIDADES SE HOUVER REPETIÇÃO DO MESMO ITEM
4. VERIFIQUE CÓDIGOS DUPLICADOS ANTES DE FINALIZAR

PROCESSO DE ANÁLISE:
1. Leia TODO o documento página por página
2. Identifique a TABELA PRINCIPAL de produtos (ignore cabeçalhos/rodapés)
3. Para cada linha da tabela, extraia: código, nome, quantidade, valor
4. ANTES de adicionar ao JSON, verifique se o código/nome já existe
5. Se existir, SOME as quantidades e valores, NÃO DUPLIQUE

PRODUTOS FAST ELEGÍVEIS:
- Placa ST (DW00057, DW00058) → 0,5 pontos/R$
- Guia Drywall (DW00074) → 1 ponto/R$
- Montante Drywall (DW00087) → 1 ponto/R$
- Placa RU (DW00007, DW00075) → 1 ponto/R$
- Placa Glasroc X (GR00001, GR00002) → 2 pontos/R$
- Placomix (PM00001, PM00002) → 1 ponto/R$
- Malha Glasroc (MT00001, MT00002) → 2 pontos/R$
- Basecoat (BC00001, BC00002) → 2 pontos/R$

ESTRUTURA JSON DE RESPOSTA:
{
  "numeroPedido": "número_encontrado",
  "dataEmissao": "dd/mm/aaaa",
  "fornecedor": "nome_empresa",
  "cliente": "nome_cliente",
  "valorTotalPedido": 0.00,
  "produtos": [
    {
      "codigo": "código_único",
      "nome": "nome_produto_sem_duplicata",
      "quantidade": 1,
      "valorUnitario": 0.00,
      "valorTotal": 0.00
    }
  ],
  "produtosFast": [
    {
      "codigo": "código_elegível",
      "nome": "produto_fast_único",
      "quantidade": 1,
      "valorTotal": 0.00,
      "pontosPorReal": 1.0,
      "pontosCalculados": 0
    }
  ],
  "resumo": {
    "totalProdutos": 0,
    "totalProdutosFast": 0.00,
    "totalPontosGanhos": 0,
    "verificacaoDuplicatas": "nenhuma_duplicata_encontrada"
  }
}

VALIDAÇÃO FINAL:
- Verifique se há códigos repetidos no array "produtos"
- Verifique se há nomes similares que podem ser o mesmo produto
- Se encontrar duplicatas, CONSOLIDE em um único item
- Confirme que cada produto aparece apenas UMA vez

RETORNE APENAS JSON VÁLIDO!`;

                // Processar PDF com prompt especializado
                const imagePart = {
                    inlineData: {
                        data: base64Clean,
                        mimeType: fileType
                    }
                };

                const result = await geminiService.model.generateContent([pdfPrompt, imagePart]);
                const response = await result.response;
                const text = response.text();

                console.log('[Gemini PDF] Resposta bruta:', text);

                // Processar resposta - tentar extrair JSON
                let jsonData = null;

                // Tentar encontrar JSON na resposta
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        jsonData = JSON.parse(jsonMatch[0]);
                        console.log('[Gemini PDF] JSON parseado com sucesso:', jsonData);
                    } catch (parseError) {
                        console.error('[Gemini PDF] Erro ao parsear JSON:', parseError);
                        throw new Error('Erro ao processar resposta do PDF');
                    }
                } else {
                    console.error('[Gemini PDF] Nenhum JSON encontrado na resposta');
                    throw new Error('Não foi possível extrair dados do PDF');
                }

                console.log('[Gemini PDF] Produtos extraídos:', jsonData.produtos?.length || 0);

                // VALIDAÇÃO ANTI-DUPLICAÇÃO CRÍTICA
                if (jsonData.produtos && jsonData.produtos.length > 0) {
                    const produtosLimpos = [];
                    const codigosVistos = new Set();
                    const nomesVistos = new Set();

                    jsonData.produtos.forEach(produto => {
                        const codigo = produto.codigo || '';
                        const nome = (produto.nome || '').toLowerCase().trim();

                        // Verificar duplicação por código OU nome similar
                        const codigoDuplicado = codigo && codigosVistos.has(codigo);
                        const nomeDuplicado = nome && nomesVistos.has(nome);

                        if (!codigoDuplicado && !nomeDuplicado) {
                            produtosLimpos.push(produto);
                            if (codigo) codigosVistos.add(codigo);
                            if (nome) nomesVistos.add(nome);
                        } else {
                            console.warn('[DUPLICATA REMOVIDA]', {
                                codigo,
                                nome: produto.nome,
                                motivo: codigoDuplicado ? 'código duplicado' : 'nome duplicado'
                            });
                        }
                    });

                    jsonData.produtos = produtosLimpos;
                    console.log('[Gemini PDF] Após limpeza:', produtosLimpos.length, 'produtos únicos');
                }

                // Limpar duplicatas em produtosFast também
                if (jsonData.produtosFast && jsonData.produtosFast.length > 0) {
                    const fastLimpos = [];
                    const codigosFastVistos = new Set();

                    jsonData.produtosFast.forEach(produto => {
                        const codigo = produto.codigo || '';
                        const nome = (produto.nome || '').toLowerCase().trim();
                        const chave = codigo || nome;

                        if (!codigosFastVistos.has(chave)) {
                            fastLimpos.push(produto);
                            codigosFastVistos.add(chave);
                        } else {
                            console.warn('[DUPLICATA FAST REMOVIDA]', produto.nome);
                        }
                    });

                    jsonData.produtosFast = fastLimpos;
                }

                return {
                    success: true,
                    data: jsonData,
                    metodo: 'gemini_pdf'
                };

            } catch (pdfError) {
                console.error('[Gemini PDF] Erro específico do PDF:', pdfError);
                // Se falhar com PDF, tentar como imagem
                console.log('[Gemini PDF] Tentando como imagem...');

                const result = await geminiService.processarNotaFiscal(base64Clean);

                if (result.sucesso) {
                    return {
                        success: true,
                        data: result.dados,
                        metodo: result.metodo + '_fallback'
                    };
                } else {
                    throw new Error(pdfError.message || 'Erro ao processar PDF');
                }
            }
        } else {
            // Para imagens, usar análise normal
            const result = await geminiService.processarNotaFiscal(base64Clean);

            console.log('[Gemini] Resultado recebido:', result);

            if (result.sucesso) {
                return {
                    success: true,
                    data: result.dados,
                    metodo: result.metodo
                };
            } else {
                return {
                    success: false,
                    error: result.erro || 'Erro desconhecido na análise'
                };
            }
        }
    } catch (error) {
        console.error('[Gemini] Erro na análise:', error);
        return {
            success: false,
            error: error.message || 'Erro desconhecido na análise'
        };
    }
};

export const testGeminiConnection = async () => {
    try {
        const result = await geminiService.testarConexao();
        return result;
    } catch (error) {
        return {
            sucesso: false,
            erro: error.message
        };
    }
};

// Função NOVA: Análise completa com OCR + Gemini
export const analyzeOrderWithOCR = async (base64Image, fileType) => {
    try {
        console.log('[OCR+Gemini] =============== INÍCIO ANÁLISE COMPLETA ===============');
        console.log('[OCR+Gemini] Passo 1: Extração de texto com OCR...');

        // Importar o serviço OCR
        const { extrairTextoDeImagem } = await import('./ocrService.js');

        // Extrair texto da imagem
        const ocrResult = await extrairTextoDeImagem(base64Image);

        if (!ocrResult.success) {
            throw new Error(`Erro no OCR: ${ocrResult.error}`);
        }

        console.log('[OCR+Gemini] OCR concluído com sucesso');
        console.log('[OCR+Gemini] Confiança OCR:', Math.round(ocrResult.confidence), '%');
        console.log('[OCR+Gemini] Texto extraído (tamanho):', ocrResult.text.length);

        console.log('[OCR+Gemini] Passo 2: Análise do texto com Gemini...');

        // Analisar texto com Gemini
        const geminiResult = await geminiService.processarTextoOCR(ocrResult.text);

        if (!geminiResult.sucesso) {
            throw new Error(`Erro no Gemini: ${geminiResult.erro}`);
        }

        console.log('[OCR+Gemini] =============== ANÁLISE COMPLETA CONCLUÍDA ===============');

        return {
            success: true,
            data: geminiResult.dados,
            metodo: 'ocr_tesseract_gemini',
            ocrConfidence: ocrResult.confidence,
            ocrAnalysis: ocrResult.analysis,
            textLength: ocrResult.text.length
        };

    } catch (error) {
        console.error('[OCR+Gemini] Erro na análise completa:', error);
        return {
            success: false,
            error: error.message || 'Erro na análise completa OCR+Gemini'
        };
    }
};

export default GeminiService;

// Exportar função individual para processamento de texto OCR
export const processarTextoOCR = async (textoExtraido) => {
    const geminiService = new GeminiService();
    return await geminiService.processarTextoOCR(textoExtraido);
};
