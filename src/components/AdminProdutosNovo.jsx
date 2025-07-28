import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiPackage, FiSearch, FiRefreshCw, FiToggleLeft, FiToggleRight, FiTrendingUp, FiDatabase, FiDollarSign, FiStar, FiBarChart3, FiEye, FiEyeOff, FiCopy, FiCheck, FiAlertTriangle } from 'react-icons/fi';
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

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Montserrat', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const Header = styled.div`
  background: linear-gradient(135deg, #A91918, #8B1510);
  color: white;
  padding: 2rem;
  border-radius: 16px;
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
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    position: relative;
    z-index: 1;
  }
  
  p {
    opacity: 0.9;
    font-size: 1.1rem;
    margin: 0;
    position: relative;
    z-index: 1;
  }
  
  .subtitle {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-top: 0.5rem;
    font-style: italic;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease-out 0.1s both;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  border-left: 4px solid ${props => props.color || '#A91918'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
  
  .icon {
    font-size: 2rem;
    color: ${props => props.color || '#A91918'};
    margin-bottom: 0.5rem;
  }
  
  .number {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.color || '#A91918'};
    margin-bottom: 0.5rem;
  }
  
  .label {
    color: #666;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .trend {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    background: ${props => props.trendColor || '#e9ecef'};
    color: ${props => props.trendTextColor || '#666'};
  }
`;

const Controls = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
  max-width: 400px;
  
  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #A91918;
    }
  }
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ActionButton = styled.button`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return 'linear-gradient(135deg, #A91918, #8B1510)';
      case 'success': return 'linear-gradient(135deg, #28a745, #20c997)';
      case 'info': return 'linear-gradient(135deg, #17a2b8, #138496)';
      default: return 'linear-gradient(135deg, #6c757d, #5a6268)';
    }
  }};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    font-size: 0.9rem;
    color: #666;
  }
`;

const ToggleButton = styled.button`
  background: ${props => props.active ? '#28a745' : '#dc3545'};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  animation: ${fadeIn} 0.6s ease-out 0.3s both;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
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
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .title {
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  .status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    opacity: 0.9;
  }
`;

const ProductBody = styled.div`
  padding: 1.5rem;
  
  .code {
    font-family: 'Courier New', monospace;
    background: #f8f9fa;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .copy-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s ease;
      
      &:hover {
        background: #e9ecef;
        color: #A91918;
      }
    }
  }
  
  .category {
    display: inline-block;
    background: ${props => props.categoryColor || '#e9ecef'};
    color: ${props => props.categoryTextColor || '#666'};
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1rem;
  }
  
  .description {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
  
  .points-display {
    background: linear-gradient(135deg, #fff3cd, #ffeaa7);
    border: 1px solid #ffc107;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    margin-bottom: 1rem;
    
    .points {
      font-size: 1.5rem;
      font-weight: bold;
      color: #856404;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .points-label {
      font-size: 0.8rem;
      color: #856404;
      opacity: 0.8;
    }
  }
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const QuickStatsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease-out 0.4s both;
  
  h3 {
    color: #353535;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .stat-item {
    text-align: center;
    padding: 1rem;
    border-radius: 8px;
    background: #f8f9fa;
    
    .value {
      font-size: 1.2rem;
      font-weight: bold;
      color: #A91918;
    }
    
    .label {
      font-size: 0.8rem;
      color: #666;
      margin-top: 0.25rem;
    }
  }
`;

const BulkActionsBar = styled.div`
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: ${fadeIn} 0.6s ease-out 0.5s both;
  
  .selected-count {
    font-weight: 600;
  }
  
  .bulk-actions {
    display: flex;
    gap: 1rem;
  }
`;
border - radius: 12px;
padding: 1.5rem;
box - shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
transition: all 0.3s ease;
border: 2px solid ${ props => props.isEditing ? '#A91918' : 'transparent' };
opacity: ${ props => props.inactive ? 0.6 : 1 };
  
  &:hover {
  transform: translateY(-2px);
  box - shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}
`;

const ProductHeader = styled.div`
display: flex;
justify - content: space - between;
align - items: flex - start;
margin - bottom: 1rem;
`;

const ProductInfo = styled.div`
flex: 1;
  
  h3 {
  color: #353535;
  margin: 0 0 0.5rem 0;
  font - size: 1.1rem;
  font - weight: 600;
}
  
  .codigo {
  background: #f8f9fa;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border - radius: 4px;
  font - size: 0.8rem;
  font - family: monospace;
  display: inline - block;
  margin - bottom: 0.5rem;
}
  
  .descricao {
  color: #666;
  font - size: 0.9rem;
  margin - bottom: 0.5rem;
}
`;

const CategoryBadge = styled.span`
background: ${ props => props.color || '#6c757d' };
color: white;
padding: 0.25rem 0.75rem;
border - radius: 20px;
font - size: 0.7rem;
font - weight: 600;
`;

const PointsDisplay = styled.div`
background: linear - gradient(135deg, #A91918, #8B1510);
color: white;
padding: 1rem;
border - radius: 8px;
margin: 1rem 0;
text - align: center;
  
  .points {
  font - size: 1.5rem;
  font - weight: bold;
  margin - bottom: 0.25rem;
}
  
  .description {
  font - size: 0.8rem;
  opacity: 0.9;
}
`;

const ActionsGroup = styled.div`
display: flex;
gap: 0.5rem;
flex - direction: column;
`;

const CardActionButton = styled.button`
background: ${
  props => {
    switch (props.variant) {
      case 'edit': return '#17a2b8';
      case 'delete': return '#dc3545';
      case 'toggle': return props.active ? '#28a745' : '#6c757d';
      default: return '#6c757d';
    }
  }
};
color: white;
border: none;
padding: 0.5rem;
border - radius: 6px;
cursor: pointer;
transition: all 0.3s ease;
display: flex;
align - items: center;
justify - content: center;
  
  &:hover {
  opacity: 0.8;
  transform: scale(1.05);
}
`;

const LoadingContainer = styled.div`
display: flex;
justify - content: center;
align - items: center;
height: 300px;
color: #666;
font - size: 1.1rem;
`;

const Modal = styled.div`
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.5);
display: flex;
align - items: center;
justify - content: center;
z - index: 1000;
animation: ${ fadeIn } 0.3s ease - out;
`;

const ModalContent = styled.div`
background: white;
padding: 2rem;
border - radius: 16px;
width: 90 %;
max - width: 500px;
max - height: 90vh;
overflow - y: auto;
animation: ${ slideIn } 0.3s ease - out;
`;

const ModalHeader = styled.div`
display: flex;
justify - content: space - between;
align - items: center;
margin - bottom: 1.5rem;
  
  h2 {
  color: #353535;
  margin: 0;
  font - family: 'Urbanist', sans - serif;
}
`;

const FormGroup = styled.div`
margin - bottom: 1.5rem;
  
  label {
  display: block;
  margin - bottom: 0.5rem;
  font - weight: 600;
  color: #353535;
}

input, select, textarea {
  width: 100 %;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border - radius: 8px;
  font - size: 1rem;
  transition: border - color 0.3s ease;
    
    &:focus {
    outline: none;
    border - color: #A91918;
  }
}
  
  textarea {
  resize: vertical;
  min - height: 80px;
}
`;

const ModalActions = styled.div`
display: flex;
gap: 1rem;
justify - content: flex - end;
`;

function AdminProdutosNovo() {
    const [produtos, setProdutos] = useState([]);
    const [filteredProdutos, setFilteredProdutos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [showInactive, setShowInactive] = useState(false);
    const [formData, setFormData] = useState({
        codigo: '',
        nome: '',
        pontos_por_real: '',
        categoria: 'placa_st',
        descricao: '',
        ativa: true
    });

    // Carregar produtos da base de dados
    const carregarProdutos = async () => {
        setLoading(true);
        try {
            const result = showInactive
                ? await ProdutosService.obterTodosProdutos()
                : await ProdutosService.obterProdutosAtivos();

            if (result.success) {
                const produtosFormatados = result.data.map(produto => ({
                    codigo: produto.codigo,
                    nome: produto.nome,
                    pontosPorReal: produto.pontos_por_real,
                    categoria: produto.categoria,
                    descricao: produto.descricao,
                    ativa: produto.ativa
                }));
                setProdutos(produtosFormatados);
                setFilteredProdutos(produtosFormatados);
            } else {
                toast.error(result.message || 'Erro ao carregar produtos');
                // Se não conseguir carregar, inicializar produtos
                await inicializarProdutos();
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            toast.error('Erro ao carregar produtos da base de dados');
        } finally {
            setLoading(false);
        }
    };

    // Carregar estatísticas
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

    // Inicializar produtos se necessário
    const inicializarProdutos = async () => {
        try {
            const result = await ProdutosService.inicializarProdutos();
            if (result.success) {
                toast.success(result.message);
                carregarProdutos();
            }
        } catch (error) {
            console.error('Erro ao inicializar produtos:', error);
        }
    };

    useEffect(() => {
        carregarProdutos();
        carregarEstatisticas();
    }, [showInactive]);

    useEffect(() => {
        // Filtrar produtos baseado na busca
        const filtered = produtos.filter(produto =>
            produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProdutos(filtered);
    }, [searchTerm, produtos]);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setFormData({
            codigo: '',
            nome: '',
            pontos_por_real: '',
            categoria: 'placa_st',
            descricao: '',
            ativa: true
        });
        setIsModalOpen(true);
    };

    const handleEditProduct = (produto) => {
        setEditingProduct(produto.codigo);
        setFormData({
            codigo: produto.codigo,
            nome: produto.nome,
            pontos_por_real: produto.pontosPorReal.toString(),
            categoria: produto.categoria,
            descricao: produto.descricao || '',
            ativa: produto.ativa
        });
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

        const produtoData = {
            codigo: formData.codigo,
            nome: formData.nome,
            pontos_por_real: parseFloat(formData.pontos_por_real),
            categoria: formData.categoria,
            descricao: formData.descricao,
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

    const getCategoryDisplayName = (categoria) => {
        const categorias = getCategoriasProdutos();
        return categorias[categoria]?.nome || categoria;
    };

    const getCategoryColor = (categoria) => {
        const categorias = getCategoriasProdutos();
        return categorias[categoria]?.cor || '#6c757d';
    };

    if (loading) {
        return (
            <Container>
                <LoadingContainer>
                    <FiDatabase style={{ marginRight: '0.5rem' }} />
                    Carregando produtos...
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
            </Header>

            {stats && (
                <StatsContainer>
                    <StatCard color="#28a745">
                        <div className="number">{stats.ativos}</div>
                        <div className="label">Produtos Ativos</div>
                    </StatCard>
                    <StatCard color="#dc3545">
                        <div className="number">{stats.inativos}</div>
                        <div className="label">Produtos Inativos</div>
                    </StatCard>
                    <StatCard color="#17a2b8">
                        <div className="number">{Object.keys(stats.categorias || {}).length}</div>
                        <div className="label">Categorias</div>
                    </StatCard>
                    <StatCard color="#ffc107">
                        <div className="number">{stats.pontuacaoMedia?.toFixed(1) || '0'}</div>
                        <div className="label">Pontuação Média</div>
                    </StatCard>
                </StatsContainer>
            )}

            <Controls>
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
                    <ToggleContainer>
                        <span>Mostrar inativos:</span>
                        <ToggleButton
                            active={showInactive}
                            onClick={() => setShowInactive(!showInactive)}
                        >
                            {showInactive ? <FiToggleRight /> : <FiToggleLeft />}
                        </ToggleButton>
                    </ToggleContainer>

                    <ActionButton variant="info" onClick={carregarProdutos}>
                        <FiRefreshCw />
                        Atualizar
                    </ActionButton>

                    <ActionButton variant="primary" onClick={inicializarProdutos}>
                        <FiDatabase />
                        Inicializar
                    </ActionButton>

                    <ActionButton variant="success" onClick={handleAddProduct}>
                        <FiPlus />
                        Adicionar Produto
                    </ActionButton>
                </ButtonGroup>
            </Controls>

            <ProductsGrid>
                {filteredProdutos.map((produto) => (
                    <ProductCard
                        key={produto.codigo}
                        inactive={!produto.ativa}
                    >
                        <ProductHeader>
                            <ProductInfo>
                                <h3>{produto.nome}</h3>
                                <div className="codigo">{produto.codigo}</div>
                                {produto.descricao && (
                                    <div className="descricao">{produto.descricao}</div>
                                )}
                                <CategoryBadge color={getCategoryColor(produto.categoria)}>
                                    {getCategoryDisplayName(produto.categoria)}
                                </CategoryBadge>
                            </ProductInfo>

                            <ActionsGroup>
                                <CardActionButton
                                    variant="edit"
                                    onClick={() => handleEditProduct(produto)}
                                    title="Editar produto"
                                >
                                    <FiEdit2 />
                                </CardActionButton>
                                <CardActionButton
                                    variant="toggle"
                                    active={produto.ativa}
                                    onClick={() => handleToggleProduct(produto.codigo, produto.ativa)}
                                    title={produto.ativa ? "Desativar produto" : "Ativar produto"}
                                >
                                    {produto.ativa ? <FiToggleRight /> : <FiToggleLeft />}
                                </CardActionButton>
                            </ActionsGroup>
                        </ProductHeader>

                        <PointsDisplay>
                            <div className="points">
                                {produto.pontosPorReal} {produto.pontosPorReal === 1 ? 'ponto' : 'pontos'}
                            </div>
                            <div className="description">por R$ 1,00 gasto</div>
                        </PointsDisplay>
                    </ProductCard>
                ))}
            </ProductsGrid>

            {isModalOpen && (
                <Modal onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <ModalContent>
                        <ModalHeader>
                            <h2>{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</h2>
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
                                placeholder="Ex: DW00057"
                                disabled={!!editingProduct}
                            />
                        </FormGroup>

                        <FormGroup>
                            <label>Nome do Produto *</label>
                            <input
                                type="text"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                placeholder="Ex: Placa ST 13mm x 1,20 x 2,40"
                            />
                        </FormGroup>

                        <FormGroup>
                            <label>Pontos por R$ 1,00 *</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={formData.pontos_por_real}
                                onChange={(e) => setFormData({ ...formData, pontos_por_real: e.target.value })}
                                placeholder="Ex: 1.0"
                            />
                        </FormGroup>

                        <FormGroup>
                            <label>Categoria *</label>
                            <select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            >
                                {Object.entries(getCategoriasProdutos()).map(([key, categoria]) => (
                                    <option key={key} value={key}>
                                        {categoria.nome} ({categoria.pontos} pts)
                                    </option>
                                ))}
                            </select>
                        </FormGroup>

                        <FormGroup>
                            <label>Descrição</label>
                            <textarea
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                placeholder="Descrição detalhada do produto..."
                            />
                        </FormGroup>

                        <FormGroup>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.ativa}
                                    onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                                    style={{ marginRight: '0.5rem' }}
                                />
                                Produto ativo
                            </label>
                        </FormGroup>

                        <ModalActions>
                            <ActionButton onClick={() => setIsModalOpen(false)}>
                                <FiX />
                                Cancelar
                            </ActionButton>
                            <ActionButton variant="success" onClick={handleSaveProduct}>
                                <FiSave />
                                Salvar
                            </ActionButton>
                        </ModalActions>
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
}

export default AdminProdutosNovo;
