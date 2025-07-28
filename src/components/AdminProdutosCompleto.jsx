import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiPackage, FiSearch,
  FiRefreshCw, FiToggleLeft, FiToggleRight, FiTrendingUp, FiDatabase,
  FiDollarSign, FiStar, FiBarChart2, FiEye, FiEyeOff, FiCopy,
  FiCheck, FiAlertTriangle, FiSettings, FiUpload, FiDownload
} from 'react-icons/fi';
import { getCategoriasProdutos } from '../utils/pedidosFast';
import ProdutosService from '../services/produtosService';
import toast from 'react-hot-toast';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const Header = styled.div`
  background: linear-gradient(135deg, #A91918, #8B1510);
  color: white;
  padding: 3rem 2rem;
  border-radius: 5px;
  margin-bottom: 2rem;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
    opacity: 0.1;
  }
  
  h1 {
    font-family: 'Urbanist', sans-serif;
    font-size: 2.8rem;
    margin-bottom: 0.5rem;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    position: relative;
    z-index: 1;
  }
  
  p {
    opacity: 0.9;
    font-size: 1.2rem;
    margin: 0;
    position: relative;
    z-index: 1;
  }
  
  .subtitle {
    font-size: 1rem;
    opacity: 0.8;
    margin-top: 0.5rem;
    font-style: italic;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease-out 0.1s both;
`;

const StatCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 5px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-left: 5px solid ${props => props.color || '#A91918'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
  
  .icon {
    font-size: 2.5rem;
    color: ${props => props.color || '#A91918'};
    margin-bottom: 1rem;
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  .number {
    font-size: 2.5rem;
    font-weight: bold;
    color: ${props => props.color || '#A91918'};
    margin-bottom: 0.5rem;
  }
  
  .label {
    color: #666;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .trend {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 0.8rem;
    padding: 0.25rem 0.6rem;
    border-radius: 5px;
    background: ${props => props.trendColor || '#e9ecef'};
    color: ${props => props.trendTextColor || '#666'};
    font-weight: 600;
  }
`;

const Controls = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 5px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
  
  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
    }
  }
  
  .filters-row {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
  max-width: 400px;
  
  input {
    width: 100%;
    padding: 1rem 1rem 1rem 3.5rem;
    border: 2px solid #e9ecef;
    border-radius: 5px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #f8f9fa;
    
    &:focus {
      outline: none;
      border-color: #A91918;
      background: white;
      box-shadow: 0 0 0 3px rgba(169, 25, 24, 0.1);
    }
    
    &::placeholder {
      color: #999;
    }
  }
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    font-size: 1.2rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return 'linear-gradient(135deg, #A91918, #8B1510)';
      case 'success': return 'linear-gradient(135deg, #28a745, #20c997)';
      case 'info': return 'linear-gradient(135deg, #17a2b8, #138496)';
      case 'warning': return 'linear-gradient(135deg, #ffc107, #e0a800)';
      case 'danger': return 'linear-gradient(135deg, #dc3545, #c82333)';
      default: return 'linear-gradient(135deg, #6c757d, #5a6268)';
    }
  }};
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  select {
    padding: 0.75rem 1rem;
    border: 2px solid #e9ecef;
    border-radius: 5px;
    background: white;
    color: #353535;
    cursor: pointer;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #A91918;
    }
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }
`;

const ToggleButton = styled.button`
  background: ${props => props.active ? '#28a745' : '#dc3545'};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2rem;
  animation: ${fadeIn} 0.6s ease-out 0.3s both;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    border-color: #A91918;
  }
  
  ${props => !props.$active && `
    opacity: 0.7;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  `}
`;

const ProductHeader = styled.div`
  background: ${props => props.$active ?
    'linear-gradient(135deg, #A91918, #8B1510)' :
    'linear-gradient(135deg, #6c757d, #5a6268)'};
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .title {
    font-weight: 700;
    font-size: 1.2rem;
    font-family: 'Urbanist', sans-serif;
  }
  
  .status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    opacity: 0.9;
    font-weight: 600;
  }
`;

const ProductBody = styled.div`
  padding: 2rem;
  
  .code {
    font-family: 'Courier New', monospace;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    padding: 1rem;
    border-radius: 5px;
    font-size: 1rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #dee2e6;
    
    .copy-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 5px;
      transition: all 0.2s ease;
      
      &:hover {
        background: #A91918;
        color: white;
      }
    }
  }
  
  .category {
    display: inline-block;
    background: ${props => props.categoryColor || '#e9ecef'};
    color: ${props => props.categoryTextColor || '#666'};
    padding: 0.5rem 1rem;
    border-radius: 5px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1.5rem;
  }
  
  .description {
    color: #666;
    font-size: 1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
    font-style: italic;
  }
  
  .points-display {
    background: linear-gradient(135deg, #fff3cd, #ffeaa7);
    border: 2px solid #ffc107;
    border-radius: 5px;
    padding: 1.5rem;
    text-align: center;
    margin-bottom: 1.5rem;
    
    .points {
      font-size: 2rem;
      font-weight: bold;
      color: #856404;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .points-label {
      font-size: 0.9rem;
      color: #856404;
      opacity: 0.8;
      font-weight: 600;
    }
  }
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const CardActionButton = styled.button`
  flex: 1;
  background: ${props => {
    switch (props.variant) {
      case 'edit': return 'linear-gradient(135deg, #17a2b8, #138496)';
      case 'delete': return 'linear-gradient(135deg, #dc3545, #c82333)';
      case 'toggle': return props.active ?
        'linear-gradient(135deg, #28a745, #20c997)' :
        'linear-gradient(135deg, #6c757d, #5a6268)';
      default: return 'linear-gradient(135deg, #6c757d, #5a6268)';
    }
  }};
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: #666;
  font-size: 1.2rem;
  
  .loading-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: ${pulse} 1.5s ease-in-out infinite;
    color: #A91918;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 5px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideIn} 0.3s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h2 {
    color: #353535;
    margin: 0;
    font-family: 'Urbanist', sans-serif;
    font-size: 1.8rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
  
  label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: #353535;
    font-size: 1rem;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e9ecef;
    border-radius: 5px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #f8f9fa;
    
    &:focus {
      outline: none;
      border-color: #A91918;
      background: white;
      box-shadow: 0 0 0 3px rgba(169, 25, 24, 0.1);
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .help-text {
    font-size: 0.85rem;
    color: #666;
    margin-top: 0.5rem;
    font-style: italic;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #353535;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
  }
`;

function AdminProdutosCompleto() {
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('points_desc');
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    pontos_por_real: '',
    categoria: Object.keys(getCategoriasProdutos())[0] || '',
    descricao: '',
    ativa: true
  });

  useEffect(() => {
    carregarProdutos();
    carregarEstatisticas();
  }, []);

  useEffect(() => {
    filtrarProdutos();
  }, [produtos, searchTerm, showInactive, selectedCategory, sortBy]);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const result = await ProdutosService.obterTodosProdutos();
      if (result.success) {
        setProdutos(result.data);
      } else {
        toast.error('Erro ao carregar produtos');
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const result = await ProdutosService.obterEstatisticas();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const filtrarProdutos = () => {
    let filtered = [...produtos];

    // Filtrar por status ativo/inativo
    if (!showInactive) {
      filtered = filtered.filter(p => p.ativa);
    }

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoria === selectedCategory);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nome.toLowerCase().includes(term) ||
        p.codigo.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term) ||
        (p.descricao && p.descricao.toLowerCase().includes(term))
      );
    }

    // Ordenar
    switch (sortBy) {
      case 'points_desc':
        filtered.sort((a, b) => b.pontos_por_real - a.pontos_por_real);
        break;
      case 'points_asc':
        filtered.sort((a, b) => a.pontos_por_real - b.pontos_por_real);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case 'code_asc':
        filtered.sort((a, b) => a.codigo.localeCompare(b.codigo));
        break;
      default:
        break;
    }

    setFilteredProdutos(filtered);
  };

  const openModal = (produto = null) => {
    if (produto) {
      setEditingProduct(produto.codigo);
      setFormData({
        codigo: produto.codigo,
        nome: produto.nome,
        pontos_por_real: produto.pontos_por_real.toString(),
        categoria: produto.categoria,
        descricao: produto.descricao || '',
        ativa: produto.ativa
      });
    } else {
      setEditingProduct(null);
      setFormData({
        codigo: '',
        nome: '',
        pontos_por_real: '',
        categoria: Object.keys(getCategoriasProdutos())[0] || '',
        descricao: '',
        ativa: true
      });
    }
    setIsModalOpen(true);
  };

  const handleToggleProduct = async (codigo, ativaAtual) => {
    try {
      const result = ativaAtual
        ? await ProdutosService.desativarProduto(codigo)
        : await ProdutosService.reativarProduto(codigo);

      if (result.success) {
        toast.success(result.message);
        carregarProdutos();
        carregarEstatisticas();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      toast.error('Erro ao alterar status do produto');
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.codigo || !formData.nome || !formData.pontos_por_real) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    // Validar se pontos por real é um número válido
    const pontosValue = parseFloat(formData.pontos_por_real);
    if (isNaN(pontosValue) || pontosValue < 0) {
      toast.error('Pontos por real deve ser um número válido maior ou igual a zero!');
      return;
    }

    const produtoData = {
      codigo: formData.codigo.toUpperCase().trim(),
      nome: formData.nome.trim(),
      pontos_por_real: pontosValue,
      categoria: formData.categoria,
      descricao: formData.descricao.trim(),
      ativa: formData.ativa
    };

    try {
      let result;
      if (editingProduct) {
        // Editando produto existente
        result = await ProdutosService.atualizarProduto(editingProduct, produtoData);
      } else {
        // Adicionando novo produto
        result = await ProdutosService.adicionarProduto(produtoData);
      }

      if (result.success) {
        toast.success(result.message);
        setIsModalOpen(false);
        carregarProdutos();
        carregarEstatisticas();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async (codigo) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto ${codigo}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const result = await ProdutosService.removerProduto(codigo);
      if (result.success) {
        toast.success(result.message);
        carregarProdutos();
        carregarEstatisticas();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const handleCopyCode = (codigo) => {
    navigator.clipboard.writeText(codigo);
    toast.success('Código copiado!');
  };

  const getCategoryDisplayName = (categoria) => {
    const categorias = getCategoriasProdutos();
    return categorias[categoria]?.nome || categoria;
  };

  const getCategoryColor = (categoria) => {
    const categorias = getCategoriasProdutos();
    return categorias[categoria]?.cor || '#6c757d';
  };

  const getCategoryTextColor = (categoria) => {
    const categorias = getCategoriasProdutos();
    const cor = categorias[categoria]?.cor || '#6c757d';
    // Calcular se o texto deve ser claro ou escuro baseado na cor de fundo
    const hex = cor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155 ? '#000' : '#fff';
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <div className="loading-icon">
            <FiDatabase />
          </div>
          <div>Carregando produtos elegíveis...</div>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>
          <FiPackage />
          Administração de Produtos Elegíveis
        </h1>
        <p>Gerencie os produtos e regras de pontuação do Clube Fast de Recompensas</p>
        <div className="subtitle">
          Configure quais produtos geram pontos e defina a pontuação por R$ gasto
        </div>
      </Header>

      {stats && (
        <StatsContainer>
          <StatCard color="#28a745">
            <div className="icon"><FiCheck /></div>
            <div className="number">{stats.ativos}</div>
            <div className="label">Produtos Ativos</div>
          </StatCard>

          <StatCard color="#dc3545">
            <div className="icon"><FiEyeOff /></div>
            <div className="number">{stats.inativos}</div>
            <div className="label">Produtos Inativos</div>
          </StatCard>

          <StatCard color="#17a2b8">
            <div className="icon"><FiBarChart2 /></div>
            <div className="number">{Object.keys(stats.categorias || {}).length}</div>
            <div className="label">Categorias</div>
          </StatCard>

          <StatCard color="#ffc107" trendColor="#fff3cd" trendTextColor="#856404">
            <div className="icon"><FiStar /></div>
            <div className="number">{stats.pontuacaoMedia?.toFixed(1) || '0.0'}</div>
            <div className="label">Pontos Médios</div>
            <div className="trend">Por R$ 1,00</div>
          </StatCard>
        </StatsContainer>
      )}

      <Controls>
        <div className="top-row">
          <SearchContainer>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar produtos por nome, código ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <ButtonGroup>
            <ActionButton variant="primary" onClick={() => openModal()}>
              <FiPlus />
              Novo Produto
            </ActionButton>
            <ActionButton variant="info" onClick={carregarProdutos}>
              <FiRefreshCw />
              Atualizar
            </ActionButton>
            <ActionButton variant="success">
              <FiUpload />
              Importar
            </ActionButton>
            <ActionButton>
              <FiDownload />
              Exportar
            </ActionButton>
          </ButtonGroup>
        </div>

        <div className="filters-row">
          <FilterGroup>
            <label>Categoria:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas as categorias</option>
              {Object.entries(getCategoriasProdutos()).map(([key, categoria]) => (
                <option key={key} value={key}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup>
            <label>Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="points_desc">Maior pontuação</option>
              <option value="points_asc">Menor pontuação</option>
              <option value="name_asc">Nome A-Z</option>
              <option value="name_desc">Nome Z-A</option>
              <option value="code_asc">Código A-Z</option>
            </select>
          </FilterGroup>

          <ToggleContainer>
            <span>Mostrar inativos:</span>
            <ToggleButton
              active={showInactive}
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? <FiEye /> : <FiEyeOff />}
            </ToggleButton>
          </ToggleContainer>
        </div>
      </Controls>

      {filteredProdutos.length === 0 ? (
        <EmptyState>
          <div className="icon">
            <FiPackage />
          </div>
          <h3>Nenhum produto encontrado</h3>
          <p>
            {searchTerm || selectedCategory !== 'all' || !showInactive
              ? 'Ajuste os filtros para ver mais produtos.'
              : 'Comece adicionando produtos elegíveis para o programa de fidelidade.'}
          </p>
        </EmptyState>
      ) : (
        <ProductsGrid>
          {filteredProdutos.map((produto) => (
            <ProductCard key={produto.codigo} $active={produto.ativa}>
              <ProductHeader $active={produto.ativa}>
                <div className="title">{produto.nome}</div>
                <div className="status">
                  {produto.ativa ? <FiEye /> : <FiEyeOff />}
                  {produto.ativa ? 'Ativo' : 'Inativo'}
                </div>
              </ProductHeader>

              <ProductBody
                categoryColor={getCategoryColor(produto.categoria)}
                categoryTextColor={getCategoryTextColor(produto.categoria)}
              >
                <div className="code">
                  <span>{produto.codigo}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopyCode(produto.codigo)}
                    title="Copiar código"
                  >
                    <FiCopy />
                  </button>
                </div>

                <div className="category">
                  {getCategoryDisplayName(produto.categoria)}
                </div>

                {produto.descricao && (
                  <div className="description">
                    {produto.descricao}
                  </div>
                )}

                <div className="points-display">
                  <div className="points">
                    <FiStar />
                    {produto.pontos_por_real}
                  </div>
                  <div className="points-label">
                    pontos por R$ 1,00
                  </div>
                </div>
              </ProductBody>

              <ProductActions>
                <CardActionButton
                  variant="edit"
                  onClick={() => openModal(produto)}
                >
                  <FiEdit2 />
                  Editar
                </CardActionButton>

                <CardActionButton
                  variant="toggle"
                  active={produto.ativa}
                  onClick={() => handleToggleProduct(produto.codigo, produto.ativa)}
                >
                  {produto.ativa ? <FiEyeOff /> : <FiEye />}
                  {produto.ativa ? 'Desativar' : 'Ativar'}
                </CardActionButton>

                <CardActionButton
                  variant="delete"
                  onClick={() => handleDeleteProduct(produto.codigo)}
                >
                  <FiTrash2 />
                  Excluir
                </CardActionButton>
              </ProductActions>
            </ProductCard>
          ))}
        </ProductsGrid>
      )}

      {isModalOpen && (
        <Modal onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <ModalContent>
            <ModalHeader>
              <h2>
                {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h2>
              <CardActionButton onClick={() => setIsModalOpen(false)}>
                <FiX />
              </CardActionButton>
            </ModalHeader>

            <FormGroup>
              <label>Código do Produto *</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ex: PLACA_ST_001"
                disabled={!!editingProduct}
                style={{ textTransform: 'uppercase' }}
              />
              <div className="help-text">
                Código único para identificar o produto (será convertido para maiúsculas)
              </div>
            </FormGroup>

            <FormGroup>
              <label>Nome do Produto *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Placa ST 13mm x 1,20 x 2,40"
              />
              <div className="help-text">
                Nome completo do produto conforme aparece nas notas fiscais
              </div>
            </FormGroup>

            <FormGroup>
              <label>Pontos por R$ 1,00 *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.pontos_por_real}
                onChange={(e) => setFormData({ ...formData, pontos_por_real: e.target.value })}
                placeholder="Ex: 1.5"
              />
              <div className="help-text">
                Quantos pontos o cliente ganha por cada R$ 1,00 gasto neste produto
              </div>
            </FormGroup>

            <FormGroup>
              <label>Categoria *</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              >
                {Object.entries(getCategoriasProdutos()).map(([key, categoria]) => (
                  <option key={key} value={key}>
                    {categoria.nome} ({categoria.pontos} pts padrão)
                  </option>
                ))}
              </select>
              <div className="help-text">
                Categoria do produto para organização e relatórios
              </div>
            </FormGroup>

            <FormGroup>
              <label>Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição detalhada do produto, especificações técnicas, etc."
              />
              <div className="help-text">
                Informações adicionais que ajudem na identificação do produto
              </div>
            </FormGroup>

            <FormGroup>
              <label>
                <input
                  type="checkbox"
                  checked={formData.ativa}
                  onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                  style={{ marginRight: '0.75rem', transform: 'scale(1.2)' }}
                />
                Produto ativo (gera pontos quando identificado em notas fiscais)
              </label>
            </FormGroup>

            <ModalActions>
              <ActionButton onClick={() => setIsModalOpen(false)}>
                <FiX />
                Cancelar
              </ActionButton>
              <ActionButton variant="success" onClick={handleSaveProduct}>
                <FiSave />
                {editingProduct ? 'Atualizar' : 'Criar'} Produto
              </ActionButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default AdminProdutosCompleto;
