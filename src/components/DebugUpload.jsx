import React, { useState } from 'react';
import styled from 'styled-components';
import { analyzeOrderWithGemini, testGeminiConnection, analyzeOrderWithOCR } from '../services/geminiService';
import { extrairTextoDeImagem } from '../services/ocrService';
import { processOrderResult, validateOrder } from '../utils/pedidosFast';
import { analyzeOrder } from '../services/simulatedAI';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.primary};
  text-align: center;
  margin-bottom: 2rem;
`;

const DebugSection = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid #ddd;
`;

const DebugTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: 1rem;
`;

const CodeBlock = styled.pre`
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.85rem;
  white-space: pre-wrap;
`;

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin: 1rem 0;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin: 1rem 0;
  color: #2d3748;
  background: #ffffff;
  
  &::placeholder {
    color: #718096;
  }
`;

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  background: ${props => {
        if (props.type === 'error') return '#f8d7da';
        if (props.type === 'success') return '#d4edda';
        if (props.type === 'warning') return '#fff3cd';
        return '#e7f3ff';
    }};
  color: ${props => {
        if (props.type === 'error') return '#721c24';
        if (props.type === 'success') return '#155724';
        if (props.type === 'warning') return '#856404';
        return '#004085';
    }};
`;

const Step = styled.div.withConfig({
    shouldForwardProp: (prop) => !['completed', 'active'].includes(prop),
})`
  background: ${props => props.completed ? '#d4edda' : props.active ? '#e7f3ff' : '#f8f9fa'};
  border: 2px solid ${props => props.completed ? '#28a745' : props.active ? '#007bff' : '#ddd'};
  padding: 1rem;
  border-radius: 8px;
  margin: 0.5rem 0;
`;

const DebugUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [debugLogs, setDebugLogs] = useState([]);
    const [processing, setProcessing] = useState(false);

    const addLog = (message, type = 'info', data = null) => {
        const log = {
            timestamp: new Date().toLocaleTimeString(),
            message,
            type,
            data
        };
        setDebugLogs(prev => [...prev, log]);
        console.log(`[${type.toUpperCase()}] ${message}`, data);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setDebugLogs([]);
        setCurrentStep(0);

        addLog(`Arquivo selecionado: ${file.name}`, 'success', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified).toLocaleString()
        });
    };

    const handleSimulatedAnalysis = async (base64Image) => {
        addLog('Iniciando análise simulada...', 'info');

        try {
            const result = await analyzeOrder(base64Image);
            addLog('Análise simulada concluída', 'success', result);
        } catch (error) {
            addLog('Erro na análise simulada', 'error', error);
        }
    };

    const testStep1_FileConversion = async () => {
        if (!selectedFile) {
            addLog('Nenhum arquivo selecionado', 'error');
            return;
        }

        setCurrentStep(1);
        addLog('Iniciando conversão para base64...', 'info');

        try {
            const base64 = await fileToBase64(selectedFile);
            const base64Size = base64.length;
            const base64Preview = base64.substring(0, 100) + '...';

            addLog('Conversão para base64 concluída', 'success', {
                originalSize: selectedFile.size,
                base64Size: base64Size,
                preview: base64Preview
            });

            // Salvar no estado para próximos testes
            window.debugBase64 = base64;
            setCurrentStep(2);

        } catch (error) {
            addLog('Erro na conversão para base64', 'error', error.message);
        }
    };

    const testStep2_AIAnalysis = async () => {
        if (!window.debugBase64) {
            addLog('Base64 não disponível. Execute o Passo 1 primeiro.', 'error');
            return;
        }

        setCurrentStep(2);
        setProcessing(true);
        addLog('Enviando para análise da IA Gemini...', 'info');

        try {
            // Log das configurações antes de enviar
            addLog('Verificando configurações da IA...', 'info', {
                hasApiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
                hasApiKeyReact: !!import.meta.env.REACT_APP_GEMINI_API_KEY,
                base64Length: window.debugBase64.length,
                fileType: selectedFile.type,
                fileName: selectedFile.name
            });

            // Tentar a chamada da IA com timeout estendido
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout na chamada da IA (60s)')), 60000)
            );

            // Agora passa o arquivo para permitir fallback OCR
            addLog('Iniciando análise com Gemini...', 'info');
            const aiPromise = analyzeOrderWithGemini(window.debugBase64, selectedFile.type, selectedFile);

            addLog('Aguardando resposta da IA... (máx 60s)', 'info');

            const aiResult = await Promise.race([aiPromise, timeoutPromise]);

            addLog('Resposta da IA recebida', aiResult.success ? 'success' : 'error', {
                success: aiResult.success,
                hasData: !!aiResult.data,
                error: aiResult.error,
                metodo: aiResult.metodo,
                dataPreview: aiResult.data ? Object.keys(aiResult.data) : null
            });

            if (aiResult.success && aiResult.data) {
                window.debugAIResult = aiResult.data;
                setCurrentStep(3);
                addLog(`Dados da IA salvos com sucesso (${aiResult.metodo}). Pode prosseguir para o Passo 3.`, 'success');
            } else {
                addLog('IA retornou erro ou dados inválidos', 'error', aiResult);
            }

        } catch (error) {
            addLog('Erro na análise da IA', 'error', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        } finally {
            setProcessing(false);
        }
    };

    const testStep2_AnalyzeOrder = async () => {
        if (!selectedFile) {
            addLog('Nenhum arquivo selecionado', 'error');
            return;
        }

        setCurrentStep(2);
        addLog('Convertendo arquivo para base64...', 'info');

        try {
            const base64 = await fileToBase64(selectedFile);
            addLog('Arquivo convertido para base64', 'success');

            // Substituir chamada de IA externa pela análise simulada
            await handleSimulatedAnalysis(base64);
        } catch (error) {
            addLog('Erro ao converter arquivo para base64', 'error', error);
        }
    };

    const testStep3_DataProcessing = async () => {
        if (!window.debugAIResult) {
            addLog('Dados da IA não disponíveis. Execute o Passo 2 primeiro.', 'error');
            return;
        }

        setCurrentStep(3);
        addLog('Processando dados extraídos...', 'info');

        try {
            const processedOrder = processOrderResult(window.debugAIResult);

            addLog('Dados processados com sucesso', 'success', processedOrder);

            window.debugProcessedOrder = processedOrder;
            setCurrentStep(4);

        } catch (error) {
            addLog('Erro no processamento dos dados', 'error', error.message);
        }
    };

    const testStep4_Validation = async () => {
        if (!window.debugProcessedOrder) {
            addLog('Dados processados não disponíveis. Execute o Passo 3 primeiro.', 'error');
            return;
        }

        setCurrentStep(4);
        addLog('Validando pedido...', 'info');

        try {
            const validation = await validateOrder(window.debugProcessedOrder);

            addLog('Validação concluída', validation.isValid ? 'success' : 'warning', validation);

            if (validation.isValid) {
                setCurrentStep(5);
            }

        } catch (error) {
            addLog('Erro na validação', 'error', error.message);
        }
    };

    const testAPIConnection = async () => {
        addLog('Testando conectividade da API Gemini...', 'info');

        try {
            // Verificar se as variáveis de ambiente estão carregadas
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.REACT_APP_GEMINI_API_KEY;

            addLog('Configurações encontradas:', 'info', {
                hasViteKey: !!import.meta.env.VITE_GEMINI_API_KEY,
                hasReactKey: !!import.meta.env.REACT_APP_GEMINI_API_KEY,
                keyLength: apiKey ? apiKey.length : 0,
                keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'NENHUMA'
            });

            if (!apiKey) {
                addLog('API Key do Gemini não encontrada nas variáveis de ambiente', 'error');
                return;
            }

            // Teste usando o serviço Gemini
            const result = await testGeminiConnection();

            if (result.sucesso) {
                addLog('Teste de conectividade bem-sucedido!', 'success', {
                    resposta: result.resposta
                });
            } else {
                addLog('Erro no teste de conectividade', 'error', {
                    erro: result.erro
                });
            }

        } catch (error) {
            addLog('Erro no teste de conectividade', 'error', {
                message: error.message,
                status: error.status,
                code: error.code
            });
        }
    };

    const testSimpleAPI = async () => {
        addLog('🔍 Teste SIMPLES da API Gemini...', 'info');
        setProcessing(true);

        try {
            const result = await testGeminiConnection();

            if (result.sucesso) {
                addLog('✅ Conexão simples bem-sucedida!', 'success', {
                    resposta: result.resposta
                });
            } else {
                addLog('❌ Falha na conexão simples', 'error', result);
            }

        } catch (error) {
            addLog('❌ Erro inesperado no teste simples', 'error', {
                message: error.message,
                stack: error.stack
            });
        } finally {
            setProcessing(false);
        }
    };

    const testImageAnalysisOnly = async () => {
        if (!window.debugBase64) {
            addLog('Base64 não disponível. Execute o Passo 1 primeiro.', 'error');
            return;
        }

        addLog('🖼️ Teste DIRETO com imagem...', 'info');
        setProcessing(true);

        try {
            const result = await analyzeOrderWithGemini(window.debugBase64, 'image/jpeg');

            if (result.success) {
                addLog('✅ Análise de imagem bem-sucedida!', 'success', {
                    dados: result.data,
                    metodo: result.metodo
                });
            } else {
                addLog('❌ Falha na análise de imagem', 'error', result);

                // Se falhar, mostrar informações do erro
                if (result.error && result.error.includes('422')) {
                    addLog('🚨 Erro 422: Formato de imagem não suportado', 'warning');
                }
            }

        } catch (error) {
            addLog('❌ Erro inesperado no teste de imagem', 'error', {
                message: error.message,
                stack: error.stack
            });
        } finally {
            setProcessing(false);
        }
    };

    const testGeminiAPI = async () => {
        addLog('🟢 Teste GEMINI API...', 'info');
        setProcessing(true);

        try {
            const result = await testGeminiConnection();

            if (result.sucesso) {
                addLog('✅ Gemini conectado com sucesso!', 'success', {
                    resposta: result.resposta
                });
            } else {
                addLog('❌ Falha na conexão com Gemini', 'error', result);
            }

        } catch (error) {
            addLog('❌ Erro inesperado no Gemini', 'error', {
                message: error.message,
                stack: error.stack
            });
        } finally {
            setProcessing(false);
        }
    };

    const testGeminiWithImage = async () => {
        if (!window.debugBase64) {
            addLog('Base64 não disponível. Execute o Passo 1 primeiro.', 'error');
            return;
        }

        addLog('🖼️ Teste GEMINI com imagem...', 'info');
        setProcessing(true);

        try {
            const result = await analyzeOrderWithGemini(window.debugBase64, selectedFile.type);

            if (result.success) {
                addLog('✅ Gemini analisou a imagem com sucesso!', 'success', {
                    metodo: result.metodo,
                    dataKeys: result.data ? Object.keys(result.data) : null,
                    preview: result.data
                });

                // Salvar resultado para próximos testes
                window.debugAIResult = result.data;
                setCurrentStep(3);

            } else {
                addLog('❌ Falha na análise com Gemini', 'error', result);
            }

        } catch (error) {
            addLog('❌ Erro inesperado no Gemini', 'error', {
                message: error.message,
                stack: error.stack
            });
        } finally {
            setProcessing(false);
        }
    };

    const runFullTest = async () => {
        setDebugLogs([]);
        setCurrentStep(0);

        await testStep1_FileConversion();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await testStep2_AIAnalysis();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await testStep3_DataProcessing();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await testStep4_Validation();
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const testImageAnalysisDetailed = async () => {
        if (!selectedFile) {
            addLog('Nenhum arquivo selecionado', 'error');
            return;
        }

        if (!window.debugBase64) {
            addLog('Base64 não disponível. Execute o Passo 1 primeiro.', 'error');
            return;
        }

        setProcessing(true);
        addLog('=== TESTE DETALHADO DE ANÁLISE DE IMAGEM ===', 'info');

        try {
            addLog('Configurações da análise:', 'info', {
                arquivoNome: selectedFile.name,
                arquivoTipo: selectedFile.type,
                arquivoTamanho: selectedFile.size,
                base64Length: window.debugBase64.length,
                hasGeminiKey: !!import.meta.env.VITE_GEMINI_API_KEY
            });

            addLog('Iniciando análise com Gemini (versão debug)...', 'info');

            // Remover o prefixo data:image se existir
            const base64Clean = window.debugBase64.replace(/^data:image\/[a-z]+;base64,/, '');

            // Fazer a análise
            const aiResult = await analyzeOrderWithGemini(base64Clean, selectedFile.type);

            addLog('=== RESULTADO COMPLETO DA ANÁLISE ===', 'info', {
                success: aiResult.success,
                temDados: !!aiResult.data,
                temErro: !!aiResult.error,
                metodo: aiResult.metodo
            });

            if (aiResult.success && aiResult.data) {
                addLog('Dados extraídos com sucesso:', 'success', aiResult.data);

                // Análise detalhada dos dados
                const dados = aiResult.data;
                addLog('=== ANÁLISE DETALHADA DOS DADOS ===', 'info');
                addLog('Informações básicas:', 'info', {
                    numeroPedido: dados.numeroPedido,
                    dataEmissao: dados.dataEmissao,
                    cliente: dados.cliente,
                    fornecedor: dados.fornecedor,
                    valorTotal: dados.valorTotalPedido
                });

                if (dados.produtosFast && dados.produtosFast.length > 0) {
                    addLog(`Produtos Fast encontrados (${dados.produtosFast.length}):`, 'success');
                    dados.produtosFast.forEach((produto, index) => {
                        addLog(`Produto ${index + 1}:`, 'info', {
                            codigo: produto.codigo,
                            nome: produto.nome,
                            quantidade: produto.quantidade,
                            valorTotal: produto.valorTotal,
                            pontos: produto.pontosCalculados
                        });
                    });
                } else {
                    addLog('Nenhum produto Fast identificado', 'warning');
                }

                if (dados.outrosProdutos && dados.outrosProdutos.length > 0) {
                    addLog(`Outros produtos (${dados.outrosProdutos.length}):`, 'info');
                    dados.outrosProdutos.forEach((produto, index) => {
                        addLog(`Outro produto ${index + 1}:`, 'info', {
                            codigo: produto.codigo,
                            nome: produto.nome,
                            valorTotal: produto.valorTotal,
                            motivo: produto.motivo
                        });
                    });
                }

                if (dados.resumo) {
                    addLog('Resumo da análise:', 'success', dados.resumo);
                }

                if (dados.validacoes) {
                    addLog('Status das validações:', 'info', dados.validacoes);
                }

            } else {
                addLog('Falha na análise:', 'error', {
                    erro: aiResult.error,
                    detalhes: aiResult
                });
            }

        } catch (error) {
            addLog('Erro crítico na análise:', 'error', {
                message: error.message,
                stack: error.stack
            });
        } finally {
            setProcessing(false);
        }
    };

    const testOCROnly = async () => {
        if (!selectedFile) {
            addLog('Nenhum arquivo selecionado', 'error');
            return;
        }

        if (!window.debugBase64) {
            addLog('Base64 não disponível. Execute o Passo 1 primeiro.', 'error');
            return;
        }

        setProcessing(true);
        addLog('=== TESTE APENAS OCR (EXTRAÇÃO DE TEXTO) ===', 'info');

        try {
            addLog('Iniciando extração de texto com Tesseract OCR...', 'info');

            // Limpar base64
            const base64Clean = window.debugBase64.replace(/^data:image\/[a-z]+;base64,/, '');

            // Extrair texto apenas
            const ocrResult = await extrairTextoDeImagem(base64Clean);

            if (ocrResult.success) {
                addLog('OCR concluído com sucesso!', 'success', {
                    confianca: Math.round(ocrResult.confidence),
                    tamanhoTexto: ocrResult.text.length,
                    totalLinhas: ocrResult.lines.length,
                    analise: ocrResult.analysis
                });

                addLog('TEXTO EXTRAÍDO (primeiros 1000 caracteres):', 'info');
                addLog(ocrResult.text.substring(0, 1000), 'info');

                if (ocrResult.text.length > 1000) {
                    addLog('... (texto continua)', 'info');
                }

                // Salvar no window para uso posterior
                window.debugOCRText = ocrResult.text;
                window.debugOCRResult = ocrResult;

            } else {
                addLog('Falha na extração OCR:', 'error', {
                    erro: ocrResult.error
                });
            }

        } catch (error) {
            addLog('Erro crítico no OCR:', 'error', {
                message: error.message,
                stack: error.stack
            });
        } finally {
            setProcessing(false);
        }
    };

    const testOCRPlusGemini = async () => {
        if (!selectedFile) {
            addLog('Nenhum arquivo selecionado', 'error');
            return;
        }

        if (!window.debugBase64) {
            addLog('Base64 não disponível. Execute o Passo 1 primeiro.', 'error');
            return;
        }

        setProcessing(true);
        addLog('=== TESTE OCR + GEMINI (ANÁLISE COMPLETA) ===', 'info');

        try {
            addLog('Iniciando análise completa OCR + Gemini...', 'info');

            // Limpar base64
            const base64Clean = window.debugBase64.replace(/^data:image\/[a-z]+;base64,/, '');

            // Análise completa
            const result = await analyzeOrderWithOCR(base64Clean, selectedFile.type);

            addLog('=== RESULTADO DA ANÁLISE COMPLETA ===', 'info', {
                success: result.success,
                metodo: result.metodo,
                ocrConfidence: result.ocrConfidence,
                textLength: result.textLength
            });

            if (result.success && result.data) {
                addLog('Análise completa concluída com sucesso!', 'success');

                // Análise detalhada dos dados
                const dados = result.data;
                addLog('=== DADOS ESTRUTURADOS PELO GEMINI ===', 'info');
                addLog('Informações básicas:', 'info', {
                    numeroPedido: dados.numeroPedido,
                    dataEmissao: dados.dataEmissao,
                    cliente: dados.cliente,
                    fornecedor: dados.fornecedor,
                    valorTotal: dados.valorTotalPedido
                });

                if (dados.produtosFast && dados.produtosFast.length > 0) {
                    addLog(`Produtos Fast encontrados (${dados.produtosFast.length}):`, 'success');
                    dados.produtosFast.forEach((produto, index) => {
                        addLog(`Produto ${index + 1}:`, 'info', {
                            codigo: produto.codigo,
                            nome: produto.nome,
                            quantidade: produto.quantidade,
                            valorTotal: produto.valorTotal,
                            pontos: produto.pontosCalculados
                        });
                    });

                    const totalPontos = dados.produtosFast.reduce((sum, p) => sum + (p.pontosCalculados || 0), 0);
                    addLog(`TOTAL DE PONTOS CALCULADOS: ${totalPontos}`, 'success');
                } else {
                    addLog('Nenhum produto Fast identificado', 'warning');
                }

                if (dados.resumo) {
                    addLog('Resumo da análise:', 'success', dados.resumo);
                }

                // Salvar resultado
                window.debugOCRGeminiResult = result;

            } else {
                addLog('Falha na análise completa:', 'error', {
                    erro: result.error
                });
            }

        } catch (error) {
            addLog('Erro crítico na análise completa:', 'error', {
                message: error.message,
                stack: error.stack
            });
        } finally {
            setProcessing(false);
        }
    };

    const steps = [
        'Arquivo Selecionado',
        'Conversão Base64',
        'Análise IA',
        'Processamento',
        'Validação',
        'Concluído'
    ];

    return (
        <Container>
            <Title>🔧 Debug - Upload de Pedidos</Title>

            <DebugSection>
                <DebugTitle>📁 Seleção de Arquivo</DebugTitle>
                <FileInput
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                />

                {selectedFile && (
                    <StatusMessage type="success">
                        ✅ Arquivo: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </StatusMessage>
                )}
            </DebugSection>

            <DebugSection>
                <DebugTitle>📋 Passos do Processo</DebugTitle>
                {steps.map((step, index) => (
                    <Step
                        key={index}
                        completed={currentStep > index}
                        active={currentStep === index}
                    >
                        {currentStep > index ? '✅' : currentStep === index ? '⏳' : '⚪'} {step}
                    </Step>
                ))}
            </DebugSection>

            <DebugSection>
                <DebugTitle>🧪 Testes Individuais</DebugTitle>
                <Button onClick={testGeminiAPI} disabled={processing}>
                    🟢 Teste Gemini API
                </Button>
                <Button onClick={testGeminiWithImage} disabled={!window.debugBase64 || processing}>
                    🖼️ Gemini + Imagem
                </Button>
                <Button onClick={testSimpleAPI} disabled={processing}>
                    🔍 Teste Simples API (Gemini)
                </Button>
                <Button onClick={testImageAnalysisOnly} disabled={!window.debugBase64 || processing}>
                    🖼️ Teste Só Imagem (Gemini)
                </Button>
                <Button onClick={testStep1_FileConversion} disabled={!selectedFile}>
                    1️⃣ Testar Conversão Base64
                </Button>
                <Button onClick={testStep2_AIAnalysis} disabled={!window.debugBase64 || processing}>
                    2️⃣ Testar Análise IA (Gemini) {processing && '(Processando...)'}
                </Button>
                <Button onClick={testStep2_AnalyzeOrder} disabled={!selectedFile || processing}>
                    2️⃣ Testar Análise Simulada
                </Button>
                <Button onClick={testStep3_DataProcessing} disabled={!window.debugAIResult}>
                    3️⃣ Testar Processamento
                </Button>
                <Button onClick={testStep4_Validation} disabled={!window.debugProcessedOrder}>
                    4️⃣ Testar Validação
                </Button>
                <Button onClick={runFullTest} disabled={!selectedFile || processing}>
                    🚀 Executar Teste Completo
                </Button>
                <Button onClick={testAPIConnection} disabled={processing}>
                    🌐 Testar Conectividade API
                </Button>
                <Button onClick={testGeminiAPI} disabled={processing}>
                    🟢 Testar Conectividade Gemini
                </Button>
                <Button onClick={testGeminiWithImage} disabled={!window.debugBase64 || processing}>
                    🖼️ Teste Gemini com Imagem
                </Button>
                <Button onClick={testImageAnalysisDetailed} disabled={!window.debugBase64 || processing}>
                    🔍 Análise Detalhada (DEBUG)
                </Button>
                <Button onClick={testOCROnly} disabled={!window.debugBase64 || processing}>
                    📝 Teste APENAS OCR
                </Button>
                <Button onClick={testOCRPlusGemini} disabled={!window.debugBase64 || processing}>
                    🔥 OCR + GEMINI (COMPLETO)
                </Button>
            </DebugSection>

            <DebugSection>
                <DebugTitle>📝 Logs de Debug</DebugTitle>
                {debugLogs.length === 0 ? (
                    <p>Nenhum log ainda. Selecione um arquivo e execute os testes.</p>
                ) : (
                    debugLogs.map((log, index) => (
                        <StatusMessage key={index} type={log.type}>
                            <strong>[{log.timestamp}]</strong> {log.message}
                            {log.data && (
                                <CodeBlock>{JSON.stringify(log.data, null, 2)}</CodeBlock>
                            )}
                        </StatusMessage>
                    ))
                )}
            </DebugSection>
        </Container>
    );
};

export default DebugUpload;
