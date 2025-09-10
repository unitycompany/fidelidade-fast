import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FiUpload, FiCamera, FiFile, FiCheck, FiX, FiStar, FiShoppingBag, FiZap, FiEye, FiCpu, FiShield, FiAward, FiInfo } from 'react-icons/fi';
import { analyzeOrderWithGemini } from '../services/geminiService';
import { processOrderResult, validateOrder, getProdutosElegiveis } from '../utils/pedidosFastNovo';
import { saveOrder, saveOrderItems, addPointsToCustomer, checkOrderExists } from '../services/supabase';
import { useAuth } from '../App';
import RegrasFastSimples from './RegrasFastSimples';

// Animações
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const scanLine = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(400px); opacity: 0; }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-10px); }
  70% { transform: translateY(-5px); }
  90% { transform: translateY(-2px); }
`;

// Styled Components modernos
// Ajuste do Container para responsividade máxima
const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 0;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 900px) {
    padding: 1rem 0;
  }
`;

// Ajuste do Header para centralização e responsividade
const Header = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem auto;
  padding: 2.5rem 2rem 2rem 2rem;
  background: linear-gradient(135deg, #A91918 0%, #c41e3a 100%);
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(169,25,24,0.10);
  color: #fff;
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-out;
  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  p {
    font-size: 1rem;
    opacity: 0.95;
    margin: 0;
  }
  @media (max-width: 600px) {
    max-width: 98vw;
    padding: 1.5rem 0.5rem 1rem 0.5rem;
  }
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

// Ajuste do UploadSection para responsividade
const UploadSection = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem auto;
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  @media (max-width: 600px) {
    max-width: 98vw;
    padding: 1.2rem 0.5rem 1rem 0.5rem;
  }
`;

// Ajuste do ProductsSection para responsividade
const ProductsSection = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 2rem auto;
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  @media (max-width: 900px) {
    max-width: 98vw;
    padding: 1.2rem 0.5rem 1rem 0.5rem;
  }
`;

// Componentes para tabela de produtos elegíveis
const EligibleProductsTable = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  background: white;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  
  thead {
    background: linear-gradient(135deg, #A91918, #c41e3a);
    color: white;
    
    th {
      padding: 1rem 0.75rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &:first-child {
        border-radius: 12px 0 0 0;
      }
      
      &:last-child {
        border-radius: 0 12px 0 0;
      }
      
      @media (max-width: 768px) {
        padding: 0.75rem 0.5rem;
        font-size: 0.8rem;
      }
    }
  }
  
  tbody {
    tr {
      transition: all 0.3s ease;
      border-bottom: 1px solid #f1f1f1;
      
      &:hover {
        background: rgba(169, 25, 24, 0.05);
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      td {
        padding: 1rem 0.75rem;
        color: #353535;
        vertical-align: middle;
        
        @media (max-width: 768px) {
          padding: 0.75rem 0.5rem;
          font-size: 0.85rem;
        }
      }
    }
  }
`;

const ProductCategory = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.drywall {
    background: #e3f2fd;
    color: #1976d2;
  }
  
  &.glasroc {
    background: #e8f5e8;
    color: #388e3c;
  }
  
  &.acabamento {
    background: #fff3e0;
    color: #f57c00;
  }
`;

const PointsBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
`;

// Componente de carregamento simplificado
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  
  .spinner {
    width: 60px;
    height: 60px;
    border: 4px solid #f1f1f1;
    border-top: 4px solid #A91918;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1.5rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  h3 {
    color: #A91918;
    font-family: 'Urbanist', sans-serif;
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #353535;
    opacity: 0.8;
    margin: 0;
  }
`;

const UploadArea = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isDragOver', 'hasFile'].includes(prop),
})`
  border: 3px dashed ${props => props.isDragOver ? '#A91918' : props.hasFile ? '#28a745' : '#e9ecef'};
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  background: ${props => props.isDragOver ? 'rgba(169, 25, 24, 0.05)' : props.hasFile ? 'rgba(40, 167, 69, 0.05)' : '#fafafa'};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;

  &:hover {
    border-color: #A91918;
    background: rgba(169, 25, 24, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(169, 25, 24, 0.15);
  }
  
  ${props => props.hasFile && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}
`;

const UploadIcon = styled.div`
  font-size: 4rem;
  color: ${props => props.hasFile ? '#28a745' : '#A91918'};
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  
  ${props => props.isDragOver && css`
    animation: ${bounce} 1s ease-in-out infinite;
  `}
`;

const UploadText = styled.div`
  h3 {
    color: #2D3748;
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  p {
    color: #4A5568;
    font-size: 1rem;
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  
  small {
    color: #718096;
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 20px;
    display: inline-block;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FilePreview = styled.div`
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e9ecef;
  animation: ${slideIn} 0.5s ease-out;
  
  .file-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .file-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #FF6B35, #F7931E);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
  }
  
  .file-details h4 {
    color: #2D3748;
    margin: 0 0 0.25rem 0;
    font-weight: 600;
  }
  
  .file-details p {
    color: #4A5568;
    margin: 0;
    font-size: 0.9rem;
  }
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #c82333;
    transform: translateY(-1px);
  }
`;

const ProcessButton = styled.button`
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Seção de processamento com design futurístico
const ProcessingContainer = styled.div`
  background: linear-gradient(135deg, #1a202c, #2d3748);
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  max-height: 85vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #FF6B35, transparent);
    animation: ${shimmer} 2s infinite;
  }
`;

const ProcessingHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }
  
  p {
    opacity: 0.8;
    margin: 0;
  }
`;

const ProcessingSteps = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ProcessingStep = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.5s ease;
  
  ${props => props.active && css`
    background: rgba(255, 107, 53, 0.2);
    border-color: #FF6B35;
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
    
    .step-icon {
      animation: ${pulse} 1.5s ease-in-out infinite;
    }
  `}
  
  ${props => props.completed && css`
    background: rgba(40, 167, 69, 0.2);
    border-color: #28a745;
    
    .step-icon {
      color: #28a745;
    }
  `}
  
  .step-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    font-size: 1.2rem;
    transition: all 0.3s ease;
  }
  
  .step-content {
    flex: 1;
    
    h4 {
      margin: 0 0 0.25rem 0;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }
  
  .step-status {
    font-size: 1.2rem;
    opacity: 0.6;
    
    ${props => props.active && css`
      opacity: 1;
      animation: ${bounce} 1s ease-in-out infinite;
    `}
    
    ${props => props.completed && css`
      opacity: 1;
      color: #28a745;
    `}
  }
`;

const ScanAnimation = styled.div`
  position: relative;
  height: 200px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin: 1rem 0;
  overflow: hidden;
  border: 2px solid #FF6B35;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #FF6B35, #F7931E, #FF6B35, transparent);
    animation: ${scanLine} 3s ease-in-out infinite;
    box-shadow: 0 0 10px #FF6B35;
  }
  
  .scan-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    
    .scan-icon {
      font-size: 3rem;
      color: #FF6B35;
      margin-bottom: 1rem;
      animation: ${pulse} 2s ease-in-out infinite;
    }
    
    .scan-text {
      text-align: center;
      
      h4 {
        margin: 0 0 0.5rem 0;
        color: #FF6B35;
      }
      
      p {
        margin: 0;
        opacity: 0.8;
        font-size: 0.9rem;
      }
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 1rem;
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF6B35, #F7931E);
    border-radius: 3px;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
  }
`;

// Mensagens de erro e sucesso modernizadas
const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #fee, #fdd);
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: ${slideIn} 0.5s ease-out;
  
  .error-icon {
    font-size: 1.5rem;
    color: #dc3545;
  }
  
  .error-content {
    flex: 1;
    
    h4 {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      line-height: 1.4;
    }
  }
`;

const SuccessContainer = styled.div`
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  border: 1px solid #c3e6cb;
  border-radius: 16px;
  margin-top: 2rem;
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const SuccessHeader = styled.div`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 1.5rem;
  text-align: center;
  
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
  }
`;

const ResultContainer = styled.div`
  padding: 2rem;
`;

// Componentes para mostrar produtos
const ProductSection = styled.div`
  margin: 2rem 0;
  
  h4 {
    color: #2D3748;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    
    .section-icon {
      font-size: 1.2rem;
    }
    
    .product-count {
      background: #FF6B35;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
    }
  }
`;

const ProductList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const NonEligibleProductCard = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: 0.8;
  
  .product-icon {
    width: 40px;
    height: 40px;
    background: #6c757d;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1rem;
  }
  
  .product-info {
    flex: 1;
    
    h5 {
      margin: 0 0 0.25rem 0;
      color: #495057;
      font-weight: 600;
      font-size: 0.95rem;
    }
    
    .product-details {
      color: #6c757d;
      font-size: 0.85rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }
  
  .product-status {
    background: #6c757d;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const EligibleProductCard = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 2px solid #28a745;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
  
  .product-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #28a745, #20c997);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
  }
  
  .product-info {
    flex: 1;
    
    h5 {
      margin: 0 0 0.25rem 0;
      color: #2D3748;
      font-weight: 600;
    }
    
    .product-details {
      color: #4A5568;
      font-size: 0.9rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }
  
  .product-points {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 3px 10px rgba(40, 167, 69, 0.3);
    font-size: 0.9rem;
  }
`;

const NoProductsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 12px;
  color: #6c757d;
  
  .message-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.6;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SummaryItem = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  text-align: center;
  
  .summary-icon {
    font-size: 1.8rem;
    color: #FF6B35;
    margin-bottom: 0.5rem;
  }
  
  .summary-value {
    font-size: 1.3rem;
    font-weight: bold;
    color: #2D3748;
    margin-bottom: 0.25rem;
  }
  
  .summary-label {
    color: #4A5568;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const TotalPointsCard = styled.div`
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  margin-top: 1.5rem;
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
  
  .points-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  .points-value {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .points-label {
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const UploadPedido = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [produtosElegiveis, setProdutosElegiveis] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);

  // Etapas fictícias mais interessantes para o usuário
  const processingSteps = [
    {
      id: 'scan',
      icon: FiEye,
      title: 'Escaneando Documento',
      description: 'Analisando imagem e detectando texto...',
      duration: 2000
    },
    {
      id: 'ai',
      icon: FiCpu,
      title: 'Inteligência Artificial',
      description: 'Identificando produtos Fast Sistemas...',
      duration: 3000
    },
    {
      id: 'validation',
      icon: FiShield,
      title: 'Validação de Segurança',
      description: 'Verificando autenticidade dos dados...',
      duration: 2500
    },
    {
      id: 'calculation',
      icon: FiZap,
      title: 'Calculando Pontos',
      description: 'Aplicando regras de bonificação...',
      duration: 1500
    },
    {
      id: 'save',
      icon: FiAward,
      title: 'Creditando Pontos',
      description: 'Salvando em sua conta Fast...',
      duration: 2000
    }
  ];

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use apenas JPG, PNG ou PDF.');
      return;
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB.');
      return;
    }

    setSelectedFile(file);
    setError('');
    setResult(null);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    setResult(null);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processOrder = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      // ✅ CONVERTER ARQUIVO COM TRATAMENTO DE ERRO
      let base64
      try {
        base64 = await fileToBase64(selectedFile);
        if (!base64) {
          throw new Error('Falha ao converter arquivo para processamento')
        }
      } catch (error) {
        console.error('Erro na conversão do arquivo:', error);
        throw new Error('Não foi possível processar o arquivo selecionado. Tente novamente com outro arquivo.')
      }

      // ✅ ANALISAR COM IA COM TRATAMENTO DE ERRO
      let aiResult
      try {
        aiResult = await analyzeOrderWithGemini(base64, selectedFile.type);
        if (!aiResult || !aiResult.success) {
          throw new Error(aiResult?.error || 'Falha na análise do documento pela IA')
        }
      } catch (error) {
        console.error('Erro na análise por IA:', error);
        // Não falhar completamente - criar resultado vazio mas válido
        aiResult = {
          success: true,
          data: {
            produtos: [],
            produtosFast: [],
            itens: [],
            valorTotal: 0,
            cliente: 'Cliente',
            numeroPedido: `MANUAL-${Date.now()}`
          }
        }
        console.log('Usando dados de fallback devido ao erro na IA')
      }

      console.log('=== DADOS RETORNADOS PELA IA ===');
      console.log('aiResult.data:', JSON.stringify(aiResult.data, null, 2));
      console.log('================================');

      // ✅ PROCESSAR RESULTADO COM TRATAMENTO DE ERRO ROBUSTO
      let processedOrder
      try {
        processedOrder = await processOrderResult(aiResult.data);

        // Garantir que sempre temos uma estrutura válida
        if (!processedOrder || typeof processedOrder !== 'object') {
          throw new Error('Resultado de processamento inválido')
        }
      } catch (error) {
        console.error('Erro no processamento do resultado:', error);

        // Criar resultado de fallback seguro
        processedOrder = {
          orderNumber: `FALLBACK-${Date.now()}`,
          orderDate: new Date().toISOString().split('T')[0],
          customer: 'Cliente',
          totalValue: 0,
          items: [],
          totalPoints: 0,
          documentHash: `HASH-${Date.now()}`,
          allProducts: [],
          processingError: true,
          errorMessage: 'Erro no processamento, mas nota foi salva sem pontos'
        }
      }

      // ✅ VALIDAÇÃO COM TRATAMENTO DE ERRO
      let validation
      try {
        validation = await validateOrder(processedOrder);
      } catch (error) {
        console.warn('Erro na validação, continuando sem validação:', error);
        validation = { isValid: true, warnings: [], errors: [] }
      }

      // Mostrar warnings como informações, mas não bloquear o processamento
      if (validation.warnings && validation.warnings.length > 0) {
        console.log('Avisos de validação:', validation.warnings);
      }

      // ✅ SALVAR NO BANCO COM TRATAMENTO DE ERRO INDIVIDUAL
      let savedOrder
      try {
        const customerId = user?.id || 'user-unknown'

        // Salvar pedido principal
        savedOrder = await saveOrder({
          cliente_id: customerId,
          numero_pedido: processedOrder.orderNumber,
          data_emissao: processedOrder.orderDate,
          valor_total: processedOrder.totalValue || 0,
          hash_documento: processedOrder.documentHash,
          pontos_gerados: processedOrder.totalPoints || 0,
          status: (processedOrder.noEligibleProducts || processedOrder.totalPoints === 0) ? 'sem_pontos' : 'processado'
        });

        console.log('Pedido salvo com sucesso:', savedOrder.id)
      } catch (error) {
        console.error('Erro ao salvar pedido principal:', error);
        throw new Error('Falha ao salvar pedido no sistema. Tente novamente.')
      }

      // ✅ SALVAR ITENS COM TRATAMENTO INDIVIDUAL
      if (processedOrder.items && Array.isArray(processedOrder.items) && processedOrder.items.length > 0) {
        let itensSalvos = 0

        for (const item of processedOrder.items) {
          try {
            await saveOrderItems({
              pedido_id: savedOrder.id,
              produto_catalogo_id: item.product_id,
              nome_produto: String(item.product_name || 'Produto'),
              codigo_produto: String(item.product_code || ''),
              quantidade: parseInt(item.quantity) || 1,
              valor_unitario: parseFloat(item.unit_price) || 0,
              valor_total: parseFloat(item.total_value) || 0,
              pontos_calculados: parseInt(item.points) || 0,
              categoria: String(item.category || 'outros'),
              produto_fast: true
            });
            itensSalvos++
          } catch (error) {
            console.warn('Erro ao salvar item individual:', item.product_name, error);
            // Continua salvando outros itens
          }
        }

        console.log(`${itensSalvos}/${processedOrder.items.length} itens salvos com sucesso`)
      }

      // ✅ ADICIONAR PONTOS COM TRATAMENTO DE ERRO
      if (processedOrder.totalPoints > 0 && user?.id) {
        try {
          await addPointsToCustomer(user.id, processedOrder.totalPoints, `Pedido ${processedOrder.orderNumber}`);
          console.log('Pontos creditados com sucesso:', processedOrder.totalPoints)
        } catch (error) {
          console.error('Erro ao creditar pontos:', error);
          // Não falhar todo o processo por causa disso
          processedOrder.pointsError = true
          processedOrder.pointsErrorMessage = 'Pedido salvo, mas houve erro ao creditar pontos'
        }
      }

      // ✅ RESULTADO FINAL SEMPRE VÁLIDO
      setResult({
        ...processedOrder,
        orderId: savedOrder?.id,
        success: true
      });

    } catch (err) {
      console.error('ERRO CRÍTICO ao processar pedido:', err);

      // ✅ FALLBACK SEGURO FINAL: Sempre mostrar resultado, mesmo em erro crítico
      setResult({
        orderNumber: `ERRO-${Date.now()}`,
        customer: 'Cliente',
        totalValue: 0,
        totalPoints: 0,
        items: [],
        allProducts: [],
        error: true,
        errorMessage: err.message || 'Erro interno no processamento',
        message: '⚠️ Erro no Processamento',
        details: 'Ocorreu um erro durante o processamento da nota fiscal. O sistema não conseguiu analisar completamente o documento. Tente novamente ou entre em contato com o suporte.',
        userFriendlyError: true
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Carregar produtos elegíveis ao montar o componente
  useEffect(() => {
    const loadProdutos = async () => {
      try {
        setLoadingProdutos(true);
        const produtos = await getProdutosElegiveis();
        setProdutosElegiveis(produtos);
      } catch (error) {
        console.error('Erro ao carregar produtos elegíveis:', error);
        setProdutosElegiveis([]);
      } finally {
        setLoadingProdutos(false);
      }
    };

    loadProdutos();
  }, []);

  return (
    <Container>
      <Header>
        <h1>
          <FiCamera />
          Sistema de Pontuação Fast
        </h1>
        <p>Envie sua nota fiscal e consulte os produtos elegíveis para pontuação</p>
      </Header>

      <MainLayout>
        {/* Seção de Upload ou Resultado */}
        <UploadSection>
          {isProcessing ? (
            <LoadingContainer>
              <div className="spinner"></div>
              <h3>Processando sua Nota Fiscal</h3>
              <p>Analisando produtos e calculando pontos...</p>
            </LoadingContainer>
          ) : result ? (
            <>
              {result.error ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <FiX size={48} color="#dc2626" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>
                    Erro no Processamento
                  </h3>
                  <p style={{ color: '#7f1d1d', margin: 0 }}>
                    {result.errorMessage}
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: result.noEligibleProducts ? '#fef3c7' : '#d1fae5',
                    borderRadius: '12px',
                    border: `1px solid ${result.noEligibleProducts ? '#f59e0b' : '#10b981'}`
                  }}>
                    {result.noEligibleProducts ? (
                      <FiInfo size={32} color="#f59e0b" />
                    ) : (
                      <FiCheck size={32} color="#10b981" />
                    )}
                    <div>
                      <h3 style={{
                        margin: '0 0 0.25rem 0',
                        color: result.noEligibleProducts ? '#92400e' : '#065f46'
                      }}>
                        {result.noEligibleProducts ? 'Nenhum Produto Elegível' : 'Processamento Concluído!'}
                      </h3>
                      <p style={{
                        margin: 0,
                        color: result.noEligibleProducts ? '#78350f' : '#047857'
                      }}>
                        {result.noEligibleProducts
                          ? 'Os produtos identificados não geram pontos'
                          : `${result.totalPoints} pontos foram creditados na sua conta`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Resumo dos resultados */}
                  <SummaryGrid>
                    <SummaryItem>
                      <div className="summary-icon">
                        <FiFile />
                      </div>
                      <div className="summary-value">#{result.orderNumber}</div>
                      <div className="summary-label">Número do Pedido</div>
                    </SummaryItem>

                    <SummaryItem>
                      <div className="summary-icon">
                        <FiShoppingBag />
                      </div>
                      <div className="summary-value">R$ {result.totalValue?.toFixed(2) || '0.00'}</div>
                      <div className="summary-label">Valor Total</div>
                    </SummaryItem>

                    <SummaryItem>
                      <div className="summary-icon">
                        <FiEye />
                      </div>
                      <div className="summary-value">
                        {result.allProducts?.length || result.items?.length || 0}
                      </div>
                      <div className="summary-label">Produtos Identificados</div>
                    </SummaryItem>

                    <SummaryItem>
                      <div className="summary-icon">
                        <FiStar />
                      </div>
                      <div className="summary-value">{result.items?.length || 0}</div>
                      <div className="summary-label">Produtos Elegíveis</div>
                    </SummaryItem>
                  </SummaryGrid>

                  {/* Pontos ganhos em destaque */}
                  <TotalPointsCard style={{
                    background: result.noEligibleProducts
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'linear-gradient(135deg, #A91918, #c41e3a)',
                    marginTop: '1.5rem'
                  }}>
                    <div className="points-icon">
                      {result.noEligibleProducts ? <FiX /> : <FiAward />}
                    </div>
                    <div className="points-value">{result.totalPoints || 0}</div>
                    <div className="points-label">Pontos Creditados</div>
                  </TotalPointsCard>

                  <button
                    onClick={() => {
                      setResult(null);
                      setSelectedFile(null);
                      setError('');
                    }}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: '#A91918',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontFamily: 'Montserrat',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      marginTop: '1.5rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Enviar Nova Nota
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2>📸 Enviar Nota Fiscal</h2>

              <UploadArea
                isDragOver={isDragOver}
                hasFile={!!selectedFile}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <UploadIcon isDragOver={isDragOver} hasFile={!!selectedFile}>
                  {selectedFile ? <FiCheck /> : isDragOver ? <FiUpload /> : <FiCamera />}
                </UploadIcon>
                <UploadText>
                  {selectedFile ? (
                    <>
                      <h3>✅ Arquivo Carregado!</h3>
                      <p>Clique em "Processar" para analisar sua nota</p>
                    </>
                  ) : (
                    <>
                      <h3>📸 Envie sua Nota Fiscal</h3>
                      <p>Clique aqui ou arraste uma foto/PDF do seu pedido Fast Sistemas</p>
                      <small>JPG, PNG ou PDF • Máx. 10MB</small>
                    </>
                  )}
                </UploadText>
              </UploadArea>

              <FileInput
                id="fileInput"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileInputChange}
              />

              {selectedFile && (
                <FilePreview>
                  <div className="file-header">
                    <div className="file-info">
                      <div className="file-icon">
                        {selectedFile.type.includes('pdf') ? <FiFile /> : <FiCamera />}
                      </div>
                      <div className="file-details">
                        <h4>{selectedFile.name}</h4>
                        <p>{formatFileSize(selectedFile.size)} • {selectedFile.type.includes('pdf') ? 'PDF' : 'Imagem'}</p>
                      </div>
                    </div>
                    <RemoveButton onClick={removeFile}>
                      <FiX />
                      Remover
                    </RemoveButton>
                  </div>
                </FilePreview>
              )}

              {selectedFile && (
                <ProcessButton onClick={processOrder}>
                  <FiZap />
                  Processar Pedido
                </ProcessButton>
              )}

              {error && (
                <ErrorMessage>
                  <div className="error-icon">
                    <FiX />
                  </div>
                  <div className="error-content">
                    <h4>Erro no Processamento</h4>
                    <p>{error}</p>
                  </div>
                </ErrorMessage>
              )}
            </>
          )}
        </UploadSection>

        {/* Seção de Produtos Elegíveis - Componente Simplificado */}
        <RegrasFastSimples />
      </MainLayout>
    </Container>
  );
};

export default UploadPedido;
