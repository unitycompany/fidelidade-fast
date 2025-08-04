import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import imagemNotaFiscalService from '../services/imagemNotaFiscalService';
import diagnosticarSistemaImagens from '../scripts/diagnosticarImagens';
import criarBucketNotasFiscais from '../scripts/criarBucket';
import diagnosticoDetalhado from '../scripts/diagnosticoDetalhado';
import testeDirecto from '../scripts/testeDirecto';
import uploadSimplificado from '../scripts/uploadSimplificado';

const TestContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
`;

const Button = styled.button`
  background: #cc1515;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  margin-right: 1rem;
  margin-bottom: 1rem;
  
  &:hover {
    background: #9b0c0c;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  margin: 1rem 0;
  padding: 0.5rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.25rem;
  width: 100%;
`;

const LogArea = styled.pre`
  background: #1a1a1a;
  color: #00ff00;
  padding: 1rem;
  border-radius: 0.25rem;
  max-height: 400px;
  overflow-y: auto;
  font-size: 0.875rem;
  white-space: pre-wrap;
`;

const ClienteSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.25rem;
  margin: 0.5rem 0;
  width: 100%;
`;

function TesteUploadImagem() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState('bfc3daaa-3f26-4bf3-92e3-78dd84d853f8');
    const [logs, setLogs] = useState('');
    const [uploading, setUploading] = useState(false);
    const [clientes] = useState([
        // ID real do cliente existente no banco
        { id: 'bfc3daaa-3f26-4bf3-92e3-78dd84d853f8', nome: 'Cliente Real' },
        { id: '123e4567-e89b-12d3-a456-426614174000', nome: 'Cliente Teste 1 (inválido)' },
        { id: '987fcdeb-51a2-43d1-9f12-123456789abc', nome: 'Cliente Teste 2 (inválido)' }
    ]);

    const addLog = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => `${prev}[${timestamp}] ${message}\n`);
    };

    const clearLogs = () => {
        setLogs('');
    };

    // Interceptar console.log para mostrar nos logs
    React.useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => {
            originalLog(...args);
            addLog(`LOG: ${args.join(' ')}`);
        };

        console.error = (...args) => {
            originalError(...args);
            addLog(`ERROR: ${args.join(' ')}`);
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
        };
    }, []);

    const runDiagnostic = async () => {
        clearLogs();
        addLog('🔍 Iniciando diagnóstico...');
        await diagnosticarSistemaImagens();
        addLog('✅ Diagnóstico concluído!');
    };

    const createBucket = async () => {
        clearLogs();
        addLog('🚀 Verificando/criando bucket "notas-fiscais"...');

        try {
            const result = await criarBucketNotasFiscais();

            if (result.success) {
                addLog('✅ Bucket configurado com sucesso!');
                if (result.message) {
                    addLog(result.message);
                }
            } else {
                addLog('❌ Problema com o bucket:');
                if (result.message) {
                    addLog(result.message);
                } else {
                    addLog(`Erro: ${result.error?.message || result.error}`);
                }
            }
        } catch (error) {
            addLog(`💥 Erro inesperado: ${error.message}`);
        }
    };

    const runDetailedDiagnostic = async () => {
        clearLogs();
        addLog('🔍 Executando diagnóstico detalhado...');
        addLog('📋 Veja o console (F12) para detalhes completos');

        try {
            await diagnosticoDetalhado();
            addLog('✅ Diagnóstico detalhado concluído!');
            addLog('🔧 Verifique o console do navegador (F12) para análise completa');
        } catch (error) {
            addLog(`💥 Erro no diagnóstico: ${error.message}`);
        }
    };

    const runDirectTest = async () => {
        clearLogs();
        addLog('🎯 Executando teste direto do bucket...');

        try {
            const result = await testeDirecto();

            if (result.success) {
                addLog('✅ Teste direto bem-sucedido!');
                addLog(result.message);
                if (result.data) {
                    addLog(`📊 Funcionalidades testadas:`);
                    addLog(`   ✅ Acesso: ${result.data.canAccess ? 'OK' : 'FALHA'}`);
                    addLog(`   ✅ Upload: ${result.data.canUpload ? 'OK' : 'FALHA'}`);
                    addLog(`   ✅ Delete: ${result.data.canDelete ? 'OK' : 'FALHA'}`);
                    addLog(`   🔗 URL base: ${result.data.publicUrl}`);
                }
            } else {
                addLog('❌ Teste direto falhou:');
                addLog(`Erro: ${result.error}`);
                addLog(`Mensagem: ${result.message}`);

                if (result.error === 'BUCKET_NOT_FOUND') {
                    addLog('💡 SOLUÇÃO: Crie o bucket manualmente no painel do Supabase');
                } else if (result.error === 'PERMISSION_DENIED') {
                    addLog('💡 SOLUÇÃO: Execute as políticas RLS do arquivo SQL');
                }
            }
        } catch (error) {
            addLog(`💥 Erro inesperado: ${error.message}`);
        }
    };

    const testSimplifiedUpload = async () => {
        if (!selectedFile) {
            addLog('❌ Nenhum arquivo selecionado');
            return;
        }

        if (!selectedCliente) {
            addLog('❌ Nenhum cliente selecionado');
            return;
        }

        setUploading(true);
        clearLogs();
        addLog('� Iniciando upload SIMPLIFICADO...');
        addLog(`📄 Arquivo: ${selectedFile.name}`);
        addLog(`👤 Cliente: ${selectedCliente}`);

        try {
            const result = await uploadSimplificado(selectedFile, selectedCliente);

            addLog('� Resultado do upload simplificado:');
            addLog(JSON.stringify(result, null, 2));

            if (result.success) {
                addLog('✅ Upload simplificado bem-sucedido!');
                addLog(`🔗 URL: ${result.url}`);
                addLog(`📄 ID: ${result.data?.id}`);
            } else {
                addLog('❌ Upload simplificado falhou:');
                addLog(`Erro: ${result.error}`);
            }
        } catch (error) {
            addLog(`💥 Erro: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const testUpload = async () => {
        if (!selectedFile) {
            addLog('❌ Nenhum arquivo selecionado');
            return;
        }

        if (!selectedCliente) {
            addLog('❌ Nenhum cliente selecionado');
            return;
        }

        setUploading(true);
        clearLogs();
        addLog('🚀 Iniciando teste de upload...');
        addLog(`📄 Arquivo: ${selectedFile.name} (${selectedFile.size} bytes)`);
        addLog(`👤 Cliente: ${selectedCliente}`);

        try {
            // Log detalhado dos dados
            addLog('🔍 Dados do upload:');
            addLog(`   - Arquivo: ${selectedFile.name}`);
            addLog(`   - Tipo: ${selectedFile.type}`);
            addLog(`   - Tamanho: ${selectedFile.size} bytes`);
            addLog(`   - Cliente ID: ${selectedCliente}`);

            const result = await imagemNotaFiscalService.uploadImagem(
                selectedFile,
                selectedCliente,
                null, // pedidoId
                {
                    numeroNota: 'TESTE-' + Date.now(),
                    chaveAcesso: '12345678901234567890123456789012345678901234'
                }
            );

            addLog('📋 Resultado completo do upload:');
            addLog(JSON.stringify(result, null, 2));

            if (result.success) {
                addLog('✅ Upload realizado com sucesso!');
                addLog(`📄 ID da imagem: ${result.data?.id}`);
                addLog(`🔗 URL: ${result.url}`);

                // Verificar se realmente foi salvo no banco
                addLog('🔍 Verificando se foi salvo no banco...');
                const verificacao = await imagemNotaFiscalService.listarImagensCliente(selectedCliente);
                if (verificacao.success) {
                    addLog(`📊 Total de imagens do cliente: ${verificacao.data?.length || 0}`);
                    if (verificacao.data && verificacao.data.length > 0) {
                        const ultimaImagem = verificacao.data[verificacao.data.length - 1];
                        addLog(`� Última imagem: ${ultimaImagem.nome_arquivo}`);
                    }
                } else {
                    addLog(`❌ Erro ao verificar banco: ${verificacao.error}`);
                }

            } else {
                addLog('❌ Falha no upload:');
                addLog(`Erro: ${result.error}`);
                if (result.details) {
                    addLog(`Detalhes: ${JSON.stringify(result.details, null, 2)}`);
                }
            }
        } catch (error) {
            addLog(`💥 Erro inesperado: ${error.message}`);
            addLog(`Stack trace: ${error.stack}`);
        } finally {
            setUploading(false);
        }
    };

    const createTestClient = async () => {
        addLog('👤 Criando cliente de teste...');
        // Implementar criação de cliente de teste se necessário
        addLog('💡 Implemente a criação de cliente de teste se necessário');
    };

    return (
        <TestContainer>
            <h2>🧪 Teste do Sistema de Upload de Imagens</h2>

            <Section>
                <h3>🔍 Diagnóstico do Sistema</h3>
                <p>Execute o diagnóstico para verificar se tudo está configurado corretamente:</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Button onClick={runDiagnostic}>
                        Diagnóstico Rápido
                    </Button>
                    <Button onClick={runDirectTest} style={{ backgroundColor: '#10B981' }}>
                        🎯 Teste Direto
                    </Button>
                    <Button onClick={runDetailedDiagnostic} style={{ backgroundColor: '#3B82F6' }}>
                        🔬 Diagnóstico Detalhado
                    </Button>
                </div>
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '0.5rem' }}>
                    💡 Use o "Teste Direto" se o diagnóstico mostrar 0 buckets
                </p>
            </Section>

            <Section>
                <h3>🛠️ Configuração</h3>
                <p>Se o diagnóstico mostrou que o bucket não existe, clique aqui para verificar/configurar:</p>
                <Button onClick={createBucket} style={{ backgroundColor: '#10B981' }}>
                    � Verificar/Configurar Bucket
                </Button>
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '0.5rem' }}>
                    💡 Se não conseguir criar automaticamente, o sistema mostrará instruções para criação manual
                </p>
            </Section>

            <Section>
                <h3>📤 Teste de Upload</h3>

                <div>
                    <label>Selecionar Cliente:</label>
                    <ClienteSelect
                        value={selectedCliente}
                        onChange={(e) => setSelectedCliente(e.target.value)}
                    >
                        <option value="">Selecione um cliente...</option>
                        {clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.nome} ({cliente.id.substring(0, 8)}...)
                            </option>
                        ))}
                    </ClienteSelect>
                    <small>💡 Se não tem clientes, crie um no painel admin primeiro</small>
                </div>

                <div>
                    <label>Selecionar Arquivo:</label>
                    <FileInput
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    {selectedFile && (
                        <div>
                            <strong>Arquivo selecionado:</strong> {selectedFile.name}
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Button onClick={testUpload} disabled={uploading || !selectedFile || !selectedCliente}>
                        {uploading ? '📤 Enviando...' : '📤 Testar Upload'}
                    </Button>
                    <Button onClick={testSimplifiedUpload} disabled={uploading || !selectedFile || !selectedCliente} style={{ backgroundColor: '#10B981' }}>
                        🚀 Upload Simplificado
                    </Button>
                </div>
            </Section>

            <Section>
                <h3>🎛️ Utilitários</h3>
                <Button onClick={createTestClient}>👤 Criar Cliente de Teste</Button>
                <Button onClick={clearLogs}>🗑️ Limpar Logs</Button>
            </Section>

            <Section>
                <h3>📋 Logs do Sistema</h3>
                <LogArea>{logs || 'Nenhum log ainda...'}</LogArea>
            </Section>
        </TestContainer>
    );
}

export default TesteUploadImagem;
