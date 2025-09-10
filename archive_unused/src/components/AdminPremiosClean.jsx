import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FiPackage, FiPlus, FiEdit3, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
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
  }
`;

const AddButton = styled.button`
  background: ${props => props.theme.colors.gradientPrimary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const PremioCard = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.md};
  transition: all 0.3s ease;
  position: relative;
  
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
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
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
    &:hover { background: #138496; }
  `}
  
  ${props => props.variant === 'delete' && css`
    background: #dc3545;
    color: white;
    &:hover { background: #c82333; }
  `}
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const PremioInfo = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.radii.full};
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => props.ativo ? css`
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
  ` : css`
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.3s ease-out;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
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
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' && css`
    background: ${props.theme.colors.gradientPrimary};
    color: white;
    &:hover { transform: translateY(-2px); }
  `}
  
  ${props => props.variant === 'secondary' && css`
    background: ${props.theme.colors.gray200};
    color: ${props.theme.colors.text};
    &:hover { background: ${props.theme.colors.gray300}; }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textSecondary};
  
  h3 {
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.text};
  }
`;

function AdminPremios() {
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPremio, setEditingPremio] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    pontos_necessarios: 0,
    categoria: '',
    ativo: true
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
        .order('pontos_necessarios');

      if (error) throw error;
      setPremios(data || []);
    } catch (error) {
      console.error('Erro ao carregar prêmios:', error);
      toast.error('Erro ao carregar prêmios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPremio) {
        const { error } = await supabase
          .from('premios_catalogo')
          .update(formData)
          .eq('id', editingPremio.id);

        if (error) throw error;
        toast.success('Prêmio atualizado!');
      } else {
        const { error } = await supabase
          .from('premios_catalogo')
          .insert([formData]);

        if (error) throw error;
        toast.success('Prêmio criado!');
      }

      handleCloseModal();
      loadPremios();
    } catch (error) {
      console.error('Erro ao salvar prêmio:', error);
      toast.error('Erro ao salvar prêmio');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este prêmio?')) return;

    try {
      const { error } = await supabase
        .from('premios_catalogo')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Prêmio excluído!');
      loadPremios();
    } catch (error) {
      console.error('Erro ao excluir prêmio:', error);
      toast.error('Erro ao excluir prêmio');
    }
  };

  const handleEdit = (premio) => {
    setEditingPremio(premio);
    setFormData({
      nome: premio.nome,
      descricao: premio.descricao || '',
      pontos_necessarios: premio.pontos_necessarios,
      categoria: premio.categoria,
      ativo: premio.ativo
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPremio(null);
    setFormData({
      nome: '',
      descricao: '',
      pontos_necessarios: 0,
      categoria: '',
      ativo: true
    });
  };

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
          Gerenciar Prêmios
        </h2>
        <AddButton onClick={() => setShowModal(true)}>
          <FiPlus />
          Novo Prêmio
        </AddButton>
      </Header>

      {premios.length === 0 ? (
        <EmptyState>
          <h3>Nenhum prêmio encontrado</h3>
          <p>Clique em "Novo Prêmio" para adicionar o primeiro prêmio ao catálogo.</p>
        </EmptyState>
      ) : (
        <Grid>
          {premios.map(premio => (
            <PremioCard key={premio.id}>
              <PremioHeader>
                <h3>{premio.nome}</h3>
                <Actions>
                  <ActionButton variant="edit" onClick={() => handleEdit(premio)}>
                    <FiEdit3 />
                  </ActionButton>
                  <ActionButton variant="delete" onClick={() => handleDelete(premio.id)}>
                    <FiTrash2 />
                  </ActionButton>
                </Actions>
              </PremioHeader>

              <PremioInfo>
                <p><strong>Pontos:</strong> {premio.pontos_necessarios.toLocaleString()}</p>
                <p><strong>Categoria:</strong> {premio.categoria}</p>
                {premio.descricao && (
                  <p><strong>Descrição:</strong> {premio.descricao}</p>
                )}
                <StatusBadge ativo={premio.ativo}>
                  {premio.ativo ? 'Ativo' : 'Inativo'}
                </StatusBadge>
              </PremioInfo>
            </PremioCard>
          ))}
        </Grid>
      )}

      {showModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>{editingPremio ? 'Editar' : 'Novo'} Prêmio</h3>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Nome do Prêmio</Label>
                <Input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Descrição</Label>
                <TextArea
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição opcional do prêmio..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Pontos Necessários</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.pontos_necessarios}
                  onChange={(e) => setFormData(prev => ({ ...prev, pontos_necessarios: parseInt(e.target.value) || 0 }))}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Categoria</Label>
                <Select
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="ferramentas">Ferramentas</option>
                  <option value="vale-compras">Vale-compras</option>
                  <option value="brindes">Brindes</option>
                  <option value="outros">Outros</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                  />
                  {' '}Prêmio ativo
                </Label>
              </FormGroup>

              <ButtonGroup>
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  <FiSave />
                  {editingPremio ? 'Atualizar' : 'Criar'}
                </Button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default AdminPremios;
