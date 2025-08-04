import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FiPackage, FiPlus, FiEdit3, FiTrash2, FiSave, FiX, FiSearch, FiFilter, FiStar, FiEye, FiEyeOff, FiDollarSign, FiAward } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { CATEGORIAS_PREMIOS } from '../utils/inicializarPremios';
import LoadingGif from './LoadingGif';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const Container = styled.div`
  animation: ${slideUp} 0.6s ease-out;
  padding: 2rem;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h2 {
    color: ${props => props.theme.colors.text};
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0;
    font-size: 2rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 5px;
  padding: 0.75rem;
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  min-width: 250px;
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const FilterSelect = styled.select`
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: 5px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const StatusFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const StatusButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: 5px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.active && css`
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  `}
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.color || '#667eea'} 0%, ${props => props.colorEnd || '#764ba2'} 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 5px;
  box-shadow: ${props => props.theme.shadows.md};
  
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 700;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
  }
`;

const AddButton = styled.button`
  background: ${props => props.theme.colors.gradientPrimary};
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const PremioCard = styled.div`
  background: white;
  border-radius: 5px;
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.md};
  transition: all 0.3s ease;
  position: relative;
  border-left: 4px solid ${props => props.destaque ? '#ffd700' : 'transparent'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const PremioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    color: ${props => props.theme.colors.text};
    flex: 1;
    font-size: 1.2rem;
  }
`;

const PremioMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.radii.full};
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => props.variant === 'category' && css`
    background: rgba(103, 126, 234, 0.1);
    color: #677eea;
  `}
  
  ${props => props.variant === 'status' && css`
    ${props.ativo ? css`
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
    ` : css`
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    `}
  `}
  
  ${props => props.variant === 'destaque' && css`
    background: rgba(255, 215, 0, 0.2);
    color: #b8860b;
  `}
`;

const PremioInfo = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const PremioStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: ${props => props.theme.radii.md};
`;

const StatItem = styled.div`
  text-align: center;
  
  .value {
    font-size: 1.2rem;
    font-weight: 600;
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }
  
  .label {
    font-size: 0.8rem;
    color: ${props => props.theme.colors.textSecondary};
    margin-top: 0.25rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'edit' && css`
    background: #17a2b8;
    color: white;
    &:hover { background: #138496; transform: translateY(-1px); }
  `}
  
  ${props => props.variant === 'delete' && css`
    background: #dc3545;
    color: white;
    &:hover { background: #c82333; transform: translateY(-1px); }
  `}
  
  ${props => props.variant === 'toggle' && css`
    background: ${props.ativo ? '#28a745' : '#6c757d'};
    color: white;
    &:hover { 
      background: ${props.ativo ? '#218838' : '#545b62'}; 
      transform: translateY(-1px); 
    }
  `}
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.lg};
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h3 {
    margin: 0;
    color: ${props => props.theme.colors.text};
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  padding: 0.5rem;
  border-radius: ${props => props.theme.radii.md};
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  ${props => props.fullWidth && css`
    grid-column: 1 / -1;
  `}
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: ${props => props.theme.radii.md};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: ${props => props.theme.radii.md};
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: ${props => props.theme.radii.md};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  transform: scale(1.2);
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.gray200};
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' && css`
    background: ${props => props.theme.colors.gradientPrimary};
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: ${props => props.theme.shadows.md};
    }
  `}
  
  ${props => props.variant === 'secondary' && css`
    background: ${props => props.theme.colors.gray200};
    color: ${props => props.theme.colors.text};
    
    &:hover {
      background: ${props => props.theme.colors.gray300};
    }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
  
  h3 {
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.text};
  }
`;

function AdminPremiosCompleto() {
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPremio, setEditingPremio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    destaque: 0
  });

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    pontos_necessarios: 0,
    valor_estimado: 0,
    estoque_disponivel: 0,
    estoque_ilimitado: false,
    ativo: true,
    destaque: false,
    ordem_exibicao: 0,
    imagem_url: ''
  });

  useEffect(() => {
    loadPremios();
  }, []);

  const loadPremios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('premios_catalogo')
        .select('*')
        .order('ordem_exibicao', { ascending: true });

      if (error) throw error;

      setPremios(data || []);

      // Calcular estatísticas
      const totalPremios = data?.length || 0;
      const ativosPremios = data?.filter(p => p.ativo).length || 0;
      const inativosPremios = totalPremios - ativosPremios;
      const destaquePremios = data?.filter(p => p.destaque).length || 0;

      setStats({
        total: totalPremios,
        ativos: ativosPremios,
        inativos: inativosPremios,
        destaque: destaquePremios
      });

    } catch (error) {
      console.error('Erro ao carregar prêmios:', error);
      toast.error('Erro ao carregar prêmios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.categoria || formData.pontos_necessarios <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingPremio) {
        const { error } = await supabase
          .from('premios_catalogo')
          .update(formData)
          .eq('id', editingPremio.id);

        if (error) throw error;
        toast.success('Prêmio atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('premios_catalogo')
          .insert([formData]);

        if (error) throw error;
        toast.success('Prêmio criado com sucesso!');
      }

      handleCloseModal();
      loadPremios();
    } catch (error) {
      console.error('Erro ao salvar prêmio:', error);
      toast.error('Erro ao salvar prêmio');
    }
  };

  const handleDelete = async (id, nome) => {
    if (!confirm(`Tem certeza que deseja excluir o prêmio "${nome}"?\n\nEsta ação não pode ser desfeita.`)) return;

    try {
      const { error } = await supabase
        .from('premios_catalogo')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Prêmio excluído com sucesso!');
      loadPremios();
    } catch (error) {
      console.error('Erro ao excluir prêmio:', error);
      toast.error('Erro ao excluir prêmio');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('premios_catalogo')
        .update({ ativo: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Prêmio ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
      loadPremios();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do prêmio');
    }
  };

  const handleEdit = (premio) => {
    setEditingPremio(premio);
    setFormData({
      nome: premio.nome || '',
      descricao: premio.descricao || '',
      categoria: premio.categoria || '',
      pontos_necessarios: premio.pontos_necessarios || 0,
      valor_estimado: premio.valor_estimado || 0,
      estoque_disponivel: premio.estoque_disponivel || 0,
      estoque_ilimitado: premio.estoque_ilimitado || false,
      ativo: premio.ativo !== false,
      destaque: premio.destaque || false,
      ordem_exibicao: premio.ordem_exibicao || 0,
      imagem_url: premio.imagem_url || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPremio(null);
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      pontos_necessarios: 0,
      valor_estimado: 0,
      estoque_disponivel: 0,
      estoque_ilimitado: false,
      ativo: true,
      destaque: false,
      ordem_exibicao: 0,
      imagem_url: ''
    });
  };

  // Filtrar prêmios
  const premiosFiltrados = premios.filter(premio => {
    const matchesSearch = premio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      premio.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || premio.categoria === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'ativo' && premio.ativo) ||
      (statusFilter === 'inativo' && !premio.ativo);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <Container>
        <LoadingGif
          text="Carregando prêmios..."
          size="120px"
          mobileSize="100px"
        />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h2>
          <FiPackage />
          Catálogo de Prêmios
        </h2>
        <HeaderActions>
          <AddButton onClick={() => setShowModal(true)}>
            <FiPlus />
            Novo Prêmio
          </AddButton>
        </HeaderActions>
      </Header>

      {/* Estatísticas */}
      <StatsSection>
        <StatCard color="#667eea" colorEnd="#764ba2">
          <h3>{stats.total}</h3>
          <p>Total de Prêmios</p>
        </StatCard>
        <StatCard color="#38ef7d" colorEnd="#11998e">
          <h3>{stats.ativos}</h3>
          <p>Prêmios Ativos</p>
        </StatCard>
        <StatCard color="#ff6b6b" colorEnd="#ee5a24">
          <h3>{stats.inativos}</h3>
          <p>Prêmios Inativos</p>
        </StatCard>
        <StatCard color="#ffd700" colorEnd="#ffed4e">
          <h3>{stats.destaque}</h3>
          <p>Em Destaque</p>
        </StatCard>
      </StatsSection>

      {/* Filtros e busca */}
      <SearchBar>
        <FiSearch />
        <SearchInput
          type="text"
          placeholder="Buscar prêmios por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FilterSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">Todas as categorias</option>
          {Object.entries(CATEGORIAS_PREMIOS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </FilterSelect>

        <StatusFilter>
          <StatusButton
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            Todos
          </StatusButton>
          <StatusButton
            active={statusFilter === 'ativo'}
            onClick={() => setStatusFilter('ativo')}
          >
            Ativos
          </StatusButton>
          <StatusButton
            active={statusFilter === 'inativo'}
            onClick={() => setStatusFilter('inativo')}
          >
            Inativos
          </StatusButton>
        </StatusFilter>
      </SearchBar>

      {/* Lista de prêmios */}
      {premiosFiltrados.length === 0 ? (
        <EmptyState>
          <h3>Nenhum prêmio encontrado</h3>
          <p>{premios.length === 0 ?
            'Clique em "Novo Prêmio" para adicionar o primeiro prêmio ao catálogo.' :
            'Tente ajustar os filtros de busca.'
          }</p>
        </EmptyState>
      ) : (
        <Grid>
          {premiosFiltrados.map(premio => (
            <PremioCard key={premio.id} destaque={premio.destaque}>
              <PremioHeader>
                <h3>{premio.nome}</h3>
                <Actions>
                  <ActionButton
                    variant="toggle"
                    ativo={premio.ativo}
                    onClick={() => handleToggleStatus(premio.id, premio.ativo)}
                    title={premio.ativo ? 'Desativar prêmio' : 'Ativar prêmio'}
                  >
                    {premio.ativo ? <FiEye /> : <FiEyeOff />}
                  </ActionButton>
                  <ActionButton
                    variant="edit"
                    onClick={() => handleEdit(premio)}
                    title="Editar prêmio"
                  >
                    <FiEdit3 />
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => handleDelete(premio.id, premio.nome)}
                    title="Excluir prêmio"
                  >
                    <FiTrash2 />
                  </ActionButton>
                </Actions>
              </PremioHeader>

              <PremioMeta>
                <Badge variant="category">
                  {CATEGORIAS_PREMIOS[premio.categoria] || premio.categoria}
                </Badge>
                <Badge variant="status" ativo={premio.ativo}>
                  {premio.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
                {premio.destaque && (
                  <Badge variant="destaque">
                    <FiStar /> Destaque
                  </Badge>
                )}
              </PremioMeta>

              <PremioInfo>
                {premio.descricao || 'Sem descrição'}
              </PremioInfo>

              <PremioStats>
                <StatItem>
                  <div className="value">
                    <FiAward />
                    {premio.pontos_necessarios?.toLocaleString() || 0}
                  </div>
                  <div className="label">Pontos</div>
                </StatItem>
                <StatItem>
                  <div className="value">
                    <FiDollarSign />
                    {premio.valor_estimado ? `R$ ${premio.valor_estimado.toFixed(2)}` : 'N/A'}
                  </div>
                  <div className="label">Valor</div>
                </StatItem>
              </PremioStats>
            </PremioCard>
          ))}
        </Grid>
      )}

      {/* Modal de criação/edição */}
      {showModal && (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <ModalContent>
            <ModalHeader>
              <h3>{editingPremio ? 'Editar Prêmio' : 'Novo Prêmio'}</h3>
              <CloseButton onClick={handleCloseModal}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <Label>Nome do Prêmio *</Label>
                  <Input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    placeholder="Ex: Nível Laser Profissional"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {Object.entries(CATEGORIAS_PREMIOS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Pontos Necessários *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.pontos_necessarios}
                    onChange={(e) => setFormData({ ...formData, pontos_necessarios: parseInt(e.target.value) || 0 })}
                    required
                    placeholder="1000"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Valor Estimado (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor_estimado}
                    onChange={(e) => setFormData({ ...formData, valor_estimado: parseFloat(e.target.value) || 0 })}
                    placeholder="99.90"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Estoque Disponível</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.estoque_disponivel}
                    onChange={(e) => setFormData({ ...formData, estoque_disponivel: parseInt(e.target.value) || 0 })}
                    disabled={formData.estoque_ilimitado}
                    placeholder="10"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Ordem de Exibição</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.ordem_exibicao}
                    onChange={(e) => setFormData({ ...formData, ordem_exibicao: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <Label>Descrição</Label>
                  <TextArea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição detalhada do prêmio..."
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <Label>URL da Imagem</Label>
                  <Input
                    type="url"
                    value={formData.imagem_url}
                    onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                    placeholder="https://..."
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <CheckboxLabel>
                    <Checkbox
                      type="checkbox"
                      checked={formData.estoque_ilimitado}
                      onChange={(e) => setFormData({ ...formData, estoque_ilimitado: e.target.checked })}
                    />
                    Estoque ilimitado
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <Checkbox
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    />
                    Prêmio ativo
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <Checkbox
                      type="checkbox"
                      checked={formData.destaque}
                      onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                    />
                    Destacar prêmio
                  </CheckboxLabel>
                </FormGroup>
              </FormGrid>

              <FormActions>
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  <FiX />
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  <FiSave />
                  {editingPremio ? 'Atualizar' : 'Criar'} Prêmio
                </Button>
              </FormActions>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default AdminPremiosCompleto;
