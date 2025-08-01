import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FiUpload, FiFile, FiCheck, FiX, FiStar, FiInfo } from 'react-icons/fi';
import { analyzeOrderWithGemini } from '../services/geminiService';
import { processOrderResult, validateOrder, validarPontosCalculados } from '../utils/pedidosFast'; // removed getProdutosElegiveis import
import { saveOrder, saveOrderItems, addPointsToCustomer, checkOrderExists } from '../services/supabase';
import { getPointsPerReal } from '../utils/config';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Container otimizado para responsividade
const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 1rem;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 900px) {
    padding: 0.5rem;
    height: auto;
    margin-top: -9vh;
  }
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

const MinimalContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border: 1px solid #e3e6ea;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 900px) {
    padding: 1rem;
    max-width: calc(100vw - 1rem);
  }
`;

const MinimalHeader = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.7rem;
    font-weight: 700;
    color: #A91918;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    @media (max-width: 600px) {
      font-size: 1.4rem;
    }
  }
  
  p {
    color: #555;
    font-size: 1rem;
    margin: 0;
    
    @media (max-width: 600px) {
      font-size: 0.9rem;
    }
  }
`;

const MinimalUpload = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 500px;
  border: 1px dashed #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  
  &:hover {
    border-color: #A91918;
    background: #fff;
  }
  
  @media (max-width: 600px) {
    padding: 1.5rem 1rem;
    max-width: 100%;
  }
`;

const MinimalButton = styled.button`
  background: #A91918;
  color: #fff;
  border: none;
  padding: 0.9rem 1.5rem;
  font-size: 1.08rem;
  font-weight: 600;
  margin-top: 1.2rem;
  width: 100%;
  max-width: 420px;
  align-self: center;
  cursor: pointer;
  transition: background 0.2s;
  @media (max-width: 600px) {
    max-width: 98vw;
  }
  &:hover:enabled {
    background: #8B1510;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const MinimalResult = styled.div`
  width: 100%;
  max-width: 480px;
  background: #f9f9f9;
  border: 1px solid #e3e6ea;
  padding: 1.5rem 1rem;
  margin-top: 1.5rem;
  text-align: center;

  @media (max-width: 600px) {
    max-width: 98vw;
    padding: 1rem 0.5rem;
  }
  h2 {
    font-size: 1.2rem;
    color: #222;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .success {
    color: #28a745;
  }
  .error {
    color: #A91918;
  }
  .summary {
    margin: 1rem 0 0.5rem 0;
    font-size: 1.05rem;
    color: #444;
  }
`;

const MinimalTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.2rem;
  font-size: 0.97rem;
  th, td {
    padding: 0.5rem 0.3rem;
    text-align: left;
  }
  th {
    color: #A91918;
    font-weight: 600;
    border-bottom: 1px solid #eee;
    font-size: 0.95rem;
  }
  tr:not(:last-child) td {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const ExcelTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin: 0;
`;
const ExcelTd = styled.td`
  border: 1px solid #e3e6ea;
  padding: 12px 14px;
  font-size: 15px;
  color: #222;
  background: #f9f9f9;
  vertical-align: middle;
  text-align: left;
`;
const ExcelTh = styled.td`
  border: 1px solid #e3e6ea;
  background: #fff;
  text-align: left;
  color: #1d1d1b;
  font-weight: 500;
  padding: 12px 14px;
  font-size: 15px;
  min-width: 140px;
  vertical-align: middle;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 2px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #fff;
  background: ${({ status }) =>
    status === 'Coletado' ? '#3CB371' : '#FFC107'};
  margin-left: 6px;
  vertical-align: middle;
`;

const CodigoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  border: 1.5px dashed #A91918;
  padding: 12px 18px;
  font-size: 1.15rem;
  font-weight: 700;
  color: #A91918;
  margin-top: 18px;
  margin-bottom: 6px;
  letter-spacing: 1px;
  user-select: all;
`;

const CodigoAviso = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  color: #A91918;
  font-size: 14px;
  margin-bottom: 10px;
  margin-top: 2px;
  font-weight: 500;
`;

function UploadPedidoNovo({ user, onUserUpdate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Apenas JPG, PNG ou PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande (máx 10MB).');
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      // Converter arquivo para base64
      const base64 = await fileToBase64(selectedFile);

      let aiResult;
      let dailyLimitExceeded = false;

      // 🤖 ANÁLISE COM GOOGLE GEMINI (PROCESSAMENTO PRINCIPAL)
      let usingFallback = false; // Não usamos fallback mais
      let processingMethod = 'gemini'; // Método padrão

      try {
        console.log('🤖 Analisando nota fiscal com Google Gemini...');
        aiResult = await analyzeOrderWithGemini(base64, selectedFile.type);

        if (aiResult.success) {
          console.log('✅ Gemini analisou com sucesso');
        } else {
          throw new Error(aiResult.error || 'Erro na análise do documento');
        }

      } catch (geminiError) {
        console.warn('⚠️ Erro na API Gemini:', geminiError.message);

        // Verificar se é erro de quota/limite diário
        if (geminiError.message.includes('429') ||
          geminiError.message.includes('quota') ||
          geminiError.message.includes('rate_limit') ||
          geminiError.message.includes('usage_limit') ||
          geminiError.message.includes('resource_exhausted')) {

          console.log('🚨 Gemini: Limite diário excedido');

          // Mostrar mensagem específica para limite diário
          setResult({
            orderNumber: `LIMIT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            customer: 'Sistema Fast',
            totalValue: 0,
            items: [],
            totalPoints: 0,
            allProducts: [],
            isQuotaLimit: true,
            usingFallback: false,
            processingMethod: 'quota_limit',
            error: true,
            errorMessage: 'Limite diário do Google Gemini excedido.'
          });
          return;

          // Verificar se é erro de JSON malformado
        } else if (geminiError.message.includes('JSON') ||
          geminiError.message.includes('Expected double-quoted') ||
          geminiError.message.includes('Unexpected token') ||
          geminiError.message.includes('Unexpected end of JSON')) {

          console.log('🔧 Erro de parsing JSON - tentando reprocessar...');

          // Tentar novamente uma vez para erros de JSON
          try {
            console.log('🔄 Tentativa #2 de análise com Gemini...');
            aiResult = await analyzeOrderWithGemini(base64, selectedFile.type);

            if (aiResult.success) {
              console.log('✅ Sucesso na segunda tentativa');
            } else {
              throw new Error('Falha na segunda tentativa');
            }
          } catch (secondError) {
            console.error('❌ Falha definitiva após segunda tentativa:', secondError);

            setResult({
              orderNumber: `ERROR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              customer: 'Sistema Fast',
              totalValue: 0,
              items: [],
              totalPoints: 0,
              allProducts: [],
              error: true,
              errorMessage: 'Erro no processamento da imagem. O documento pode estar muito borrado ou com formato não suportado. Tente uma imagem mais nítida.'
            });
            return;
          }
        } else {
          // Outros erros da API
          console.error('❌ Erro geral na API Gemini:', geminiError);

          setResult({
            orderNumber: `ERROR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            customer: 'Sistema Fast',
            totalValue: 0,
            totalPoints: 0,
            items: [],
            allProducts: [],
            error: true,
            errorMessage: 'Erro no processamento da imagem. O documento pode estar muito borrado ou com formato não suportado. Tente uma imagem mais nítida.'
          });
          return;
        }
      }

      // Aguardando o processamento de dados pela IA
      const processedOrder = await processOrderResult(aiResult.data); // Garantir que a promise seja resolvida

      // 🔍 LOG DETALHADO: Verificar dados processados
      console.log('📊 DADOS PROCESSADOS COMPLETOS:', {
        orderNumber: processedOrder.orderNumber,
        orderDate: processedOrder.orderDate,
        totalValue: processedOrder.totalValue,
        totalPoints: processedOrder.totalPoints,
        items: processedOrder.items,
        allProducts: processedOrder.allProducts,
      });

      // 🔍 LOG CRÍTICO: Verificar se totalPoints foi perdido durante processamento
      console.log('🔍 VERIFICAÇÃO TOTALPOINTS APÓS PROCESSAMENTO:', {
        'processedOrder.totalPoints': processedOrder.totalPoints,
        'tipo': typeof processedOrder.totalPoints,
        'é número': typeof processedOrder.totalPoints === 'number',
        'é maior que 0': processedOrder.totalPoints > 0,
        'itens com pontos': processedOrder.items?.filter(item => item.points > 0) || [],
        'soma manual dos pontos': processedOrder.items?.reduce((acc, item) => acc + (item.points || 0), 0) || 0
      });

      // 🔧 CORREÇÃO FORÇADA: Garantir que totalPoints seja SEMPRE a soma dos itens com pontos
      // const somaPontosCalculada = processedOrder.items?.reduce((acc, item) => acc + (Number(item.points) || 0), 0) || 0;
      // processedOrder.totalPoints = somaPontosCalculada;
      // Agora pontuar por valor total
      const multiplier = getPointsPerReal();
      const calculatedPoints = Math.floor((processedOrder.totalValue || 0) * multiplier);
      processedOrder.totalPoints = calculatedPoints;
      console.log('🔧 Pontos calculados por valor total:', { totalValue: processedOrder.totalValue, multiplier, calculatedPoints });

      // Validar pedido
      const validation = await validateOrder(processedOrder);

      // ✅ APENAS LOG DE WARNINGS - NÃO BLOQUEAR PROCESSAMENTO
      if (validation.warnings && validation.warnings.length > 0) {
        console.log('Avisos de validação:', validation.warnings);
      }

      if (validation.errors && validation.errors.length > 0) {
        console.log('Erros de validação (não bloqueando):', validation.errors);
      }

      // VALIDAÇÃO DE PONTOS: Verificar se os cálculos estão corretos
      if (processedOrder.items && processedOrder.items.length > 0) {
        try {
          const validacaoPontos = await validarPontosCalculados(processedOrder.items);

          if (!validacaoPontos.todosCorretos) {
            console.warn('⚠️ Alguns pontos podem estar incorretos, mas prosseguindo com totalPoints atual...');
            // NÃO sobrescrever totalPoints aqui pois já foi corrigido acima
          } else {
            console.log('✅ Todos os pontos foram validados e estão corretos!');
          }
        } catch (validationError) {
          console.warn('⚠️ Erro na validação de pontos, mas prosseguindo...', validationError);
        }
      }

      // Salvar no banco
      const customerId = user.id;

      // 🔍 LOG CRÍTICO: Verificar se user.id está presente
      console.log('🔍 VERIFICAÇÃO CRÍTICA - DADOS DO USUÁRIO:', {
        user_completo: user,
        user_id: user?.id,
        customerId,
        user_id_type: typeof user?.id,
        user_exists: !!user,
        user_id_exists: !!user?.id
      });

      if (!customerId) {
        console.error('❌ ERRO CRÍTICO: user.id não está definido!');
        setError('Erro: usuário não identificado. Faça login novamente.');
        return;
      }

      // Log de verificação antes de salvar
      console.log('🔍 Dados que serão salvos no banco:', {
        cliente_id: customerId,
        numero_pedido: processedOrder.orderNumber,
        data_emissao: processedOrder.orderDate,
        valor_total: processedOrder.totalValue,
        hash_documento: processedOrder.documentHash,
        pontos_gerados: processedOrder.totalPoints,
        status: 'processado'
      })

      // Salvar pedido principal
      const savedOrder = await saveOrder({
        cliente_id: customerId,
        numero_pedido: processedOrder.orderNumber,
        data_emissao: processedOrder.orderDate,
        valor_total: processedOrder.totalValue,
        hash_documento: processedOrder.documentHash,
        pontos_gerados: processedOrder.totalPoints,
        status: 'processado' // Sempre usar 'processado' - o que importa são os pontos
      });

      // Salvar itens do pedido (apenas se houver itens)
      if (processedOrder.items && processedOrder.items.length > 0) {
        for (const item of processedOrder.items) {
          await saveOrderItems({
            pedido_id: savedOrder.id,
            produto_catalogo_id: item.product_id,
            nome_produto: item.product_name,
            codigo_produto: item.product_code,
            quantidade: item.quantity,
            valor_unitario: item.unit_price,
            valor_total: item.total_value,
            pontos_calculados: item.points,
            categoria: item.category,
            produto_fast: true
          });
        }
      }

      // 🔍 LOG FINAL: Dados que serão exibidos na interface
      console.log('🎯 DADOS PARA A INTERFACE:', {
        orderNumber: processedOrder.orderNumber,
        totalValue: processedOrder.totalValue,
        totalPoints: processedOrder.totalPoints,
        items: processedOrder.items,
        allProducts: processedOrder.allProducts,
        orderId: savedOrder.id
      });

      // ✅ RESULTADO FINAL PARA A INTERFACE - COM GARANTIA DE totalPoints
      const totalPointsGarantido = processedOrder.totalPoints || processedOrder.items?.reduce((acc, item) => acc + (Number(item.points) || 0), 0) || 0;

      const resultadoFinal = {
        orderNumber: processedOrder.orderNumber,
        orderDate: processedOrder.orderDate,
        customer: processedOrder.customer,
        totalValue: processedOrder.totalValue,
        items: processedOrder.items,
        totalPoints: totalPointsGarantido,
        documentHash: processedOrder.documentHash,
        allProducts: processedOrder.allProducts,
        orderId: savedOrder.id,
        usingFallback: usingFallback, // Informar se usou IA simulada
        processingMethod: processingMethod // Informar qual método foi usado
      };

      console.log('🔒 RESULTADO FINAL GARANTIDO:', {
        'totalPoints original': processedOrder.totalPoints,
        'totalPoints garantido': totalPointsGarantido,
        'totalPoints no resultado': resultadoFinal.totalPoints
      });

      // 🔍 LOG CRÍTICO: Verificar totalPoints ANTES de creditar
      console.log('🔍 VERIFICAÇÃO CRÍTICA ANTES DO CRÉDITO:', {
        'resultadoFinal.totalPoints': resultadoFinal.totalPoints,
        'tipo de resultadoFinal.totalPoints': typeof resultadoFinal.totalPoints,
        'resultadoFinal.totalPoints > 0': resultadoFinal.totalPoints > 0,
        'resultadoFinal.totalPoints === 0': resultadoFinal.totalPoints === 0,
        'processedOrder.items.length': processedOrder.items?.length || 0,
        'processedOrder.items': processedOrder.items,
        'soma pontos dos items': processedOrder.items?.reduce((acc, item) => acc + (item.points || 0), 0) || 0
      });

      // Adicionar pontos ao cliente (apenas se houver pontos)
      if (resultadoFinal.totalPoints > 0) {
        try {
          console.log('💰 Iniciando crédito de pontos para o cliente:', {
            customerId,
            pontos: resultadoFinal.totalPoints,
            orderNumber: processedOrder.orderNumber
          });

          const updatedCustomer = await addPointsToCustomer(customerId, resultadoFinal.totalPoints, `Pedido ${processedOrder.orderNumber}`);

          console.log('✅ Pontos creditados com sucesso:', {
            saldoAnterior: user.saldo_pontos,
            pontosAdicionados: resultadoFinal.totalPoints,
            novoSaldo: updatedCustomer.saldo_pontos
          });

          // Atualizar contexto global do usuário para refletir novos pontos
          if (window.updateUserContext) {
            await window.updateUserContext({
              saldo_pontos: updatedCustomer.saldo_pontos,
              total_pontos_ganhos: updatedCustomer.total_pontos_ganhos
            });
          }

          // Atualizar via prop callback também
          if (onUserUpdate) {
            onUserUpdate({
              ...user,
              saldo_pontos: updatedCustomer.saldo_pontos,
              total_pontos_ganhos: updatedCustomer.total_pontos_ganhos
            });
          }

          // Forçar refresh global (dashboard)
          if (window.triggerGlobalRefresh) {
            window.triggerGlobalRefresh();
          }

          // Disparar evento global para outros componentes atualizarem
          window.dispatchEvent(new CustomEvent('userUpdated'));

          // Incluir saldo atualizado no resultado para interface
          resultadoFinal.saldoAtualizado = updatedCustomer.saldo_pontos;

        } catch (error) {
          console.error('❌ Erro ao creditar pontos:', error);
          setError('Erro ao creditar pontos no banco de dados. Tente novamente.');
          setResult({
            ...resultadoFinal,
            error: true,
            errorMessage: 'Erro ao creditar pontos no banco de dados. Tente novamente.'
          });
          return;
        }
      } else {
        console.log('ℹ️ Nenhum ponto para creditar (totalPoints =', resultadoFinal.totalPoints, ')');
      }

      console.log('🎯 RESULTADO FINAL DEFINIDO NO setResult:', resultadoFinal);
      console.log('🔍 VERIFICAÇÃO SPREAD OPERATOR:', {
        'processedOrder.orderNumber': processedOrder.orderNumber,
        'processedOrder.totalValue': processedOrder.totalValue,
        'processedOrder.totalPoints': processedOrder.totalPoints,
        'processedOrder.items': processedOrder.items,
        'processedOrder.allProducts': processedOrder.allProducts,
        'savedOrder.id': savedOrder.id
      });

      // 🚨 LOG CRÍTICO ANTES DO setResult
      console.log('🚨 ANTES DO setResult - DADOS QUE SERÃO PASSADOS:', {
        'typeof resultadoFinal': typeof resultadoFinal,
        'resultadoFinal keys': Object.keys(resultadoFinal),
        'resultadoFinal.items': resultadoFinal.items,
        'resultadoFinal.allProducts': resultadoFinal.allProducts,
        'resultadoFinal.totalPoints': resultadoFinal.totalPoints,
        'resultadoFinal.orderNumber': resultadoFinal.orderNumber,
        'Array.isArray(resultadoFinal.items)': Array.isArray(resultadoFinal.items),
        'Array.isArray(resultadoFinal.allProducts)': Array.isArray(resultadoFinal.allProducts),
        'JSON completo': JSON.stringify(resultadoFinal, null, 2)
      });

      // 🎯 APLICAR O RESULTADO FINAL DIRETAMENTE
      const resultadoSeguro = {
        ...resultadoFinal,
        // Garantir que campos essenciais existam
        allProducts: resultadoFinal.allProducts || [],
        items: resultadoFinal.items || [],
        totalPoints: resultadoFinal.totalPoints ?? 0, // Usar nullish coalescing para preservar 0 como valor válido
        totalValue: resultadoFinal.totalValue ?? 0    // Usar nullish coalescing para preservar 0 como valor válido
      };

      console.log('🔒 APLICANDO RESULTADO SEGURO:', {
        'resultadoSeguro.totalPoints': resultadoSeguro.totalPoints,
        'typeof resultadoSeguro.totalPoints': typeof resultadoSeguro.totalPoints,
        'resultadoSeguro.totalPoints === 0': resultadoSeguro.totalPoints === 0,
        'resultadoSeguro completo': resultadoSeguro
      });
      setResult(resultadoSeguro);
      console.log('✅ RESULTADO APLICADO COM SUCESSO');

    } catch (err) {
      console.error('Erro ao processar pedido:', err);

      // 🚨 TRATAMENTO ESPECÍFICO PARA ERRO DE QUOTA DA API
      if (err.message && (err.message.includes('429') || err.message.includes('quota'))) {
        setResult({
          orderNumber: `QUOTA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          customer: 'Cliente',
          totalValue: 0,
          totalPoints: 0,
          items: [],
          allProducts: [],
          isQuotaLimit: true,
          usingFallback: false,
          processingMethod: 'quota_limit',
          error: true,
          errorMessage: 'Limite diário da API excedido.'
        });
        return;
      }

      // Outros erros genéricos
      setError('Erro ao processar o pedido. Tente novamente.');
      setResult({
        orderNumber: `ERROR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        customer: 'Sistema Fast',
        totalValue: 0,
        totalPoints: 0,
        items: [],
        allProducts: [],
        error: true,
        errorMessage: 'Erro no processamento da imagem. O documento pode estar muito borrado ou com formato não suportado. Tente uma imagem mais nítida.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remover prefixo "data:*/*;base64," para economizar espaço
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <Container>
      <MainContent>
        <MinimalContainer>
          <MinimalHeader>
            <h1>Enviar Nota Fiscal</h1>
            <p>Faça upload da nota fiscal para processar seus pontos.</p>
          </MinimalHeader>
          <MinimalUpload htmlFor="file-upload">
            <input id="file-upload" type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={handleFileInput} />
            <FiFile size={38} color={selectedFile ? '#28a745' : '#A91918'} style={{ marginBottom: 8 }} />
            <div style={{ color: '#444', fontWeight: 500, marginBottom: 4 }}>
              {selectedFile ? selectedFile.name : 'Arraste ou clique para selecionar'}
            </div>
            <div style={{ color: '#888', fontSize: 13 }}>
              {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'JPG, PNG ou PDF, até 10MB'}
            </div>
          </MinimalUpload>
          <MinimalButton disabled={!selectedFile || isProcessing} onClick={handleProcess}>
            {isProcessing ? 'Processando...' : 'Processar Nota'}
          </MinimalButton>
          {isProcessing && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10, width: '100%', maxWidth: 420 }}>
              <div style={{ border: '4px solid #eee', borderTop: '4px solid #A91918', borderRadius: '50%', width: 38, height: 38, animation: 'spin 1s linear infinite', alignSelf: 'center' }} />
              <span style={{ color: '#A91918', marginTop: 8, fontSize: 15 }}>Processando nota, aguarde...</span>
            </div>
          )}
          {error && <div style={{ color: '#A91918', marginTop: 10, fontSize: 15, textAlign: 'center', width: '100%', maxWidth: 420 }}>{error}</div>}
          {result && (
            <MinimalResult>
              <h2 className={result.error ? 'error' : 'success'} style={{ justifyContent: 'flex-start', fontSize: 18, marginBottom: 18 }}>
                {result.error ? <FiX /> : <FiCheck />} {result.error ? 'Erro' : 'Nota processada'}
              </h2>
              <div className="summary" style={{ margin: 0 }}>
                <ExcelTable>
                  <tbody>
                    <tr>
                      <ExcelTh>Pedido</ExcelTh>
                      <ExcelTd>{result.orderNumber}</ExcelTd>
                    </tr>
                    <tr>
                      <ExcelTh>Data de Expedição</ExcelTh>
                      <ExcelTd>{result.orderDate ? new Date(result.orderDate).toLocaleDateString('pt-BR') : '-'}</ExcelTd>
                    </tr>
                    <tr>
                      <ExcelTh>Pontos Recebidos</ExcelTh>
                      <ExcelTd>{result.totalPoints}</ExcelTd>
                    </tr>
                    <tr>
                      <ExcelTh>Valor Total da Nota</ExcelTh>
                      <ExcelTd>R$ {Number(result.totalValue).toFixed(2)}</ExcelTd>
                    </tr>
                  </tbody>
                </ExcelTable>
                <div style={{ color: '#555', fontSize: 14, marginTop: 12, textAlign: 'left' }}>
                  {result.totalPoints} pontos recebidos para {Number(result.totalValue).toFixed(2)} reais
                </div>
                {/* Exibir código de retirada se existir */}
                {result.codigo_resgate && (
                  <>
                    <CodigoAviso><FiInfo style={{ fontSize: 18, color: '#A91918' }} /> Apresente este código para retirar seu produto em uma loja credenciada:</CodigoAviso>
                    <CodigoBox>{result.codigo_resgate}</CodigoBox>
                  </>
                )}
                {/* Exemplo de status visual, se necessário */}
                {result.status && (
                  <div style={{ marginTop: 8 }}>
                    <StatusBadge status={result.status}>{result.status}</StatusBadge>
                  </div>
                )}
              </div>
            </MinimalResult>
          )}
          <style>{`@keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }`}</style>
        </MinimalContainer>
      </MainContent>
    </Container>
  );
}

export default UploadPedidoNovo;
