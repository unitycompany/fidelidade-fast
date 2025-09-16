import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FiUpload, FiFile, FiCheck, FiX, FiStar, FiInfo, FiEye, FiTarget, FiDatabase, FiGift, FiFileText } from 'react-icons/fi';
import { analyzeOrderWithGemini } from '../services/geminiService';
import { processOrderResult, validateOrder, validarPontosCalculados } from '../utils/pedidosFast'; // removed getProdutosElegiveis import
import { saveOrder, saveOrderItems, addPointsToCustomer, checkOrderExists } from '../services/supabase';
import { getPointsPerReal } from '../utils/config';
import { sefazValidationService } from '../services/sefazValidation';
import sapService from '../services/sapService';
import LoadingGif from './LoadingGif';
import { notifyPointsEarned } from '../services/notificationManager.js';
import NotaFiscalInput from './NotaFiscalInput';
import imagemNotaFiscalService from '../services/imagemNotaFiscalService';

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

const slideOutUp = keyframes`
  from { 
    opacity: 1; 
    transform: translateY(0); 
  }
  to { 
    opacity: 0; 
    transform: translateY(-30px); 
  }
`;

const slideInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

// Novos estilos para seleção de modo
const InputModeSelector = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 1rem;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const ModeButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.8rem;
  background: ${props => props.active ? '#A91918' : '#f7fafc'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.active ? '#8B0000' : '#edf2f7'};
  }
`;

// Preview para localização do número na nota fiscal
const NFELocationPreview = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  margin-bottom: 1rem;
  border: 1px solid #eaeaea;
  
  p {
    margin-bottom: 0.8rem;
    font-size: 0.9rem;
    color: #A91918;
  }
  
  img {
    width: 100%;
    height: auto;
    max-height: 250px;
    border: 1px solid #e2e8f0;
    margin-bottom: 0.8rem;

    @media (max-width: 768px){
      height: 450px;
      object-fit: cover;
      object-position: right;
    }
  }
  
  span {
    font-size: 0.8rem;
    color: #666;
  }
`;

const fadeInRow = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pointsAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shine = keyframes`
  0% {
    background-position: -100% center;
  }
  100% {
    background-position: 100% center;
  }
`;

const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
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
  padding: 0.8rem;
  margin-bottom: 1rem;
  width: 100%;
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

const SecondaryButton = styled.button`
  background: transparent;
  color: #A91918;
  border: 1px solid #A91918;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 400;
  margin-top: 1.5rem;
  width: 100%;
  max-width: 320px;
  align-self: center;
  cursor: pointer;
  transition: all 0.2s;
  @media (max-width: 600px) {
    max-width: 98vw;
  }
  &:hover {
    background: #A91918;
    color: #fff;
  }
`;

const MinimalResult = styled.div`
  width: 100%;
  max-width: 480px;
  background: #fff;
  border: 1px solid #e3e6ea;
  padding: 2rem 1.5rem;
  margin-top: 1.5rem;
  text-align: center;
  animation: ${bounceIn} 0.6s ease-out;

  @media (max-width: 600px) {
    max-width: 98vw;
    padding: 1.5rem 1rem;
  }
  h2 {
    font-size: 1.3rem;
    color: #222;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    animation: ${fadeInRow} 0.5s ease-out;
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

const AnimatedTableRow = styled.tr`
  animation: ${fadeInRow} 0.6s ease-out;
  animation-delay: ${props => props.$delay || 0}s;
  animation-fill-mode: both;
`;

const PointsHighlight = styled.div`
  background: #A91918;
  color: white;
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 300;
  text-align: center;
  animation: ${pointsAnimation} 0.8s ease-out;
  animation-delay: 1.6s;
  animation-fill-mode: both;
  position: relative;
  overflow: hidden;
  
  .points-number {
    background: linear-gradient(
      90deg,
      #fff 0%,
      #dfdfdf 50%,
      #fff 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shine} 2s ease-in-out infinite;
    font-weight: 500;
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
    status === 'Retirado' ? '#3CB371' : '#FFC107'};
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

const ProcessingContainer = styled.div`
  width: 100%;
  max-width: 500px;
  background: transparent;
  padding: 2rem;
  margin-top: 1.5rem;
  text-align: center;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CurrentStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
`;

const StepSpinnerLarge = styled.div`
  width: 80px;
  height: 80px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #A91918;
  border-right: 4px solid #A91918;
  border-radius: 50%;
  animation: ${spin} 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  position: relative;
  background: radial-gradient(circle, rgba(169, 25, 24, 0.1) 0%, transparent 70%);
  
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    border: 2px solid transparent;
    border-top: 2px solid #A91918;
    border-left: 2px solid rgba(169, 25, 24, 0.5);
    border-radius: 50%;
    animation: ${spin} 1.5s linear infinite reverse;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 18px;
    left: 18px;
    right: 18px;
    bottom: 18px;
    border: 1px solid transparent;
    border-top: 1px solid #ff6b6b;
    border-right: 1px solid rgba(255, 107, 107, 0.6);
    border-radius: 50%;
    animation: ${spin} 2.5s ease-in-out infinite;
  }
`;

const StepText = styled.div`
  color: #A91918;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  animation: ${slideInUp} 0.6s ease-out;
  min-height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StepIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.completed ? '#28a745' : props.active ? '#A91918' : '#ccc'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  min-width: 24px;
`;

function UploadPedidoNovo({ user, onUserUpdate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [stepTextKey, setStepTextKey] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showAnimatedRows, setShowAnimatedRows] = useState(false);

  const processingSteps = [
    { id: 1, text: 'Enviando ao n8n', icon: FiUpload },
    { id: 2, text: 'Creditando pontos', icon: FiGift },
    { id: 3, text: 'Salvando nota fiscal', icon: FiDatabase }
  ];

  const updateProcessingStep = (stepId, completed = false) => {
    setCurrentStep(stepId);
    setStepTextKey(prev => prev + 1); // Força re-render da animação
    if (completed) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setResult(null);
    setError('');
    setCurrentStep(0);
    setCompletedSteps([]);
    setStepTextKey(0);
    setShowResult(false);
    setShowAnimatedRows(false);
  };

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
    setShowResult(false);
    setCurrentStep(0);
    setCompletedSteps([]);

    try {
      // Etapa 1: Enviar dados ao webhook n8n
      updateProcessingStep(1);
      
      let base64, mimeType, format, fileType;
      
      // Verificar se é imagem para comprimir
      if (selectedFile.type.startsWith('image/')) {
        console.log('Comprimindo imagem...');
        const compressed = await compressImage(selectedFile);
        base64 = compressed.base64;
        mimeType = compressed.mimeType;
        format = 'jpeg';
        fileType = 'jpg';
      } else {
        // Para PDFs, usar sem compressão
        console.log('Processando PDF sem compressão...');
        base64 = await fileToBase64(selectedFile);
        const ext = (selectedFile?.name || '').split('.').pop()?.toLowerCase();
        format = ext === 'jpg' ? 'jpeg' : ext;
        mimeType = selectedFile.type;
        fileType = ext;
      }

      // Preparar dados para envio (formato mais simples)
      const payload = {
        source: 'sistema-de-fidelidade-web',
        timestamp: new Date().toISOString(),
        imagemBase64: base64,
        mimeType: mimeType,
        format: format,
        fileType: fileType,
        clienteId: user?.id
      };

      console.log('Enviando para n8n:', {
        url: 'https://n8n.unitycompany.com.br/webhook/sistema-de-fidelidade',
        payload: {
          ...payload,
          imagemBase64: payload.imagemBase64.substring(0, 50) + '...' // Log apenas os primeiros 50 caracteres do base64
        }
      });

      // Enviar para o webhook do n8n com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
      
      const response = await fetch('https://n8n.unitycompany.com.br/webhook/sistema-de-fidelidade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      let n8nResponse = {};
      
      if (!response.ok) {
        console.error(`Erro HTTP ${response.status} do n8n:`, response.statusText);
        
        // Tentar ler a resposta de erro
        try {
          const errorText = await response.text();
          console.error('Resposta de erro completa do n8n:', errorText);
          console.error('Headers da resposta:', response.headers);
        } catch (e) {
          console.error('Não foi possível ler a resposta de erro:', e);
        }
        
        // Usar valores padrão se o n8n falhar
        console.log('Webhook n8n retornou erro. Usando pontos padrão para continuar funcionamento.');
        n8nResponse = {
          pontos: 5, // pontos padrão em caso de erro
          orderNumber: `AUTO-${Date.now()}`,
          orderDate: new Date().toISOString(),
          totalValue: 0,
          source: 'fallback-error-500'
        };
      } else {
        try {
          n8nResponse = await response.json();
          console.log('Resposta válida do n8n:', n8nResponse);
        } catch (jsonError) {
          console.error('Erro ao fazer parse do JSON da resposta:', jsonError);
          const responseText = await response.text();
          console.error('Resposta não-JSON recebida:', responseText);
          
          // Fallback se não conseguir fazer parse do JSON
          n8nResponse = {
            pontos: 3,
            orderNumber: `PARSE-ERROR-${Date.now()}`,
            orderDate: new Date().toISOString(),
            totalValue: 0,
            source: 'fallback-json-error'
          };
        }
      }

      // Etapa 2: Creditar pontos retornados
      updateProcessingStep(2);
      
      // Processar resposta do n8n (pode ser array ou objeto)
      let pontosCalculados = 0;
      
      console.log('🔍 [PROCESSAMENTO N8N] Resposta recebida:', {
        tipo: Array.isArray(n8nResponse) ? 'array' : typeof n8nResponse,
        conteudo: n8nResponse
      });
      
      // Verificar erros específicos do n8n
      if (n8nResponse && typeof n8nResponse === 'object') {
        // Verificar erro de nota já usada
        if (n8nResponse.nota === "A nota fiscal enviada já foi usada.") {
          throw new Error('Esta nota fiscal já foi processada anteriormente.');
        }
        
        // Verificar erro de data limite (3 meses)
        if (n8nResponse.date === "A data da nota, excedeu o limite de 3 meses!") {
          throw new Error('A data desta nota fiscal excedeu o limite de 3 meses. Apenas notas fiscais emitidas nos últimos 3 meses são aceitas.');
        }
      }
      
      if (Array.isArray(n8nResponse) && n8nResponse.length > 0) {
        // Se é um array, pegar o primeiro elemento
        const resultado = n8nResponse[0];
        console.log('🔍 Processando resultado do array n8n:', resultado);
        
        // Verificar erros no resultado do array também
        if (resultado.nota === "A nota fiscal enviada já foi usada.") {
          throw new Error('Esta nota fiscal já foi processada anteriormente.');
        }
        
        if (resultado.date === "A data da nota, excedeu o limite de 3 meses!") {
          throw new Error('A data desta nota fiscal excedeu o limite de 3 meses. Apenas notas fiscais emitidas nos últimos 3 meses são aceitas.');
        }
        
        if (resultado.status === 'sucesso' && resultado.pontuacao_total) {
          pontosCalculados = Number(resultado.pontuacao_total);
          console.log(`✅ Pontos extraídos do n8n (array): ${pontosCalculados}`);
        } else {
          console.warn('⚠️ Resultado do n8n sem pontuacao_total válida:', resultado);
        }
      } else if (n8nResponse && typeof n8nResponse === 'object') {
        // Se é objeto direto, tentar diferentes propriedades
        pontosCalculados = Number(n8nResponse.pontuacao_total) || 
                          Number(n8nResponse.pontos) || 
                          Number(n8nResponse.points) || 0;
        console.log(`✅ Pontos extraídos do n8n (objeto): ${pontosCalculados}`);
      } else {
        console.warn('⚠️ Resposta do n8n não é array nem objeto válido:', n8nResponse);
      }
      
      const pontos = pontosCalculados;
      
      console.log(`🎯 [DEBUG] Pontos finais para creditar: ${pontos} | Tipo: ${typeof pontos}`);
      
      if (!user?.id) throw new Error('Usuário não identificado');
      
      // Validar se os pontos são válidos antes de creditar
      if (pontos <= 0) {
        console.warn(`⚠️ Pontos inválidos (${pontos}). Não creditando, mas salvando nota.`);
      } else {
        const updatedCustomer = await addPointsToCustomer(user.id, pontos, 'Crédito via n8n (upload)');
        notifyPointsEarned(pontos);

        // Atualizações de contexto
        if (window.updateUserContext) {
          await window.updateUserContext({
            saldo_pontos: updatedCustomer.saldo_pontos,
            total_pontos_ganhos: updatedCustomer.total_pontos_ganhos
          });
        }
        if (onUserUpdate) {
          onUserUpdate({
            ...user,
            saldo_pontos: updatedCustomer.saldo_pontos,
            total_pontos_ganhos: updatedCustomer.total_pontos_ganhos
          });
        }
        if (window.triggerGlobalRefresh) window.triggerGlobalRefresh();
        window.dispatchEvent(new CustomEvent('userUpdated'));
      }

      // Etapa 3: Salvar dados da nota fiscal na coleção
      updateProcessingStep(3);
      
      let dadosNotaParaSalvar = null;
      
      if (Array.isArray(n8nResponse) && n8nResponse.length > 0) {
        dadosNotaParaSalvar = n8nResponse[0];
      } else if (n8nResponse && typeof n8nResponse === 'object') {
        dadosNotaParaSalvar = n8nResponse;
      }
      
      if (dadosNotaParaSalvar && dadosNotaParaSalvar.nota) {
        console.log('💾 [SALVAMENTO] Salvando dados da nota fiscal:', dadosNotaParaSalvar);
        
        // Salvar a nota fiscal (n8n já validou duplicatas)
        const resultadoSalvamento = await imagemNotaFiscalService.salvarNotaFiscalDados(
          null, // pedidoId - será null para este caso
            user.id,
            dadosNotaParaSalvar,
            'upload_imagem'
          );
          
        if (resultadoSalvamento.success) {
          console.log('✅ [SALVAMENTO] Nota fiscal salva com sucesso');
        } else {
          console.error('❌ [SALVAMENTO] Erro ao salvar nota fiscal:', resultadoSalvamento.error);
          // Não parar o processo por erro de salvamento, apenas avisar
        }
      } else {
        console.warn('⚠️ [SALVAMENTO] Dados da nota fiscal não encontrados na resposta do n8n');
      }

      // Exibir resultado
      let resultadoFinal;
      
      if (Array.isArray(n8nResponse) && n8nResponse.length > 0) {
        const dadosN8n = n8nResponse[0];
        resultadoFinal = {
          orderNumber: dadosN8n.nota || '—',
          orderDate: dadosN8n.data_emissao || dadosN8n.data || new Date().toISOString(),
          totalValue: 0, // n8n não retorna valor total, apenas pontos
          totalPoints: pontos,
          items: [],
          allProducts: [],
          status: dadosN8n.status || 'processado'
        };
      } else {
        resultadoFinal = {
          orderNumber: n8nResponse.orderNumber || '—',
          orderDate: n8nResponse.orderDate || null,
          totalValue: n8nResponse.totalValue || 0,
          totalPoints: pontos,
          items: n8nResponse.items || [],
          allProducts: n8nResponse.allProducts || [],
          status: 'processado'
        };
      }
      
      setResult(resultadoFinal);
      setShowResult(true);
      setTimeout(() => setShowAnimatedRows(true), 300);

    } catch (err) {
      console.error('[Upload] Erro no processamento via n8n:', err);
      
      // Verificar se é erro de timeout
      if (err?.name === 'AbortError') {
        console.error('Timeout ao conectar com o webhook n8n');
        setError('Timeout na conexão com o servidor. Tente novamente.');
      } else if (err?.message && err.message.includes('Failed to fetch')) {
        console.error('Erro de rede ao conectar com n8n');
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (err?.type === 'error') {
        console.error('Erro ao carregar/processar imagem');
        setError('Erro ao processar a imagem. Tente com outro arquivo.');
      } else {
        setError(err?.message || 'Falha ao processar a nota.');
      }
      
      setResult({ 
        error: true, 
        errorMessage: err?.message || 'Falha ao processar a nota.', 
        totalPoints: 0, 
        items: [], 
        allProducts: [] 
      });
      setShowResult(true);
      setTimeout(() => setShowAnimatedRows(true), 300);
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para comprimir imagem (método mais robusto)
  const compressImage = async (file, maxW = 1800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const scale = Math.min(1, maxW / img.width);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // JPEG reduz bem; PNG geralmente fica grande
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const base64 = dataUrl.split(',')[1]; // sem prefixo
            
            const sizeKB = Math.round(base64.length / 1024);
            console.log(`Imagem comprimida: ${img.width}x${img.height} → ${canvas.width}x${canvas.height}, ${sizeKB}KB`);
            
            resolve({ base64, mimeType: 'image/jpeg', fileName: 'nota.jpg' });
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = (error) => {
          console.error('Erro ao carregar imagem para compressão:', error);
          reject(new Error('Falha ao carregar imagem para compressão'));
        };
        img.src = e.target.result; // Usa data URL ao invés de blob URL
      };
      reader.onerror = (error) => {
        console.error('Erro ao ler arquivo:', error);
        reject(new Error('Falha ao ler arquivo'));
      };
      reader.readAsDataURL(file);
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remover prefixo "data:*/*;base64," para economizar espaço
        const base64String = reader.result.split(',')[1];
        
        // Log do tamanho para debugging
        const sizeKB = Math.round(base64String.length / 1024);
        console.log(`Arquivo convertido para base64: ${sizeKB}KB`);
        
        // Se for muito grande, vamos limitar
        if (sizeKB > 5000) { // 5MB em base64
          console.warn('Arquivo muito grande em base64, pode causar erro 500');
        }
        
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Estado para controle da entrada direta do número da nota
  const [inputMode, setInputMode] = useState('foto'); // 'foto' ou 'numero'
  
  // Lidar com o resultado da nota processada pelo número
  const handleNotaProcessada = useCallback((dadosNota) => {
    console.log('✅ Nota processada via número:', dadosNota);
    
    // Exibir informações da nota no formato adequado para o componente
    setResult({
      orderNumber: dadosNota.numero || dadosNota.orderNumber || '—',
      issueDate: dadosNota.dataEmissao || null,
      customer: dadosNota.cliente?.nome || 'Cliente',
      totalValue: parseFloat(dadosNota.valorTotal) || 0,
      totalPoints: dadosNota.pontos || 0,
      items: dadosNota.produtos?.map(p => ({
        code: p.codigo,
        name: p.descricao,
        unitValue: p.valor,
        points: p.pontos
      })) || [],
      sapData: false, // Dados vieram do n8n webhook, não do SAP
      source: 'input-numero'
    });
    
    setShowResult(true);
    setTimeout(() => {
      setShowAnimatedRows(true);
    }, 300);
    
  }, []);

  return (
    <Container>
      <MainContent>
        <MinimalContainer>
          {!isProcessing && !showResult && (
            <>
              <MinimalHeader>
                <h1>Enviar Nota Fiscal</h1>
                <p>Faça upload ou digite a sua nota fiscal para processar seus pontos.</p>
              </MinimalHeader>
              
              {/* Botões de alternância entre método de upload e input manual */}
              <InputModeSelector>
                <ModeButton 
                  active={inputMode === 'foto'} 
                  onClick={() => setInputMode('foto')}
                >
                  <FiUpload /> Tirar foto
                </ModeButton>
                <ModeButton 
                  active={inputMode === 'numero'} 
                  onClick={() => setInputMode('numero')}
                >
                  <FiFileText /> Digitar número
                </ModeButton>
              </InputModeSelector>
              
              {/* Exibir componente baseado no modo selecionado */}
              {inputMode === 'foto' ? (
                <div>
                  <MinimalUpload htmlFor="file-upload">
                    <input id="file-upload" type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={handleFileInput} />
                    
                    {/* Adicionando previsualização de onde encontrar o número */}
                    <NFELocationPreview>
                      <p>Tire uma foto clara do número da nota fiscal, igual ao exemplo:</p>
                      <img src="/nota-fiscal-exemplo.png" alt="Exemplo de nota fiscal" />
                      <span>Posicione a câmera para capturar o código ou número claramente</span>
                    </NFELocationPreview>
                  
                    <FiFile size={38} color={selectedFile ? '#28a745' : '#A91918'} style={{ marginBottom: 8 }} />
                    <div style={{ color: '#444', fontWeight: 500, marginBottom: 4 }}>
                      {selectedFile ? selectedFile.name : 'Arraste ou clique para selecionar'}
                    </div>
                    <div style={{ color: '#888', fontSize: 13 }}>
                      {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'JPG, PNG ou PDF, até 10MB'}
                    </div>
                  </MinimalUpload>
                  
                  <MinimalButton disabled={!selectedFile} onClick={handleProcess}>
                    Processar Nota
                  </MinimalButton>
                  
                  {error && <div style={{ color: '#A91918', marginTop: 10, fontSize: 15, textAlign: 'center', width: '100%', maxWidth: 420 }}>{error}</div>}
                </div>
              ) : (
                <NotaFiscalInput 
                  onNotaProcessada={handleNotaProcessada} 
                  clienteId={user?.id} 
                />
              )}
            </>
          )}

          {isProcessing && (
            <ProcessingContainer>
              <CurrentStep>
                {currentStep > 0 && (
                  <div>
                    <StepSpinnerLarge />
                    <StepText key={stepTextKey}>
                      {processingSteps.find(step => step.id === currentStep)?.text || 'Processando...'}
                    </StepText>
                  </div>
                )}
              </CurrentStep>
            </ProcessingContainer>
          )}

          {showResult && result && (
            <>
              <MinimalResult>
                <h2 className={result.error ? 'error' : 'success'} style={{ justifyContent: 'center', fontSize: 20, marginBottom: 24 }}>
                  {result.error ? <FiX /> : <FiCheck />} {result.error ? 'Erro no processamento' : 'Nota processada com sucesso!'}
                </h2>
                <div className="summary" style={{ margin: 0 }}>
                  <ExcelTable>
                    <tbody>
                      {showAnimatedRows && (
                        <AnimatedTableRow $delay={0.1}>
                          <ExcelTh>NF-e</ExcelTh>
                          <ExcelTd>{result.orderNumber}</ExcelTd>
                        </AnimatedTableRow>
                      )}
                      {showAnimatedRows && (
                        <AnimatedTableRow $delay={0.3}>
                          <ExcelTh>Data de Expedição</ExcelTh>
                          <ExcelTd>{result.orderDate ? new Date(result.orderDate).toLocaleDateString('pt-BR') : '-'}</ExcelTd>
                        </AnimatedTableRow>
                      )}
                      {showAnimatedRows && (
                        <AnimatedTableRow $delay={0.5}>
                          <ExcelTh>Total de Pontos</ExcelTh>
                          <ExcelTd><strong>+{result.totalPoints} pontos</strong></ExcelTd>
                        </AnimatedTableRow>
                      )}
                    </tbody>
                  </ExcelTable>

                  {showAnimatedRows && (
                    <div style={{
                      color: '#666',
                      fontSize: 14,
                      marginTop: 16,
                      textAlign: 'center'
                    }} className="fade-in-text">
                      {result.totalPoints > 0 ?
                        `${result.totalPoints} pontos foram creditados na sua conta` :
                        'Nenhum ponto foi creditado para esta nota'
                      }
                    </div>
                  )}

                  {/* Exibir código de retirada se existir */}
                  {result.codigo_resgate && showAnimatedRows && (
                    <div className="fade-in-codigo">
                      <CodigoAviso><FiInfo style={{ fontSize: 18, color: '#A91918' }} /> Apresente este código para retirar seu produto em uma loja credenciada:</CodigoAviso>
                      <CodigoBox>{result.codigo_resgate}</CodigoBox>
                    </div>
                  )}

                  {/* Exemplo de status visual, se necessário */}
                  {result.status && showAnimatedRows && (
                    <div className="fade-in-status" style={{ marginTop: 8 }}>
                      <StatusBadge status={result.status}>{result.status}</StatusBadge>
                    </div>
                  )}
                </div>
              </MinimalResult>
              <SecondaryButton onClick={resetForm} className="fade-in-button">
                Processar outra nota
              </SecondaryButton>
            </>
          )}

          <style>{`
            @keyframes spin { 
              0%{transform:rotate(0deg);} 
              100%{transform:rotate(360deg);} 
            }
            @keyframes fadeInRow {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .fade-in-text {
              animation: fadeInRow 0.6s ease-out;
              animation-delay: 1.8s;
              animation-fill-mode: both;
            }
            .fade-in-codigo {
              animation: fadeInRow 0.6s ease-out;
              animation-delay: 2.0s;
              animation-fill-mode: both;
            }
            .fade-in-status {
              animation: fadeInRow 0.6s ease-out;
              animation-delay: 2.2s;
              animation-fill-mode: both;
            }
            .fade-in-button {
              animation: fadeInRow 0.6s ease-out;
              animation-delay: 2.4s;
              animation-fill-mode: both;
            }
          `}</style>
        </MinimalContainer>
      </MainContent>
    </Container>
  );
}

export default UploadPedidoNovo;
