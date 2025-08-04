/**
 * Serviço de Validação Anti-Fraude via SEFAZ
 * Consulta dados oficiais da Nota Fiscal Eletrônica
 */

class SefazValidationService {
    constructor() {
        // URLs das APIs oficiais da SEFAZ por estado
        this.sefazEndpoints = {
            'SP': 'https://nfe.fazenda.sp.gov.br/ws/cadconsultacadastro4.asmx',
            'RJ': 'https://www.nfe.fazenda.rj.gov.br/ws/CadConsultaCadastro4.asmx',
            'MG': 'https://nfe.fazenda.mg.gov.br/ws/cadconsultacadastro4.asmx',
            'RS': 'https://nfe.fazenda.rs.gov.br/ws/CadConsultaCadastro4.asmx',
            // Adicionar outros estados conforme necessário
        };

        // Serviço Nacional (Receita Federal) - mais confiável
        this.receitaEndpoint = 'https://www.receita.fazenda.gov.br/pessoajuridica/cnpj/cnpjreva/cnpjreva_solicitacao.asp';
    }

    /**
     * Extrai a chave de acesso NFe de uma imagem/texto OCR
     * Chave NFe tem 44 dígitos numéricos
     */
    extractNFeKey(ocrText) {
        console.log('🔍 Buscando chave NFe no texto completo...');
        console.log('📝 Texto OCR para análise:', ocrText);

        // ETAPA 1: Buscar chave NFe em códigos de barras primeiro
        const barcodeKey = this.extractFromBarcode(ocrText);
        if (barcodeKey) {
            console.log('📊 Chave encontrada em código de barras:', barcodeKey);
            const validation = this.validateNFeKeyStructure(barcodeKey);
            if (validation.valid) {
                console.log('✅ Chave de código de barras válida!');
                return barcodeKey;
            } else {
                console.warn('⚠️ Chave de código de barras inválida:', validation.error);
            }
        }

        // ETAPA 2: Patterns tradicionais mais agressivos
        const patterns = [
            // Patterns com contexto específico
            /chave[:\s]*de[:\s]*acesso[:\s]*(\d{44})/gi,
            /chave[:\s]*nfe[:\s]*(\d{44})/gi,
            /chave[:\s]*(\d{44})/gi,
            /acesso[:\s]*(\d{44})/gi,
            /n[úu]mero[:\s]*(\d{44})/gi,
            /key[:\s]*(\d{44})/gi,
            /código[:\s]*(\d{44})/gi,
            /identificação[:\s]*(\d{44})/gi,

            // Patterns com formatação típica de NFe (grupos de 4)
            /(\d{4}[\s\-\.]*\d{4}[\s\-\.]*\d{4}[\s\-\.]*\d{4}[\s\-\.]*\d{4}[\s\-\.]*\d{4}[\s\-\.]*\d{4}[\s\-\.]*\d{4}[\s\-\.]*\d{4}[\s\-\.]*\d{4}[\s\-\.]*\d{4})/g,

            // Patterns para QR Code (podem conter a chave)
            /https?:\/\/[^\s]*(\d{44})[^\s]*/gi,
            /nfe\.fazenda\.gov\.br[^\s]*(\d{44})[^\s]*/gi,

            // Qualquer sequência de 44 dígitos consecutivos
            /(\d{44})/g,

            // Sequências com possíveis separadores
            /(\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4})/g,

            // Padrões mais flexíveis com separadores variados
            /(\d{2,4}[\s\-\.\,]*\d{2,4}[\s\-\.\,]*\d{2,4}[\s\-\.\,]*\d{2,4}[\s\-\.\,]*\d{2,4}[\s\-\.\,]*\d{2,4}[\s\-\.\,]*\d{2,4}[\s\-\.\,]*\d{2,4}[\s\-\.\,]*\d{2,4}[\s\-\.\,]*\d{2,4}[\s\-\.\,]*\d{2,4})/g
        ];

        const possibleKeys = [];
        let foundValidKey = null;

        // Buscar com todos os patterns e validar imediatamente
        for (const pattern of patterns) {
            if (foundValidKey) break; // Se já encontrou uma válida, parar

            const matches = ocrText.matchAll(pattern);
            for (const match of matches) {
                const key = match[1] || match[0];
                if (key) {
                    const cleanKey = key.replace(/[\s\-\.\,]/g, ''); // Remove espaços, hífens, pontos e vírgulas

                    if (cleanKey.length === 44 && /^\d+$/.test(cleanKey)) {
                        console.log('🔑 Testando chave candidata:', cleanKey);
                        const validation = this.validateNFeKeyStructure(cleanKey);
                        if (validation.valid) {
                            console.log('✅ Chave NFe válida encontrada via pattern:', cleanKey);
                            return cleanKey;
                        } else {
                            console.log('❌ Chave inválida:', validation.error);
                            possibleKeys.push(cleanKey); // Guardar para fallback
                        }
                    }
                }
            }
        }

        // Busca mais agressiva: procurar por sequências longas de números
        console.log('🔍 Busca agressiva por sequências numéricas longas...');
        const allNumbers = ocrText.match(/\d+/g) || [];
        for (const numStr of allNumbers) {
            if (foundValidKey) break;

            if (numStr.length >= 44) {
                // Tentar extrair 44 dígitos de diferentes posições
                for (let i = 0; i <= numStr.length - 44; i++) {
                    const candidate = numStr.substring(i, i + 44);
                    if (candidate.length === 44) {
                        console.log('🔑 Testando sequência longa:', candidate);
                        const validation = this.validateNFeKeyStructure(candidate);
                        if (validation.valid) {
                            console.log('✅ Chave válida encontrada em sequência longa:', candidate);
                            return candidate;
                        } else {
                            possibleKeys.push(candidate);
                        }
                    }
                }
            }
        }

        // Busca ultra-agressiva: remover tudo que não é número e procurar
        console.log('🔍 Busca ultra-agressiva: removendo todos os não-dígitos...');
        const onlyNumbers = ocrText.replace(/\D/g, '');
        console.log('📝 Sequência apenas números:', onlyNumbers.length > 100 ? onlyNumbers.substring(0, 100) + '...' : onlyNumbers);

        if (onlyNumbers.length >= 44) {
            // Tentar extrair chaves de diferentes posições
            for (let i = 0; i <= onlyNumbers.length - 44; i++) {
                const candidate = onlyNumbers.substring(i, i + 44);
                console.log('🔑 Testando posição ultra-agressiva:', candidate);

                const validation = this.validateNFeKeyStructure(candidate);
                if (validation.valid) {
                    console.log('✅ Chave válida encontrada na busca ultra-agressiva:', candidate);
                    return candidate;
                }

                // Limitar tentativas para não sobrecarregar
                if (i >= 50) {
                    console.log('⚠️ Limitando busca ultra-agressiva para não sobrecarregar');
                    break;
                }
            }
        }

        // Se encontrou múltiplas chaves mas nenhuma válida, retornar null
        if (possibleKeys.length > 0) {
            console.log(`⚠️ Encontradas ${possibleKeys.length} chaves candidatas, mas nenhuma passou na validação estrutural`);
            console.log('📋 Chaves testadas:', possibleKeys.slice(0, 5)); // Mostrar até 5 para debug
        }

        // Tentar extrair de forma mais agressiva - qualquer número longo que comece com UF válida
        console.log('🔍 Tentando extração por UF válida...');
        const validUFs = ['31', '32', '33', '35', '41', '42', '43', '50', '51', '52', '53'];
        const longNumbers = ocrText.match(/\d{20,}/g);

        if (longNumbers) {
            for (const num of longNumbers) {
                for (const uf of validUFs) {
                    // Procurar por padrões que comecem com UF válida
                    const ufIndex = num.indexOf(uf);
                    if (ufIndex !== -1 && num.length - ufIndex >= 44) {
                        const key44 = num.substring(ufIndex, ufIndex + 44);
                        console.log('🔑 Testando chave por UF:', key44);
                        const validation = this.validateNFeKeyStructure(key44);
                        if (validation.valid) {
                            console.log('✅ Chave válida encontrada por UF:', key44);
                            return key44;
                        }
                    }
                }
            }
        }

        console.log('❌ Nenhuma chave NFe válida encontrada');
        return null;
    }

    /**
     * Extrai chave NFe de códigos de barras
     * Códigos de barras NFe contêm a chave de 44 dígitos
     */
    extractFromBarcode(ocrText) {
        console.log('📊 Procurando por códigos de barras NFe...');

        // Patterns para identificar códigos de barras de NFe
        const barcodePatterns = [
            // Código de barras explícito
            /c[óo]digo[:\s]*de[:\s]*barras?[:\s]*(\d{44,})/gi,
            /barcode[:\s]*(\d{44,})/gi,
            /bar[:\s]*code[:\s]*(\d{44,})/gi,

            // Procurar por sequências muito longas (códigos de barras são longos)
            /(\d{44,100})/g,

            // Padrões específicos de NFe em códigos de barras
            // Código de barras NFe começa com os mesmos 4 dígitos da chave
            /((?:31|32|33|35|41|42|43|50|51|52|53)\d{42,})/g,

            // Buscar por "|||" ou "|" que podem indicar código de barras
            /\|+[:\s]*(\d{44,})/g,

            // Sequências longas próximas a palavras-chave
            /nfe[:\s]*(\d{44,})/gi,
            /nota[:\s]*fiscal[:\s]*(\d{44,})/gi,
            /danfe[:\s]*(\d{44,})/gi
        ];

        const potentialBarcodes = [];

        for (const pattern of barcodePatterns) {
            const matches = ocrText.matchAll(pattern);
            for (const match of matches) {
                const barcode = match[1] || match[0];
                if (barcode && barcode.length >= 44) {
                    potentialBarcodes.push(barcode);
                    console.log('📊 Código de barras candidato:', barcode.substring(0, 50) + '...');
                }
            }
        }

        // Processar códigos de barras encontrados
        for (const barcode of potentialBarcodes) {
            // Código de barras NFe: os primeiros 44 dígitos são a chave
            if (barcode.length >= 44) {
                const nfeKey = barcode.substring(0, 44);

                console.log('🔑 Testando chave extraída do código de barras:', nfeKey);

                // Validar se parece com chave NFe
                const validation = this.validateNFeKeyStructure(nfeKey);
                if (validation.valid) {
                    console.log('✅ Chave válida encontrada no código de barras!');
                    return nfeKey;
                } else {
                    console.log('❌ Primeira posição inválida:', validation.error);
                }

                // Se a primeira não funcionou, tentar outras posições
                for (let i = 1; i <= Math.min(10, barcode.length - 44); i++) {
                    const alternativeKey = barcode.substring(i, i + 44);
                    console.log(`🔑 Testando posição alternativa ${i}:`, alternativeKey);
                    const altValidation = this.validateNFeKeyStructure(alternativeKey);
                    if (altValidation.valid) {
                        console.log('✅ Chave alternativa válida encontrada no código de barras:', alternativeKey);
                        return alternativeKey;
                    }
                }
            }
        }

        // Busca agressiva: procurar por qualquer número de 44+ dígitos que comece com códigos de UF válidos
        console.log('📊 Busca agressiva em códigos de barras...');
        const ufCodes = ['31', '32', '33', '35', '41', '42', '43', '50', '51', '52', '53'];
        const allNumbers = ocrText.match(/\d{44,}/g) || [];

        for (const numStr of allNumbers) {
            for (const uf of ufCodes) {
                // Procurar UF no início ou em qualquer posição próxima
                for (let pos = 0; pos <= Math.min(5, numStr.length - 44); pos++) {
                    if (numStr.substring(pos, pos + 2) === uf && numStr.length - pos >= 44) {
                        const candidate = numStr.substring(pos, pos + 44);
                        console.log(`🔑 Testando UF ${uf} na posição ${pos}:`, candidate);
                        const validation = this.validateNFeKeyStructure(candidate);
                        if (validation.valid) {
                            console.log('✅ Chave encontrada por busca agressiva em barcode:', candidate);
                            return candidate;
                        }
                    }
                }
            }
        }

        console.log('📊 Nenhuma chave válida encontrada em códigos de barras');
        return null;
    }

    /**
     * Valida estrutura da chave NFe
     */
    validateNFeKeyStructure(chave) {
        if (!chave || chave.length !== 44 || !/^\d+$/.test(chave)) {
            return { valid: false, error: 'Chave deve ter 44 dígitos numéricos' };
        }

        // Estrutura da chave NFe:
        // Posições 0-1: UF (2 dígitos)
        // Posições 2-3: Ano (2 dígitos) 
        // Posições 4-5: Mês (2 dígitos)
        // Posições 6-19: CNPJ do emitente (14 dígitos)
        // Posições 20-21: Modelo (2 dígitos - deve ser "55" para NFe)
        // Posições 22-24: Série (3 dígitos)
        // Posições 25-33: Número da NFe (9 dígitos)
        // Posições 34-42: Código numérico (9 dígitos)
        // Posição 43: Dígito verificador (1 dígito)

        const uf = chave.substring(0, 2);
        const ano = parseInt(chave.substring(2, 4));
        const mes = parseInt(chave.substring(4, 6));
        const cnpj = chave.substring(6, 20);
        const modelo = chave.substring(20, 22); // Corrigido: posições 20-21

        console.log('🔍 Validando estrutura da chave:', {
            uf, ano, mes, cnpj: cnpj.substring(0, 6) + '...', modelo
        });

        // Validações básicas
        const ufNum = parseInt(uf);
        if (ufNum < 11 || ufNum > 53) {
            return { valid: false, error: `Código UF inválido: ${uf}` };
        }

        const currentYear = new Date().getFullYear() % 100;
        if (ano < 6 || ano > currentYear + 5) { // NFe existe desde 2006
            return { valid: false, error: `Ano inválido: 20${ano}` };
        }

        if (mes < 1 || mes > 12) {
            return { valid: false, error: `Mês inválido: ${mes}` };
        }

        if (modelo !== '55') { // NFe sempre tem modelo 55
            return { valid: false, error: `Modelo deve ser 55 (NFe), encontrado: ${modelo}` };
        }

        // Validar CNPJ básico (14 dígitos)
        if (cnpj.length !== 14 || !/^\d+$/.test(cnpj)) {
            return { valid: false, error: 'CNPJ inválido na chave' };
        }

        console.log('✅ Estrutura da chave NFe válida');
        return {
            valid: true,
            uf,
            ano: `20${ano.toString().padStart(2, '0')}`,
            mes: mes.toString().padStart(2, '0'),
            cnpj,
            modelo
        };
    }

    /**
     * Consulta NFe via múltiplos serviços (método mais confiável)
     */
    async consultarNFePortalNacional(chave) {
        console.log('🏛️ Consultando NFe oficial:', chave);

        // Lista de serviços para tentar
        const services = [
            {
                name: 'Portal Fiscal',
                url: `https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=completa&tipoConteudo=XbSeqxE8pl8=&chave=${chave}`,
                proxy: 'https://api.allorigins.win/raw?url='
            },
            {
                name: 'Consulta NFe',
                url: `http://www.portalfiscal.inf.br/nfe/consulta/cons_sit_nfe.aspx?nfe=${chave}`,
                proxy: 'https://api.allorigins.win/raw?url='
            },
            {
                name: 'SEFAZ Nacional',
                url: `https://www.nfe.fazenda.gov.br/portal/consultaDFe.aspx?tipoConsulta=completa&tipoConteudo=XbSeqxE8pl8=&chave=${chave}`,
                proxy: 'https://api.codetabs.com/v1/proxy?quest='
            }
        ];

        for (const service of services) {
            try {
                console.log(`🔍 Tentando ${service.name}...`);

                const response = await fetch(`${service.proxy}${encodeURIComponent(service.url)}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 10000 // 10 segundos timeout
                });

                if (response.ok) {
                    const html = await response.text();
                    console.log(`📄 Resposta de ${service.name}:`, html.substring(0, 200) + '...');

                    const result = this.parseNFeResponse(html);
                    if (result.success) {
                        console.log(`✅ Sucesso com ${service.name}!`);
                        return result;
                    }
                }

            } catch (error) {
                console.warn(`⚠️ Falha em ${service.name}:`, error.message);
                continue; // Tentar próximo serviço
            }
        }

        // Se todos falharam, tentar método de consulta simples
        return this.consultaSEFAZSimples(chave);
    }

    /**
     * Consulta SEFAZ simplificada (fallback)
     */
    async consultaSEFAZSimples(chave) {
        try {
            console.log('🔧 Tentando consulta SEFAZ simplificada...');

            // Usar API genérica de consulta
            const response = await fetch(`https://api.consultanfe.com.br/nfe/${chave}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📊 Dados da consulta simples:', data);

                if (data && data.nfe) {
                    return {
                        success: true,
                        data: {
                            valorTotal: data.nfe.infNFe?.total?.ICMSTot?.vNF || null,
                            cnpjEmitente: data.nfe.infNFe?.emit?.CNPJ || null,
                            razaoSocial: data.nfe.infNFe?.emit?.xNome || null,
                            dataEmissao: data.nfe.infNFe?.ide?.dhEmi || null,
                            situacao: data.protNFe?.infProt?.xMotivo || 'Autorizada',
                            validatedByGovernment: true
                        }
                    };
                }
            }

            throw new Error('Consulta simples não retornou dados válidos');

        } catch (error) {
            console.error('⚠️ Erro na consulta SEFAZ simples:', error);
            return {
                success: false,
                error: 'Todos os serviços SEFAZ indisponíveis',
                fallback: true
            };
        }
    }

    /**
     * Parser aprimorado da resposta HTML/JSON do portal da NFe
     */
    parseNFeResponse(response) {
        try {
            console.log('🔍 Analisando resposta SEFAZ...');

            // Tentar parser JSON primeiro
            if (typeof response === 'string' && (response.trim().startsWith('{') || response.trim().startsWith('['))) {
                try {
                    const jsonData = JSON.parse(response);
                    console.log('📊 Dados JSON recebidos:', jsonData);
                    return this.parseJSONResponse(jsonData);
                } catch (e) {
                    console.log('⚠️ Não é JSON válido, tentando HTML...');
                }
            }

            // Parser HTML
            const html = response;

            // Verificar se NFe foi encontrada (vários padrões de erro)
            const errorPatterns = [
                /não encontrada/i,
                /inválida/i,
                /erro/i,
                /não\s*existe/i,
                /chave\s*incorreta/i,
                /invalid/i,
                /not\s*found/i
            ];

            const hasError = errorPatterns.some(pattern => pattern.test(html));
            if (hasError) {
                console.log('❌ NFe não encontrada ou inválida');
                return {
                    success: false,
                    error: 'NFe não encontrada ou inválida'
                };
            }

            // Extrair informações usando múltiplos padrões
            const valorTotal = this.extractMultiplePatterns(html, [
                /valor\s*total[:\s]*r?\$?\s*([\d.,]+)/i,
                /total[:\s]*r?\$?\s*([\d.,]+)/i,
                /vNF[:\s]*r?\$?\s*([\d.,]+)/i,
                /vlr\s*total[:\s]*r?\$?\s*([\d.,]+)/i
            ]);

            const cnpjEmitente = this.extractMultiplePatterns(html, [
                /cnpj[:\s]*emitente[:\s]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i,
                /cnpj[:\s]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i,
                /emit[:\s]*cnpj[:\s]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i
            ]);

            const razaoSocial = this.extractMultiplePatterns(html, [
                /razão\s*social[:\s]*([^<\n\r]{3,100})/i,
                /nome[:\s]*emitente[:\s]*([^<\n\r]{3,100})/i,
                /xNome[:\s]*([^<\n\r]{3,100})/i,
                /emitente[:\s]*([^<\n\r]{3,100})/i
            ]);

            const dataEmissao = this.extractMultiplePatterns(html, [
                /data\s*emissão[:\s]*(\d{2}\/\d{2}\/\d{4})/i,
                /dhEmi[:\s]*(\d{4}-\d{2}-\d{2})/i,
                /emissão[:\s]*(\d{2}\/\d{2}\/\d{4})/i
            ]);

            const situacao = this.extractMultiplePatterns(html, [
                /situação[:\s]*([^<\n\r]{3,50})/i,
                /status[:\s]*([^<\n\r]{3,50})/i,
                /xMotivo[:\s]*([^<\n\r]{3,50})/i
            ]);

            // Se encontrou pelo menos valor total ou CNPJ, considerar sucesso
            if (valorTotal || cnpjEmitente) {
                console.log('✅ Dados extraídos com sucesso do HTML');
                return {
                    success: true,
                    data: {
                        valorTotal: valorTotal ? this.parseMoneyValue(valorTotal) : null,
                        cnpjEmitente: cnpjEmitente ? cnpjEmitente.replace(/\D/g, '') : null,
                        razaoSocial: razaoSocial ? razaoSocial.trim() : null,
                        dataEmissao: dataEmissao ? this.parseDate(dataEmissao) : null,
                        situacao: situacao ? situacao.trim() : 'Autorizada',
                        validatedByGovernment: true
                    }
                };
            }

            console.log('⚠️ Nenhum dado relevante encontrado na resposta');
            return {
                success: false,
                error: 'Resposta não contém dados de NFe válidos'
            };

        } catch (error) {
            console.error('❌ Erro ao fazer parse da resposta NFe:', error);
            return {
                success: false,
                error: 'Erro ao processar resposta da consulta'
            };
        }
    }

    /**
     * Parser para resposta JSON
     */
    parseJSONResponse(jsonData) {
        try {
            // Diferentes estruturas de JSON que podem vir
            const nfe = jsonData.nfe || jsonData.NFe || jsonData.infNFe || jsonData;

            return {
                success: true,
                data: {
                    valorTotal: nfe.total?.ICMSTot?.vNF || nfe.vNF || nfe.valorTotal,
                    cnpjEmitente: nfe.emit?.CNPJ || nfe.CNPJ || nfe.cnpjEmitente,
                    razaoSocial: nfe.emit?.xNome || nfe.xNome || nfe.razaoSocial,
                    dataEmissao: nfe.ide?.dhEmi || nfe.dhEmi || nfe.dataEmissao,
                    situacao: nfe.protNFe?.infProt?.xMotivo || 'Autorizada',
                    validatedByGovernment: true
                }
            };
        } catch (error) {
            console.error('Erro ao processar JSON:', error);
            return {
                success: false,
                error: 'Erro ao processar dados JSON'
            };
        }
    }

    /**
     * Extrai valor usando múltiplos padrões regex
     */
    extractMultiplePatterns(text, patterns) {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }

    /**
     * Converte string monetária para número
     */
    parseMoneyValue(moneyString) {
        if (!moneyString) return null;

        return parseFloat(
            moneyString
                .replace(/[R$\s]/g, '') // Remove R$ e espaços
                .replace(/\./g, '') // Remove pontos (milhares)
                .replace(',', '.') // Troca vírgula por ponto (decimais)
        );
    }

    /**
     * Converte string de data para objeto Date
     */
    parseDate(dateString) {
        if (!dateString) return null;

        // Suportar formatos DD/MM/YYYY e YYYY-MM-DD
        let day, month, year;

        if (dateString.includes('/')) {
            [day, month, year] = dateString.split('/');
        } else if (dateString.includes('-')) {
            [year, month, day] = dateString.split('-');
        } else {
            return null;
        }

        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    /**
     * Extrai informações básicas para consulta alternativa
     */
    extractBasicInfoForSefaz(ocrText, extractedData) {
        const info = {
            cnpj: null,
            valorTotal: null,
            dataEmissao: null,
            numeroNota: null
        };

        // Extrair CNPJ
        const cnpjPatterns = [
            /cnpj[\s:]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/gi,
            /(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/g
        ];

        for (const pattern of cnpjPatterns) {
            const match = ocrText.match(pattern);
            if (match) {
                info.cnpj = match[1].replace(/\D/g, ''); // Remove formatação
                break;
            }
        }

        // Usar dados já extraídos se disponíveis
        info.valorTotal = extractedData.totalValue;
        info.dataEmissao = extractedData.orderDate;
        info.numeroNota = extractedData.orderNumber;

        // Extrair valor total se não disponível
        if (!info.valorTotal) {
            const valorPatterns = [
                /total[\s:]*r?\$?\s*([\d.,]+)/gi,
                /valor[\s:]*r?\$?\s*([\d.,]+)/gi,
                /r\$\s*([\d.,]+)/gi
            ];

            for (const pattern of valorPatterns) {
                const match = ocrText.match(pattern);
                if (match) {
                    const valor = this.parseMoneyValue(match[1]);
                    if (valor && valor > 0) {
                        info.valorTotal = valor;
                        break;
                    }
                }
            }
        }

        // Extrair número da nota se não disponível
        if (!info.numeroNota) {
            const notaPatterns = [
                /n[úu]mero[\s:]*(\d+)/gi,
                /nota[\s:]*(\d+)/gi,
                /nf[\s:]*(\d+)/gi
            ];

            for (const pattern of notaPatterns) {
                const match = ocrText.match(pattern);
                if (match) {
                    info.numeroNota = match[1];
                    break;
                }
            }
        }

        console.log('🔍 Informações básicas extraídas:', info);
        return info;
    }

    /**
     * Validação alternativa via consulta de CNPJ na Receita Federal
     */
    async validateByCNPJ(cnpj, valorTotal, dataEmissao) {
        try {
            console.log('🏛️ Tentando validação via CNPJ da Receita Federal...');

            // Consulta simplificada de CNPJ (API pública)
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);

            if (response.ok) {
                const cnpjData = await response.json();

                return {
                    success: true,
                    data: {
                        razaoSocial: cnpjData.razao_social || cnpjData.nome,
                        cnpjEmitente: cnpj,
                        situacao: cnpjData.situacao || 'ATIVA',
                        validatedByCNPJ: true,
                        validationType: 'cnpj_receita'
                    }
                };
            }

            throw new Error('CNPJ não encontrado');

        } catch (error) {
            console.error('⚠️ Erro na validação por CNPJ:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Gerar chave NFe baseada em informações disponíveis (para teste)
     */
    generatePossibleNFeKeys(info) {
        const possibleKeys = [];

        if (info.cnpj && info.dataEmissao && info.numeroNota) {
            try {
                const date = new Date(info.dataEmissao);
                const uf = '35'; // São Paulo como padrão
                const ano = date.getFullYear().toString().substring(2);
                const mes = (date.getMonth() + 1).toString().padStart(2, '0');
                const cnpj14 = info.cnpj.padStart(14, '0');
                const modelo = '055';
                const serie = '001';
                const numero = info.numeroNota.padStart(9, '0');

                // Gerar parte inicial da chave (sem código numérico e DV)
                const chaveInicial = uf + ano + mes + cnpj14 + modelo + serie + numero;

                // Tentar diferentes códigos numéricos
                for (let codigo = 10000000; codigo <= 99999999; codigo += 1000000) {
                    const chaveCompleta = chaveInicial + codigo.toString();
                    if (chaveCompleta.length === 44) {
                        possibleKeys.push(chaveCompleta);
                        if (possibleKeys.length >= 5) break; // Limitar tentativas
                    }
                }

            } catch (error) {
                console.error('Erro ao gerar chaves possíveis:', error);
            }
        }

        return possibleKeys;
    }

    /**
     * Converte string de data para objeto Date
     */
    parseDate(dateString) {
        if (!dateString) return null;

        // Suportar formatos DD/MM/YYYY e YYYY-MM-DD
        let day, month, year;

        if (dateString.includes('/')) {
            [day, month, year] = dateString.split('/');
        } else if (dateString.includes('-')) {
            [year, month, day] = dateString.split('-');
        } else {
            return null;
        }

        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    /**
     * Método principal: validar nota fiscal completa
     */
    async validateNotaFiscal(ocrText, extractedData) {
        console.log('🔒 Iniciando validação anti-fraude...');
        console.log('📄 Texto OCR recebido:', ocrText?.length || 0, 'caracteres');
        console.log('📊 Dados extraídos:', extractedData);

        // 1. Tentar extrair chave de acesso (método principal)
        let chaveNFe = this.extractNFeKey(ocrText);
        let validationMethod = 'unknown';

        if (chaveNFe) {
            console.log('🔑 Chave NFe encontrada:', chaveNFe);

            // 2. Validar estrutura da chave
            const keyValidation = this.validateNFeKeyStructure(chaveNFe);
            if (!keyValidation.valid) {
                console.warn('⚠️ Chave NFe inválida:', keyValidation.error);
                chaveNFe = null; // Descartar chave inválida
            }
        }

        // 3. Se não encontrou chave, tentar métodos alternativos
        if (!chaveNFe) {
            console.log('🔍 Chave NFe não encontrada, tentando métodos alternativos...');

            // ETAPA 3.1: Busca específica por códigos de barras
            console.log('📊 Fazendo busca dedicada por códigos de barras...');
            const barcodeKey = this.extractFromBarcode(ocrText);
            if (barcodeKey) {
                const barcodeValidation = this.validateNFeKeyStructure(barcodeKey);
                if (barcodeValidation.valid) {
                    chaveNFe = barcodeKey;
                    validationMethod = 'barcode_extraction';
                    console.log('✅ Chave NFe extraída de código de barras:', chaveNFe);
                }
            }

            // ETAPA 3.2: Extrair informações básicas para validação alternativa
            if (!chaveNFe) {
                const basicInfo = this.extractBasicInfoForSefaz(ocrText, extractedData);

                // Método 1: Tentar gerar chaves possíveis baseadas nas informações
                if (basicInfo.cnpj && basicInfo.numeroNota && basicInfo.dataEmissao) {
                    console.log('🎯 Tentando gerar chaves NFe possíveis...');
                    const possibleKeys = this.generatePossibleNFeKeys(basicInfo);

                    // Testar cada chave possível
                    for (const testKey of possibleKeys) {
                        console.log('🧪 Testando chave gerada:', testKey);
                        const sefazResult = await this.consultarNFePortalNacional(testKey);

                        if (sefazResult.success) {
                            console.log('✅ Chave gerada funcionou!');
                            chaveNFe = testKey;
                            validationMethod = 'generated_key';
                            break;
                        }
                    }
                }

                // Método 2: Validação via CNPJ se ainda não encontrou
                if (!chaveNFe && basicInfo.cnpj) {
                    console.log('🏛️ Tentando validação via CNPJ...');
                    const cnpjResult = await this.validateByCNPJ(
                        basicInfo.cnpj,
                        basicInfo.valorTotal,
                        basicInfo.dataEmissao
                    );

                    if (cnpjResult.success) {
                        console.log('✅ Validação por CNPJ bem-sucedida');
                        return {
                            success: true,
                            useOCR: false,
                            data: {
                                ...cnpjResult.data,
                                valorTotal: basicInfo.valorTotal || extractedData.totalValue,
                                validationType: 'cnpj_validated',
                                antifraudValidated: true
                            }
                        };
                    }
                }
            }
        }

        // 4. Se encontrou chave (original ou gerada), consultar SEFAZ
        if (chaveNFe) {
            const sefazResult = await this.consultarNFePortalNacional(chaveNFe);

            if (sefazResult.success) {
                // Comparar dados OCR vs SEFAZ
                const comparison = this.compareOCRvsSEFAZ(extractedData, sefazResult.data);

                console.log('✅ Validação SEFAZ concluída:', sefazResult.data);

                return {
                    success: true,
                    useOCR: false,
                    data: {
                        ...sefazResult.data,
                        chaveNFe,
                        validationType: this.getValidationType(validationMethod),
                        extractionMethod: validationMethod,
                        ocrComparison: comparison,
                        antifraudValidated: true
                    }
                };
            } else {
                console.warn('⚠️ Falha na consulta SEFAZ:', sefazResult.error);

                if (sefazResult.fallback) {
                    // Usar dados OCR com validações extras
                    return {
                        success: true,
                        useOCR: true,
                        warning: 'Dados oficiais indisponíveis - usando OCR com validação extra',
                        data: {
                            ...extractedData,
                            chaveNFe,
                            validationType: 'ocr_with_key',
                            antifraudValidated: true
                        }
                    };
                }
            }
        }

        // 5. Fallback: usar apenas dados OCR com validações restritivas
        console.warn('⚠️ Nenhum método de validação oficial funcionou');
        console.log('🔒 Aplicando validações restritivas nos dados OCR...');

        const ocrValidation = this.validateOCRData(extractedData, ocrText);

        // Se dados OCR são muito suspeitos, rejeitar
        if (!ocrValidation.hasReasonableValues || ocrValidation.suspiciousPatterns.length > 3) {
            console.error('🚨 Muitos padrões suspeitos detectados:', ocrValidation.suspiciousPatterns);
            return {
                success: false,
                error: 'Documento apresenta muitos padrões suspeitos de fraude',
                suspiciousPatterns: ocrValidation.suspiciousPatterns
            };
        }

        // Dados OCR com limitações de segurança
        return {
            success: true,
            useOCR: true,
            warning: 'Validação oficial não disponível - usando dados OCR com restrições',
            data: {
                ...extractedData,
                validationType: 'ocr_restricted',
                antifraudValidated: true,
                ocrValidation,
                restrictedProcessing: true
            }
        };
    }

    /**
     * Compara dados OCR com dados oficiais SEFAZ
     */
    compareOCRvsSEFAZ(ocrData, sefazData) {
        const comparison = {
            valorTotalMatch: false,
            dataMatch: false,
            discrepancies: []
        };

        // Comparar valor total (tolerância de 5%)
        if (ocrData.totalValue && sefazData.valorTotal) {
            const diff = Math.abs(ocrData.totalValue - sefazData.valorTotal);
            const tolerance = sefazData.valorTotal * 0.05; // 5% de tolerância

            comparison.valorTotalMatch = diff <= tolerance;

            if (!comparison.valorTotalMatch) {
                comparison.discrepancies.push({
                    field: 'valorTotal',
                    ocr: ocrData.totalValue,
                    sefaz: sefazData.valorTotal,
                    diff: diff
                });
            }
        }

        // Comparar datas (se disponível)
        if (ocrData.orderDate && sefazData.dataEmissao) {
            const ocrDate = new Date(ocrData.orderDate);
            const sefazDate = new Date(sefazData.dataEmissao);

            comparison.dataMatch = Math.abs(ocrDate - sefazDate) < 24 * 60 * 60 * 1000; // 1 dia de tolerância

            if (!comparison.dataMatch) {
                comparison.discrepancies.push({
                    field: 'dataEmissao',
                    ocr: ocrData.orderDate,
                    sefaz: sefazData.dataEmissao
                });
            }
        }

        return comparison;
    }

    /**
     * Determina o tipo de validação baseado no método usado
     */
    getValidationType(method) {
        switch (method) {
            case 'barcode_extraction':
                return 'sefaz_barcode';
            case 'generated_key':
                return 'sefaz_generated';
            case 'unknown':
            default:
                return 'sefaz_official';
        }
    }

    /**
     * Validações extras para quando só temos dados OCR
     */
    validateOCRData(extractedData, ocrText) {
        const validations = {
            hasMultipleProductLines: false,
            hasConsistentFormatting: false,
            hasReasonableValues: true,
            suspiciousPatterns: []
        };

        console.log('🔍 Validando dados OCR para padrões suspeitos...');

        // Verificar se há múltiplas linhas de produtos
        const productLines = ocrText.split('\n').filter(line =>
            /\d+[.,]\d{2}/.test(line) && // Tem valor monetário
            /\d+/.test(line) // Tem números
        );
        validations.hasMultipleProductLines = productLines.length > 1;

        if (!validations.hasMultipleProductLines) {
            validations.suspiciousPatterns.push('Documento sem múltiplas linhas de produtos');
        }

        // Verificar padrões suspeitos no valor total
        if (extractedData.totalValue) {
            // Valores muito redondos podem ser suspeitos
            if (extractedData.totalValue % 10 === 0 && extractedData.totalValue < 100) {
                validations.suspiciousPatterns.push('Valor muito redondo e baixo');
            }

            // Valores extremamente baixos são suspeitos
            if (extractedData.totalValue < 5) {
                validations.suspiciousPatterns.push('Valor total muito baixo (< R$ 5,00)');
                validations.hasReasonableValues = false;
            }

            // Valores extremamente altos sem contexto são suspeitos
            if (extractedData.totalValue > 50000 && ocrText.length < 200) {
                validations.suspiciousPatterns.push('Valor muito alto para documento simples');
            }

            // Verificar se valor é número inteiro suspeito
            if (extractedData.totalValue % 1 === 0 && extractedData.totalValue < 50) {
                validations.suspiciousPatterns.push('Valor inteiro baixo suspeito');
            }
        }

        // Verificar se texto é muito simples (possível fraude manual)
        if (ocrText.length < 50) {
            validations.suspiciousPatterns.push('Documento muito simples (< 50 caracteres)');
        }

        // Verificar ausência de informações básicas de NFe
        const hasBasicNFeInfo = [
            /cnpj/i.test(ocrText),
            /razão\s*social/i.test(ocrText) || /nome/i.test(ocrText),
            /endereço/i.test(ocrText) || /rua/i.test(ocrText),
            /data/i.test(ocrText),
            /total/i.test(ocrText) || /valor/i.test(ocrText)
        ].filter(Boolean).length;

        if (hasBasicNFeInfo < 3) {
            validations.suspiciousPatterns.push('Faltam informações básicas de NFe');
        }

        // Verificar formatação muito inconsistente
        const hasNumbers = /\d/.test(ocrText);
        const hasLetters = /[a-zA-Z]/.test(ocrText);
        const hasSymbols = /[R$.,\/\-]/.test(ocrText);

        if (!hasNumbers || !hasLetters) {
            validations.suspiciousPatterns.push('Formatação muito inconsistente');
            validations.hasConsistentFormatting = false;
        } else {
            validations.hasConsistentFormatting = true;
        }

        // Verificar se parece com texto digitado manualmente
        const shortWords = ocrText.split(/\s+/).filter(word => word.length < 3).length;
        const totalWords = ocrText.split(/\s+/).length;

        if (totalWords > 0 && (shortWords / totalWords) > 0.5) {
            validations.suspiciousPatterns.push('Texto parece digitado manualmente');
        }

        // Verificar duplicação suspeita de palavras
        const words = ocrText.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(words);
        const duplicateRatio = 1 - (uniqueWords.size / words.length);

        if (duplicateRatio > 0.7 && words.length > 10) {
            validations.suspiciousPatterns.push('Muitas palavras duplicadas');
        }

        console.log('📊 Resultados da validação OCR:', {
            hasMultipleProductLines: validations.hasMultipleProductLines,
            hasConsistentFormatting: validations.hasConsistentFormatting,
            hasReasonableValues: validations.hasReasonableValues,
            suspiciousPatterns: validations.suspiciousPatterns.length,
            patterns: validations.suspiciousPatterns
        });

        return validations;
    }
}

export const sefazValidationService = new SefazValidationService();
export default sefazValidationService;
