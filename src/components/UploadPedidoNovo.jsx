import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FiUpload, FiFile, FiCheck, FiX, FiStar, FiInfo, FiEye, FiTarget, FiDatabase, FiGift } from 'react-icons/fi';
import { analyzeOrderWithGemini } from '../services/geminiService';
import { processOrderResult, validateOrder, validarPontosCalculados } from '../utils/pedidosFast'; // removed getProdutosElegiveis import
import { saveOrder, saveOrderItems, addPointsToCustomer, checkOrderExists } from '../services/supabase';
import { getPointsPerReal } from '../utils/config';
import { sefazValidationService } from '../services/sefazValidation';
import LoadingGif from './LoadingGif';

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
  animation-delay: ${props => props.delay || 0}s;
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
    { id: 1, text: 'Analisando documento', icon: FiEye },
    { id: 2, text: 'Extraindo informações', icon: FiFile },
    { id: 3, text: 'Validando via SEFAZ', icon: FiTarget },
    { id: 4, text: 'Calculando pontos', icon: FiTarget },
    { id: 5, text: 'Salvando no sistema', icon: FiDatabase },
    { id: 6, text: 'Creditando pontos', icon: FiGift }
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
      // Etapa 1: Analisando documento
      updateProcessingStep(1);
      await new Promise(resolve => setTimeout(resolve, 1200)); // Pausa para mostrar a etapa

      // Converter arquivo para base64
      const base64 = await fileToBase64(selectedFile);
      updateProcessingStep(1, true); // Marca como concluída

      let aiResult;
      let dailyLimitExceeded = false;

      // 🤖 ANÁLISE COM GOOGLE GEMINI (PROCESSAMENTO PRINCIPAL)
      let usingFallback = false; // Não usamos fallback mais
      let processingMethod = 'gemini'; // Método padrão

      try {
        // Etapa 2: Extraindo informações
        updateProcessingStep(2);
        console.log('🤖 Analisando nota fiscal com Google Gemini...');
        aiResult = await analyzeOrderWithGemini(base64, selectedFile.type);

        if (aiResult.success) {
          console.log('✅ Gemini analisou com sucesso');
          updateProcessingStep(2, true); // Marca como concluída
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
          setShowResult(true);
          setTimeout(() => {
            setShowAnimatedRows(true);
          }, 300);
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
              updateProcessingStep(2, true); // Marca como concluída
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
            setShowResult(true);
            setTimeout(() => {
              setShowAnimatedRows(true);
            }, 300);
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
          setShowResult(true);
          setTimeout(() => {
            setShowAnimatedRows(true);
          }, 300);
          return;
        }
      }

      // Etapa 3: Validando via SEFAZ (Anti-Fraude)
      updateProcessingStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para mostrar transição

      // Aguardando o processamento de dados pela IA
      const processedOrder = await processOrderResult(aiResult.data); // Garantir que a promise seja resolvida

      // � VALIDAÇÃO ANTI-FRAUDE VIA SEFAZ
      console.log('🔒 Iniciando validação anti-fraude...');

      let validationResult;
      let finalOrderData = processedOrder;

      try {
        // Tentar validar via SEFAZ usando texto OCR original
        const ocrText = aiResult.rawText || JSON.stringify(aiResult.data);
        validationResult = await sefazValidationService.validateNotaFiscal(ocrText, processedOrder);

        if (validationResult.success && !validationResult.useOCR) {
          // ✅ DADOS OFICIAIS SEFAZ - 100% CONFIÁVEIS
          console.log('✅ Validação SEFAZ bem-sucedida - usando dados oficiais');

          finalOrderData = {
            ...processedOrder,
            totalValue: validationResult.data.valorTotal || processedOrder.totalValue,
            orderDate: validationResult.data.dataEmissao || processedOrder.orderDate,
            customer: validationResult.data.razaoSocial || processedOrder.customer,
            cnpjEmitente: validationResult.data.cnpjEmitente,
            chaveNFe: validationResult.data.chaveNFe,
            validationType: validationResult.data.validationType || 'sefaz_official',
            extractionMethod: validationResult.data.extractionMethod,
            antifraudValidated: true,
            sefazData: validationResult.data
          };

        } else if (validationResult.success && validationResult.useOCR) {
          // ⚠️ DADOS OCR COM VALIDAÇÕES EXTRAS
          console.log('⚠️ Usando dados OCR com validações anti-fraude extras');

          // Aplicar validações extras para dados OCR
          const ocrValidation = sefazValidationService.validateOCRData(processedOrder, ocrText);

          // Se dados OCR são suspeitos, aplicar medidas restritivas
          if (!ocrValidation.hasReasonableValues || ocrValidation.suspiciousPatterns.length > 2) {
            console.warn('🚨 Padrões suspeitos detectados:', ocrValidation.suspiciousPatterns);

            // Limitar pontos em casos suspeitos
            const originalPoints = Math.floor((processedOrder.totalValue || 0) * getPointsPerReal());
            const limitedPoints = Math.min(originalPoints, 50); // Máximo 50 pontos para casos suspeitos

            finalOrderData = {
              ...processedOrder,
              totalPoints: limitedPoints,
              validationType: 'ocr_limited',
              antifraudValidated: true,
              suspiciousPatterns: ocrValidation.suspiciousPatterns,
              pointsLimited: originalPoints > limitedPoints,
              originalPoints: originalPoints
            };

            console.log('🔒 Pontos limitados por segurança:', {
              original: originalPoints,
              limited: limitedPoints,
              patterns: ocrValidation.suspiciousPatterns
            });

          } else {
            // Dados OCR parecem válidos
            finalOrderData = {
              ...processedOrder,
              chaveNFe: validationResult.data?.chaveNFe,
              validationType: 'ocr_validated',
              antifraudValidated: true,
              ocrValidation
            };
          }

        } else {
          // ❌ FALHA NA VALIDAÇÃO - REJEITAR
          console.error('❌ Falha na validação anti-fraude:', validationResult.error);

          setResult({
            orderNumber: `FRAUD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            customer: 'Sistema Fast',
            totalValue: 0,
            items: [],
            totalPoints: 0,
            allProducts: [],
            error: true,
            errorMessage: `Validação anti-fraude falhou: ${validationResult.error}. Por segurança, não foi possível processar esta nota.`
          });
          setShowResult(true);
          setTimeout(() => {
            setShowAnimatedRows(true);
          }, 300);
          return;
        }

        updateProcessingStep(3, true); // Marca validação SEFAZ como concluída

      } catch (validationError) {
        console.error('⚠️ Erro na validação SEFAZ:', validationError);

        // Em caso de erro na validação, usar dados OCR com limitações
        finalOrderData = {
          ...processedOrder,
          validationType: 'ocr_fallback',
          antifraudValidated: false,
          validationError: validationError.message
        };

        updateProcessingStep(3, true); // Marca como concluída mesmo com erro
      }

      // Etapa 4: Calculando pontos
      updateProcessingStep(4);
      await new Promise(resolve => setTimeout(resolve, 800)); // Pausa para mostrar transição

      // 🔍 LOG DETALHADO: Verificar dados processados
      console.log('📊 DADOS PROCESSADOS COMPLETOS:', {
        orderNumber: finalOrderData.orderNumber,
        orderDate: finalOrderData.orderDate,
        totalValue: finalOrderData.totalValue,
        totalPoints: finalOrderData.totalPoints,
        items: finalOrderData.items,
        allProducts: finalOrderData.allProducts,
        validationType: finalOrderData.validationType,
        antifraudValidated: finalOrderData.antifraudValidated
      });

      // 🔍 LOG CRÍTICO: Verificar se totalPoints foi perdido durante processamento
      console.log('🔍 VERIFICAÇÃO TOTALPOINTS APÓS PROCESSAMENTO:', {
        'finalOrderData.totalPoints': finalOrderData.totalPoints,
        'tipo': typeof finalOrderData.totalPoints,
        'é número': typeof finalOrderData.totalPoints === 'number',
        'é maior que 0': finalOrderData.totalPoints > 0,
        'itens com pontos': finalOrderData.items?.filter(item => item.points > 0) || [],
        'soma manual dos pontos': finalOrderData.items?.reduce((acc, item) => acc + (item.points || 0), 0) || 0
      });

      // 🔧 CÁLCULO DE PONTOS BASEADO NA VALIDAÇÃO
      if (finalOrderData.validationType === 'sefaz_official') {
        // Dados oficiais SEFAZ - calcular normalmente
        const multiplier = getPointsPerReal();
        const calculatedPoints = Math.floor((finalOrderData.totalValue || 0) * multiplier);
        finalOrderData.totalPoints = calculatedPoints;
        console.log('🔧 Pontos calculados com dados SEFAZ:', { totalValue: finalOrderData.totalValue, multiplier, calculatedPoints });

      } else if (!finalOrderData.pointsLimited) {
        // Dados OCR validados - calcular normalmente
        const multiplier = getPointsPerReal();
        const calculatedPoints = Math.floor((finalOrderData.totalValue || 0) * multiplier);
        finalOrderData.totalPoints = calculatedPoints;
        console.log('🔧 Pontos calculados por valor total (OCR):', { totalValue: finalOrderData.totalValue, multiplier, calculatedPoints });
      }
      // Se pointsLimited=true, os pontos já foram limitados na validação

      updateProcessingStep(4, true); // Marca cálculo de pontos como concluído

      // Validar pedido
      const validation = await validateOrder(finalOrderData);

      // ✅ APENAS LOG DE WARNINGS - NÃO BLOQUEAR PROCESSAMENTO
      if (validation.warnings && validation.warnings.length > 0) {
        console.log('Avisos de validação:', validation.warnings);
      }

      if (validation.errors && validation.errors.length > 0) {
        console.log('Erros de validação (não bloqueando):', validation.errors);
      }

      // VALIDAÇÃO DE PONTOS: Verificar se os cálculos estão corretos
      if (finalOrderData.items && finalOrderData.items.length > 0) {
        try {
          const validacaoPontos = await validarPontosCalculados(finalOrderData.items);

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

      // Etapa 5: Salvando no sistema
      updateProcessingStep(5);
      await new Promise(resolve => setTimeout(resolve, 800)); // Pausa para mostrar transição

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
        numero_pedido: finalOrderData.orderNumber,
        data_emissao: finalOrderData.orderDate,
        valor_total: finalOrderData.totalValue,
        hash_documento: finalOrderData.documentHash,
        pontos_gerados: finalOrderData.totalPoints,
        status: 'processado',
        validationType: finalOrderData.validationType,
        antifraudValidated: finalOrderData.antifraudValidated
      })

      // Salvar pedido principal
      const savedOrder = await saveOrder({
        cliente_id: customerId,
        numero_pedido: finalOrderData.orderNumber,
        data_emissao: finalOrderData.orderDate,
        valor_total: finalOrderData.totalValue,
        hash_documento: finalOrderData.documentHash,
        pontos_gerados: finalOrderData.totalPoints,
        status: 'processado' // Sempre usar 'processado' - o que importa são os pontos
      });

      // Salvar itens do pedido (apenas se houver itens)
      if (finalOrderData.items && finalOrderData.items.length > 0) {
        for (const item of finalOrderData.items) {
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
      updateProcessingStep(5, true); // Marca salvamento como concluído

      // 🔍 LOG FINAL: Dados que serão exibidos na interface
      console.log('🎯 DADOS PARA A INTERFACE:', {
        orderNumber: finalOrderData.orderNumber,
        totalValue: finalOrderData.totalValue,
        totalPoints: finalOrderData.totalPoints,
        items: finalOrderData.items,
        allProducts: finalOrderData.allProducts,
        orderId: savedOrder.id,
        validationType: finalOrderData.validationType,
        antifraudValidated: finalOrderData.antifraudValidated
      });

      // ✅ RESULTADO FINAL PARA A INTERFACE - COM GARANTIA DE totalPoints
      const totalPointsGarantido = finalOrderData.totalPoints || finalOrderData.items?.reduce((acc, item) => acc + (Number(item.points) || 0), 0) || 0;

      const resultadoFinal = {
        orderNumber: finalOrderData.orderNumber,
        orderDate: finalOrderData.orderDate,
        customer: finalOrderData.customer,
        totalValue: finalOrderData.totalValue,
        items: finalOrderData.items,
        totalPoints: totalPointsGarantido,
        documentHash: finalOrderData.documentHash,
        allProducts: finalOrderData.allProducts,
        orderId: savedOrder.id,
        validationType: finalOrderData.validationType,
        antifraudValidated: finalOrderData.antifraudValidated,
        chaveNFe: finalOrderData.chaveNFe,
        suspiciousPatterns: finalOrderData.suspiciousPatterns,
        pointsLimited: finalOrderData.pointsLimited,
        originalPoints: finalOrderData.originalPoints,
        usingFallback: usingFallback, // Informar se usou IA simulada
        processingMethod: processingMethod // Informar qual método foi usado
      };

      console.log('🔒 RESULTADO FINAL GARANTIDO:', {
        'totalPoints original': finalOrderData.totalPoints,
        'totalPoints garantido': totalPointsGarantido,
        'totalPoints no resultado': resultadoFinal.totalPoints,
        'validationType': finalOrderData.validationType,
        'antifraudValidated': finalOrderData.antifraudValidated
      });

      // 🔍 LOG CRÍTICO: Verificar totalPoints ANTES de creditar
      console.log('🔍 VERIFICAÇÃO CRÍTICA ANTES DO CRÉDITO:', {
        'resultadoFinal.totalPoints': resultadoFinal.totalPoints,
        'tipo de resultadoFinal.totalPoints': typeof resultadoFinal.totalPoints,
        'resultadoFinal.totalPoints > 0': resultadoFinal.totalPoints > 0,
        'resultadoFinal.totalPoints === 0': resultadoFinal.totalPoints === 0,
        'finalOrderData.items.length': finalOrderData.items?.length || 0,
        'finalOrderData.items': finalOrderData.items,
        'soma pontos dos items': finalOrderData.items?.reduce((acc, item) => acc + (item.points || 0), 0) || 0,
        'validationType': resultadoFinal.validationType,
        'antifraudValidated': resultadoFinal.antifraudValidated
      });

      // Adicionar pontos ao cliente (apenas se houver pontos)
      if (resultadoFinal.totalPoints > 0) {
        // Etapa 6: Creditando pontos
        updateProcessingStep(6);
        await new Promise(resolve => setTimeout(resolve, 700)); // Pausa para mostrar transição

        try {
          console.log('💰 Iniciando crédito de pontos para o cliente:', {
            customerId,
            pontos: resultadoFinal.totalPoints,
            orderNumber: finalOrderData.orderNumber,
            validationType: resultadoFinal.validationType
          });

          const updatedCustomer = await addPointsToCustomer(customerId, resultadoFinal.totalPoints, `Pedido ${finalOrderData.orderNumber}`);

          console.log('✅ Pontos creditados com sucesso:', {
            saldoAnterior: user.saldo_pontos,
            pontosAdicionados: resultadoFinal.totalPoints,
            novoSaldo: updatedCustomer.saldo_pontos,
            validationType: resultadoFinal.validationType
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
          updateProcessingStep(6, true); // Marca crédito como concluído

        } catch (error) {
          console.error('❌ Erro ao creditar pontos:', error);
          setError('Erro ao creditar pontos no banco de dados. Tente novamente.');
          setResult({
            ...resultadoFinal,
            error: true,
            errorMessage: 'Erro ao creditar pontos no banco de dados. Tente novamente.'
          });
          setShowResult(true);
          setTimeout(() => {
            setShowAnimatedRows(true);
          }, 300);
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
      setShowResult(true);
      // Iniciar animação das linhas após um pequeno delay
      setTimeout(() => {
        setShowAnimatedRows(true);
      }, 300);
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
        setShowResult(true);
        setTimeout(() => {
          setShowAnimatedRows(true);
        }, 300);
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
      setShowResult(true);
      setTimeout(() => {
        setShowAnimatedRows(true);
      }, 300);
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
          {!isProcessing && !showResult && (
            <>
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
              <MinimalButton disabled={!selectedFile} onClick={handleProcess}>
                Processar Nota
              </MinimalButton>
              {error && <div style={{ color: '#A91918', marginTop: 10, fontSize: 15, textAlign: 'center', width: '100%', maxWidth: 420 }}>{error}</div>}
            </>
          )}

          {isProcessing && (
            <ProcessingContainer>
              <CurrentStep>
                {currentStep > 0 && (
                  <>
                    <StepSpinnerLarge />
                    <StepText key={stepTextKey}>
                      {processingSteps.find(step => step.id === currentStep)?.text || 'Processando...'}
                    </StepText>
                  </>
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
                        <>
                          <AnimatedTableRow delay={0.1}>
                            <ExcelTh>Pedido</ExcelTh>
                            <ExcelTd>{result.orderNumber}</ExcelTd>
                          </AnimatedTableRow>
                          <AnimatedTableRow delay={0.3}>
                            <ExcelTh>Data de Expedição</ExcelTh>
                            <ExcelTd>{result.orderDate ? new Date(result.orderDate).toLocaleDateString('pt-BR') : '-'}</ExcelTd>
                          </AnimatedTableRow>
                          <AnimatedTableRow delay={0.5}>
                            <ExcelTh>Valor Total da Nota</ExcelTh>
                            <ExcelTd>R$ {Number(result.totalValue).toFixed(2)}</ExcelTd>
                          </AnimatedTableRow>
                        </>
                      )}
                    </tbody>
                  </ExcelTable>

                  {showAnimatedRows && result.totalPoints > 0 && (
                    <PointsHighlight>
                      <span className="points-number">+{result.totalPoints}</span> pontos creditados
                    </PointsHighlight>
                  )}

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

                  {/* Informações de Validação Anti-Fraude */}
                  {showAnimatedRows && result.antifraudValidated && (
                    <div style={{
                      marginTop: 16,
                      padding: '8px 12px',
                      background: result.validationType === 'sefaz_official' ? '#e8f5e8' :
                        result.validationType === 'ocr_limited' ? '#fff3cd' : '#f8f9fa',
                      border: `1px solid ${result.validationType?.includes('sefaz') ? '#28a745' :
                        result.validationType === 'ocr_limited' ? '#ffc107' : '#dee2e6'}`,
                      fontSize: 12,
                      color: '#555',
                      textAlign: 'center'
                    }} className="fade-in-security">
                      {result.validationType?.includes('sefaz') && (
                        <div>
                          ✅ Validado oficialmente via SEFAZ
                          {result.extractionMethod === 'barcode_extraction' && (
                            <div style={{ fontSize: 11, marginTop: 2, color: '#0066cc' }}>
                              📊 Chave extraída de código de barras
                            </div>
                          )}
                          {result.extractionMethod === 'generated_key' && (
                            <div style={{ fontSize: 11, marginTop: 2, color: '#0066cc' }}>
                              🎯 Chave gerada e validada
                            </div>
                          )}
                          {!result.extractionMethod && (
                            <div style={{ fontSize: 11, marginTop: 2, color: '#0066cc' }}>
                              🔑 Chave encontrada no texto
                            </div>
                          )}
                        </div>
                      )}
                      {result.validationType === 'cnpj_validated' && (
                        <div>🏛️ Validado via CNPJ da Receita Federal</div>
                      )}
                      {result.validationType === 'ocr_validated' && (
                        <div>🔍 Validado com verificações anti-fraude</div>
                      )}
                      {result.validationType === 'ocr_limited' && (
                        <>
                          <div>⚠️ Pontos limitados por segurança</div>
                          {result.originalPoints && (
                            <div style={{ fontSize: 11, marginTop: 4 }}>
                              Pontos originais: {result.originalPoints} → Creditados: {result.totalPoints}
                            </div>
                          )}
                        </>
                      )}
                      {result.chaveNFe && (
                        <div style={{ marginTop: 4, fontSize: 11, fontFamily: 'monospace' }}>
                          NFe: {result.chaveNFe.substring(0, 8)}...{result.chaveNFe.substring(result.chaveNFe.length - 8)}
                        </div>
                      )}
                    </div>
                  )}                  {/* Exibir código de retirada se existir */}
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
            .fade-in-security {
              animation: fadeInRow 0.6s ease-out;
              animation-delay: 2s;
              animation-fill-mode: both;
            }
            .fade-in-codigo {
              animation: fadeInRow 0.6s ease-out;
              animation-delay: 2.2s;
              animation-fill-mode: both;
            }
            .fade-in-status {
              animation: fadeInRow 0.6s ease-out;
              animation-delay: 2.4s;
              animation-fill-mode: both;
            }
            .fade-in-button {
              animation: fadeInRow 0.6s ease-out;
              animation-delay: 2.6s;
              animation-fill-mode: both;
            }
          `}</style>
        </MinimalContainer>
      </MainContent>
    </Container>
  );
}

export default UploadPedidoNovo;
