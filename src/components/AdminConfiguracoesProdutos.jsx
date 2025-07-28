import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FiSettings, FiPlus, FiEdit3, FiTrash2, FiSave, FiX, FiPackage, FiDollarSign, FiTrendingUp, FiRotateCcw } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

// Animações
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const Container = styled.div`
  animation: ${fadeInUp} 0.6s ease-out;
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

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${props => props.theme.colors.gray200};
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 1rem 2rem;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.gray600};
  font-weight: ${props => props.$active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const Section = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.lg};
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const RegraCard = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.md};
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.colors.gray200};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const RegraHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
  
  h4 {
    margin: 0;
    color: ${props => props.theme.colors.text};
    flex: 1;
  }
`;

const RegraInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span:first-child {
    color: ${props => props.theme.colors.gray600};
    font-size: 0.9rem;
  }
  
  span:last-child {
    color: ${props => props.theme.colors.text};
    font-weight: 600;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.variant === 'primary' && css`
    background: ${props.theme.colors.gradientPrimary};
    color: white;
    &:hover { transform: translateY(-2px); }
  `}
  
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
`;

const AddButton = styled(Button)`
  margin-bottom: 2rem;
`;

const Modal = styled.div`
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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.lg};
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h3 {
    margin: 0;
    color: ${props => props.theme.colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
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

const Select = styled.select`
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

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

function AdminConfiguracoesProdutos() {
    const [activeTab, setActiveTab] = useState('pontuacao');
    const [regrasPontuacao, setRegrasPontuacao] = useState([]);
    const [regrasGerais, setRegrasGerais] = useState({});
    const [promocoes, setPromocoes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        codigo: '',
        nome: '',
        categoria: '',
        pontos_por_real: 1,
        minimo_pontos: 1,
        ativo: true
    });

    // Função para limpar cache e forçar atualização
    const clearCacheAndReload = () => {
        // Limpar cache de produtos
        if (window.produtosCache) {
            delete window.produtosCache;
            delete window.cacheTimestamp;
        }
        loadConfiguracoes();
    };

    // Função para resetar regras ao padrão inicial
    const handleResetDefaults = async () => {
        if (!window.confirm('Tem certeza que deseja zerar e recriar regras padrão?')) return;
        try {
            setLoading(true);
            // Apagar todas as regras atuais
            await supabase.from('produtos_elegiveis').delete().neq('id', 0);
            // Inserir regras padrão conforme upload de notas
            const defaults = [
                { codigo: 'GR00001', nome: 'Placa Glasroc X', categoria: 'placas', pontos_por_real: 2, minimo_pontos: 1, ativo: true },
                { codigo: 'MT00001', nome: 'Malha telada para Glasroc X', categoria: 'acessorios', pontos_por_real: 2, minimo_pontos: 1, ativo: true },
                { codigo: 'BC00001', nome: 'Basecoat (massa para Glasroc X)', categoria: 'acessorios', pontos_por_real: 2, minimo_pontos: 1, ativo: true },
                { codigo: 'DW00007', nome: 'Placa RU', categoria: 'placas', pontos_por_real: 1, minimo_pontos: 1, ativo: true },
                { codigo: 'PM00001', nome: 'Placomix', categoria: 'acessorios', pontos_por_real: 1, minimo_pontos: 1, ativo: true },
                { codigo: 'DW00057', nome: 'Placa ST', categoria: 'placas', pontos_por_real: 0.5, minimo_pontos: 1, ativo: true }
            ];
            const { data: inserted, error } = await supabase.from('produtos_elegiveis').insert(defaults).select();
            if (error) throw error;
            toast.success('Regras padrão restauradas!');
            clearCacheAndReload();
        } catch (err) {
            console.error('Erro ao resetar regras padrão:', err);
            toast.error('Não foi possível resetar regras');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfiguracoes();
    }, []);

    const loadConfiguracoes = async () => {
        try {
            setLoading(true);

            // Carregar produtos elegíveis (substitui regras_pontuacao)
            const { data: pontosData, error: pontosError } = await supabase
                .from('produtos_elegiveis')
                .select('*')
                .order('nome');

            if (pontosError) throw pontosError;

            // Carregar configurações gerais
            const { data: geraisData, error: geraisError } = await supabase
                .from('configuracoes_sistema')
                .select('*');

            if (geraisError) throw geraisError;

            // Carregar promoções ativas
            const { data: promocoesData, error: promocoesError } = await supabase
                .from('promocoes')
                .select('*')
                .order('data_inicio', { ascending: false });

            if (promocoesError) throw promocoesError;

            setRegrasPontuacao(pontosData || []);

            // Converter array de configs em objeto
            const configsObj = {};
            geraisData?.forEach(config => {
                configsObj[config.chave] = config.valor;
            });
            setRegrasGerais(configsObj);

            setPromocoes(promocoesData || []);

        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPontuacao = async (e) => {
        e.preventDefault();

        try {
            if (editingItem) {
                const { error } = await supabase
                    .from('produtos_elegiveis')
                    .update(formData)
                    .eq('id', editingItem.id);

                if (error) throw error;
                toast.success('Produto atualizado!');
            } else {
                const { error } = await supabase
                    .from('produtos_elegiveis')
                    .insert([formData]);

                if (error) throw error;
                toast.success('Produto criado!');
            }

            handleCloseModal();
            clearCacheAndReload();
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            toast.error('Erro ao salvar produto elegível');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;

        try {
            const { error } = await supabase
                .from('produtos_elegiveis')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Produto excluído com sucesso!');
            clearCacheAndReload();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            toast.error('Erro ao excluir produto');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            codigo: item.codigo || '',
            nome: item.nome || '',
            categoria: item.categoria || '',
            pontos_por_real: item.pontos_por_real || 1,
            minimo_pontos: item.minimo_pontos || 1,
            ativo: item.ativo ?? true
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            codigo: '',
            nome: '',
            categoria: '',
            pontos_por_real: 1,
            minimo_pontos: 1,
            ativo: true
        });
    };

    const renderRegrasPontuacao = () => (
        <Section>
            <SectionTitle>
                <FiTrendingUp />
                Regras de Pontuação por Produto
            </SectionTitle>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <AddButton variant="primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> Nova Regra de Pontuação
                </AddButton>
                <Button variant="delete" onClick={handleResetDefaults}>
                    <FiRotateCcw /> Zerar Lista
                </Button>
            </div>

            <Grid>
                {regrasPontuacao.map(regra => (
                    <RegraCard key={regra.id}>
                        <RegraHeader>
                            <h4>{regra.codigo} - {regra.nome}</h4>
                            <Actions>
                                <Button variant="edit" onClick={() => handleEdit(regra)}>
                                    <FiEdit3 />
                                </Button>
                                <Button variant="delete" onClick={() => handleDelete(regra.id)}>
                                    <FiTrash2 />
                                </Button>
                            </Actions>
                        </RegraHeader>

                        <RegraInfo>
                            <InfoItem>
                                <span>Código:</span>
                                <span>{regra.codigo}</span>
                            </InfoItem>
                            <InfoItem>
                                <span>Categoria:</span>
                                <span>{regra.categoria}</span>
                            </InfoItem>
                            <InfoItem>
                                <span>Pontos por R$:</span>
                                <span>{regra.pontos_por_real}</span>
                            </InfoItem>
                            <InfoItem>
                                <span>Pontuação Mínima:</span>
                                <span>{regra.minimo_pontos}</span>
                            </InfoItem>
                            <InfoItem>
                                <span>Status:</span>
                                <span style={{ color: regra.ativo ? '#28a745' : '#dc3545' }}>
                                    {regra.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </InfoItem>
                        </RegraInfo>
                    </RegraCard>
                ))}
            </Grid>
        </Section>
    );

    if (loading) {
        return <Container>Carregando configurações...</Container>;
    }

    return (
        <Container>
            <Header>
                <h2>
                    <FiSettings />
                    Configurações do Sistema
                </h2>
            </Header>

            <TabsContainer>
                <Tab
                    $active={activeTab === 'pontuacao'}
                    onClick={() => setActiveTab('pontuacao')}
                >
                    Regras de Pontuação
                </Tab>
                <Tab
                    $active={activeTab === 'promocoes'}
                    onClick={() => setActiveTab('promocoes')}
                >
                    Promoções
                </Tab>
                <Tab
                    $active={activeTab === 'gerais'}
                    onClick={() => setActiveTab('gerais')}
                >
                    Configurações Gerais
                </Tab>
            </TabsContainer>

            {activeTab === 'pontuacao' && renderRegrasPontuacao()}

            {showModal && (
                <Modal onClick={handleCloseModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h3>
                                {editingItem ? 'Editar' : 'Nova'} Regra de Pontuação
                            </h3>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                <FiX />
                            </Button>
                        </ModalHeader>

                        <Form onSubmit={handleSubmitPontuacao}>
                            <FormGroup>
                                <Label>Código do Produto</Label>
                                <Input
                                    type="text"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                                    placeholder="Ex: DW00057"
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Nome do Produto</Label>
                                <Input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                    placeholder="Ex: Placa ST"
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
                                    <option value="placas">Placas</option>
                                    <option value="acessorios">Acessórios</option>
                                    <option value="servicos">Serviços</option>
                                    <option value="outros">Outros</option>
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label>Pontos por R$ 1,00</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={formData.pontos_por_real}
                                    onChange={(e) => setFormData(prev => ({ ...prev, pontos_por_real: parseFloat(e.target.value) || 0 }))}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Pontuação Mínima</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.minimo_pontos}
                                    onChange={(e) => setFormData(prev => ({ ...prev, minimo_pontos: parseInt(e.target.value) || 1 }))}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>
                                    <input
                                        type="checkbox"
                                        checked={formData.ativo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                                    />
                                    {' '}Regra ativa
                                </Label>
                            </FormGroup>

                            <FormActions>
                                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary">
                                    <FiSave />
                                    {editingItem ? 'Atualizar' : 'Criar'}
                                </Button>
                            </FormActions>
                        </Form>
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
}

export default AdminConfiguracoesProdutos;
