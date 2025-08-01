import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    FiUsers, FiUserPlus, FiEdit3, FiTrash2, FiShield,
    FiSave, FiX, FiCheck, FiLoader, FiEye,
    FiUserCheck, FiAlertCircle, FiSearch
} from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

// Animações
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
`;

// Container principal
const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 1rem;
  font-family: 'Montserrat', sans-serif;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

// Header
const Header = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const HeaderTitle = styled.h1`
  color: #2D3748;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: #cc1515;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ActionButton = styled.button`
  background: ${props => props.$variant === 'primary'
        ? 'linear-gradient(135deg, #cc1515 0%, #9b0c0c 100%)'
        : props.$variant === 'success'
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : 'white'
    };
  color: ${props => props.$variant === 'primary' || props.$variant === 'success' ? 'white' : '#4A5568'};
  border: ${props => props.$variant === 'primary' || props.$variant === 'success' ? 'none' : '2px solid #E2E8F0'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Filtros e busca
const FiltersContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #cc1515;
    box-shadow: 0 0 0 3px rgba(204, 21, 21, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #A0AEC0;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #cc1515;
  }
`;

// Tabela de usuários
const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f7fafc;
  
  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #4A5568;
    border-bottom: 1px solid #E2E8F0;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const TableBody = styled.tbody`
  tr {
    transition: all 0.2s ease;
    
    &:hover {
      background: #f8fafc;
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid #E2E8F0;
    }
  }
  
  td {
    padding: 1rem;
    color: #2D3748;
    vertical-align: middle;
  }
`;

const RoleBadge = styled.span`
  background: ${props => {
        switch (props.$role) {
            case 'admin': return 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
            case 'gerente': return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
            default: return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
        }
    }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatusBadge = styled.span`
  background: ${props => props.$active ? '#10B981' : '#EF4444'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: ${props => {
        switch (props.$variant) {
            case 'edit': return '#F59E0B';
            case 'delete': return '#EF4444';
            case 'view': return '#3B82F6';
            default: return '#6B7280';
        }
    }};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: scale(1.1);
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h2 {
    color: #2D3748;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const FormSection = styled.div`
  padding: 1.5rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background: #F9FAFB;
  margin-bottom: 1.5rem;
`;

const FormSectionTitle = styled.h3`
  color: #2D3748;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns || '1fr 1fr'};
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  color: #4A5568;
  font-weight: 600;
  font-size: 0.9rem;
`;

const FormInput = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$error ? '#EF4444' : '#E2E8F0'};
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#EF4444' : '#cc1515'};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(204, 21, 21, 0.1)'};
  }
  
  &:disabled {
    background: #f7fafc;
    color: #A0AEC0;
  }
`;

const FormSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$error ? '#EF4444' : '#E2E8F0'};
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#EF4444' : '#cc1515'};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(204, 21, 21, 0.1)'};
  }
`;

const ErrorMessage = styled.span`
  color: #EF4444;
  font-size: 0.875rem;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 400px) {
    flex-direction: column;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #4A5568;
`;

function AdminUsuarios({ user }) {
    const [usuarios, setUsuarios] = useState([]);
    const [lojas, setLojas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [filtroRole, setFiltroRole] = useState('todos');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [busca, setBusca] = useState('');
    const [salvando, setSalvando] = useState(false);

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        senha: '',
        role: 'cliente',
        loja_nome: '', // Campo opcional para identificar loja
        ativo: true
    });

    const [errors, setErrors] = useState({});

    // Carregar dados
    const carregarUsuarios = useCallback(async () => {
        try {
            setLoading(true);

            // Buscar apenas da tabela clientes_fast (simplificado)
            const { data: clientes, error: errorClientes } = await supabase
                .from('clientes_fast')
                .select('*')
                .order('created_at', { ascending: false });

            if (errorClientes) throw errorClientes;

            // Padronizar os dados para a interface
            const todosUsuarios = (clientes || []).map(c => ({
                ...c,
                source: 'clientes_fast',
                role: c.role || 'cliente',
                ativo: c.status === 'ativo',
                status: c.status || 'ativo',
                cpf: c.cpf_cnpj,
                loja_nome: c.loja_nome || 'N/A', // Usar o campo se existir, senão N/A
                telefone: c.telefone || '',
                email: c.email || ''
            }));

            setUsuarios(todosUsuarios);

        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    }, []);

    const carregarLojas = useCallback(async () => {
        // Simplificado - sem buscar lojas por enquanto
        setLojas([]);
    }, []);

    useEffect(() => {
        carregarUsuarios();
        carregarLojas();
    }, [carregarUsuarios, carregarLojas]);

    // Filtrar usuários
    const usuariosFiltrados = usuarios.filter(usuario => {
        // Filtro por role
        if (filtroRole !== 'todos' && usuario.role !== filtroRole) {
            return false;
        }

        // Filtro por status
        if (filtroStatus !== 'todos') {
            const isAtivo = usuario.ativo || usuario.status === 'ativo';
            if (filtroStatus === 'ativo' && !isAtivo) return false;
            if (filtroStatus === 'inativo' && isAtivo) return false;
        }

        // Filtro por busca
        if (busca.trim()) {
            const searchTerm = busca.toLowerCase();
            return (
                usuario.nome?.toLowerCase().includes(searchTerm) ||
                usuario.email?.toLowerCase().includes(searchTerm) ||
                usuario.cpf?.toLowerCase().includes(searchTerm)
            );
        }

        return true;
    });

    const abrirModal = (usuario = null) => {
        if (usuario) {
            setUsuarioEditando(usuario);
            setFormData({
                nome: usuario.nome || '',
                email: usuario.email || '',
                cpf: usuario.cpf || usuario.cpf_cnpj || '',
                telefone: usuario.telefone || '',
                senha: '', // Não mostrar senha existente
                role: usuario.role || 'cliente',
                loja_nome: usuario.loja_nome || '',
                ativo: usuario.ativo || usuario.status === 'ativo'
            });
        } else {
            setUsuarioEditando(null);
            setFormData({
                nome: '',
                email: '',
                cpf: '',
                telefone: '',
                senha: '',
                role: 'cliente',
                loja_nome: '',
                ativo: true
            });
        }
        setErrors({});
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setUsuarioEditando(null);
        setFormData({
            nome: '',
            email: '',
            cpf: '',
            telefone: '',
            senha: '',
            role: 'cliente',
            loja_nome: '',
            ativo: true
        });
        setErrors({});
    };

    const validarFormulario = () => {
        const newErrors = {};

        if (!formData.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!usuarioEditando && !formData.senha.trim()) {
            newErrors.senha = 'Senha é obrigatória';
        }

        if (formData.senha && formData.senha.length < 6) {
            newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
        }

        // Comentado temporariamente até a coluna ser criada
        // if (formData.role === 'gerente' && !formData.loja_nome.trim()) {
        //     newErrors.loja_nome = 'Gerentes devem ter uma loja identificada';
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const salvarUsuario = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setSalvando(true);

        try {
            const dadosUsuario = {
                nome: formData.nome.trim(),
                email: formData.email.trim(),
                role: formData.role,
                telefone: formData.telefone.trim() || null,
                ativo: formData.ativo,
                loja_nome: formData.loja_nome.trim() || 'N/A'
            };

            // Incluir senha apenas se fornecida
            if (formData.senha.trim()) {
                dadosUsuario.senha = formData.senha;
            }

            if (usuarioEditando) {
                // Atualizar usuário existente - sempre na clientes_fast
                const dadosCliente = {
                    nome: dadosUsuario.nome,
                    email: dadosUsuario.email,
                    telefone: dadosUsuario.telefone,
                    role: dadosUsuario.role,
                    status: dadosUsuario.ativo ? 'ativo' : 'inativo'
                };

                // Adicionar loja_nome apenas se o role for gerente
                if (dadosUsuario.role === 'gerente') {
                    dadosCliente.loja_nome = dadosUsuario.loja_nome;
                }

                if (dadosUsuario.senha) {
                    dadosCliente.senha = dadosUsuario.senha;
                }

                const { error } = await supabase
                    .from('clientes_fast')
                    .update(dadosCliente)
                    .eq('id', usuarioEditando.id);

                if (error) throw error;

                toast.success('Usuário atualizado com sucesso!');
            } else {
                // Criar novo usuário - sempre na clientes_fast
                const dadosCliente = {
                    nome: dadosUsuario.nome,
                    email: dadosUsuario.email,
                    telefone: dadosUsuario.telefone,
                    cpf_cnpj: formData.cpf.trim(),
                    tipo: 'CPF',
                    senha: dadosUsuario.senha,
                    role: dadosUsuario.role,
                    status: 'ativo',
                    saldo_pontos: 0
                };

                // Adicionar loja_nome apenas se o role for gerente
                if (dadosUsuario.role === 'gerente') {
                    dadosCliente.loja_nome = formData.loja_nome || 'N/A';
                }

                const { error } = await supabase
                    .from('clientes_fast')
                    .insert([dadosCliente]);

                if (error) throw error;

                toast.success('Usuário criado com sucesso!');
            }

            fecharModal();
            carregarUsuarios();

        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            console.error('Detalhes do erro:', error.message, error.details, error.hint);

            if (error.code === '23505') {
                toast.error('Email já está em uso');
                setErrors({ email: 'Email já está em uso' });
            } else if (error.code === '42703') {
                toast.error('Erro na estrutura da tabela. Execute o script de atualização.');
                console.error('Coluna não encontrada:', error.message);
            } else {
                toast.error(`Erro ao salvar usuário: ${error.message}`);
            }
        } finally {
            setSalvando(false);
        }
    };

    const excluirUsuario = async (usuario) => {
        if (!confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}"?`)) {
            return;
        }

        try {
            // Sempre excluir da tabela clientes_fast
            const { error } = await supabase
                .from('clientes_fast')
                .delete()
                .eq('id', usuario.id);

            if (error) throw error;

            toast.success('Usuário excluído com sucesso!');
            carregarUsuarios();

        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            toast.error('Erro ao excluir usuário');
        }
    };

    if (loading) {
        return (
            <Container>
                <LoadingContainer>
                    <FiLoader className="animate-spin" size={32} />
                    <p style={{ marginTop: '1rem' }}>Carregando usuários...</p>
                </LoadingContainer>
            </Container>
        );
    }

    return (
        <Container>
            <MainContent>
                <Header>
                    <HeaderContent>
                        <HeaderTitle>
                            <FiUsers />
                            Gerenciar Usuários
                        </HeaderTitle>
                        <HeaderActions>
                            <ActionButton onClick={() => abrirModal()} $variant="primary">
                                <FiUserPlus />
                                Novo Usuário
                            </ActionButton>
                        </HeaderActions>
                    </HeaderContent>
                </Header>

                <FiltersContainer>
                    <FiltersRow>
                        <SearchContainer>
                            <SearchIcon>
                                <FiSearch />
                            </SearchIcon>
                            <SearchInput
                                type="text"
                                placeholder="Buscar por nome, email ou CPF..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </SearchContainer>

                        <FilterSelect
                            value={filtroRole}
                            onChange={(e) => setFiltroRole(e.target.value)}
                        >
                            <option value="todos">Todas as Funções</option>
                            <option value="admin">Admin</option>
                            <option value="gerente">Gerente</option>
                            <option value="cliente">Cliente</option>
                        </FilterSelect>

                        <FilterSelect
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                        >
                            <option value="todos">Todos os Status</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </FilterSelect>
                    </FiltersRow>
                </FiltersContainer>

                <TableContainer>
                    <Table>
                        <TableHeader>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>CPF</th>
                                <th>Função</th>
                                <th>Loja</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {usuariosFiltrados.map((usuario) => (
                                <tr key={`${usuario.source}-${usuario.id}`}>
                                    <td>
                                        <strong>{usuario.nome}</strong>
                                        {usuario.telefone && (
                                            <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                                                {usuario.telefone}
                                            </div>
                                        )}
                                    </td>
                                    <td>{usuario.email}</td>
                                    <td>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                            {usuario.cpf || usuario.cpf_cnpj || 'Não informado'}
                                        </span>
                                    </td>
                                    <td>
                                        <RoleBadge $role={usuario.role}>
                                            {usuario.role === 'admin' ? 'Admin' :
                                                usuario.role === 'gerente' ? 'Gerente' : 'Cliente'}
                                        </RoleBadge>
                                    </td>
                                    <td>{usuario.loja_nome}</td>
                                    <td>
                                        <StatusBadge $active={usuario.ativo || usuario.status === 'ativo'}>
                                            {usuario.ativo || usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                        </StatusBadge>
                                    </td>
                                    <td>
                                        <ActionsCell>
                                            <IconButton
                                                $variant="edit"
                                                onClick={() => abrirModal(usuario)}
                                                title="Editar usuário"
                                            >
                                                <FiEdit3 size={14} />
                                            </IconButton>
                                            {user?.role === 'admin' && (
                                                <IconButton
                                                    $variant="delete"
                                                    onClick={() => excluirUsuario(usuario)}
                                                    title="Excluir usuário"
                                                >
                                                    <FiTrash2 size={14} />
                                                </IconButton>
                                            )}
                                        </ActionsCell>
                                    </td>
                                </tr>
                            ))}
                        </TableBody>
                    </Table>

                    {usuariosFiltrados.length === 0 && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>
                            <FiAlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>Nenhum usuário encontrado</h3>
                            <p>Ajuste os filtros ou adicione novos usuários.</p>
                        </div>
                    )}
                </TableContainer>

                {/* Modal de Edição */}
                {modalAberto && (
                    <ModalOverlay onClick={fecharModal}>
                        <ModalContent onClick={(e) => e.stopPropagation()}>
                            <ModalHeader>
                                <h2>
                                    {usuarioEditando ? <FiEdit3 /> : <FiUserPlus />}
                                    {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
                                </h2>
                                <IconButton onClick={fecharModal}>
                                    <FiX size={20} />
                                </IconButton>
                            </ModalHeader>

                            <ModalForm onSubmit={salvarUsuario}>
                                {/* Seção de Informações Pessoais */}
                                <FormSection>
                                    <FormSectionTitle>
                                        <FiUserCheck />
                                        Informações Pessoais
                                    </FormSectionTitle>

                                    <FormRow>
                                        <FormGroup>
                                            <FormLabel>Nome Completo *</FormLabel>
                                            <FormInput
                                                type="text"
                                                value={formData.nome}
                                                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                                $error={errors.nome}
                                                disabled={salvando}
                                                placeholder="Digite o nome completo"
                                            />
                                            {errors.nome && <ErrorMessage>{errors.nome}</ErrorMessage>}
                                        </FormGroup>

                                        <FormGroup>
                                            <FormLabel>CPF {!usuarioEditando && '*'}</FormLabel>
                                            <FormInput
                                                type="text"
                                                value={formData.cpf}
                                                onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                                                disabled={salvando || usuarioEditando}
                                                placeholder="000.000.000-00"
                                            />
                                            {usuarioEditando && (
                                                <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                                                    CPF não pode ser alterado
                                                </span>
                                            )}
                                        </FormGroup>
                                    </FormRow>

                                    <FormRow>
                                        <FormGroup>
                                            <FormLabel>Email *</FormLabel>
                                            <FormInput
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                $error={errors.email}
                                                disabled={salvando}
                                                placeholder="Digite o email"
                                            />
                                            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                                        </FormGroup>

                                        <FormGroup>
                                            <FormLabel>Telefone</FormLabel>
                                            <FormInput
                                                type="text"
                                                value={formData.telefone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                                                disabled={salvando}
                                                placeholder="(11) 99999-9999"
                                            />
                                        </FormGroup>
                                    </FormRow>
                                </FormSection>

                                {/* Seção de Acesso e Segurança */}
                                <FormSection>
                                    <FormSectionTitle>
                                        <FiShield />
                                        Acesso e Segurança
                                    </FormSectionTitle>

                                    <FormRow>
                                        <FormGroup>
                                            <FormLabel>Função *</FormLabel>
                                            <FormSelect
                                                value={formData.role}
                                                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                                disabled={salvando}
                                            >
                                                <option value="cliente">Cliente</option>
                                                <option value="gerente">Gerente</option>
                                                <option value="admin">Administrador</option>
                                            </FormSelect>
                                        </FormGroup>

                                        <FormGroup>
                                            <FormLabel>
                                                {usuarioEditando ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
                                            </FormLabel>
                                            <FormInput
                                                type="password"
                                                value={formData.senha}
                                                onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                                                $error={errors.senha}
                                                disabled={salvando}
                                                placeholder={usuarioEditando ? 'Deixe vazio para manter' : 'Digite a senha'}
                                            />
                                            {errors.senha && <ErrorMessage>{errors.senha}</ErrorMessage>}
                                        </FormGroup>
                                    </FormRow>

                                    <FormRow $columns="1fr">
                                        <FormGroup>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.ativo}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                                                    disabled={salvando}
                                                />
                                                <span>Usuário ativo</span>
                                            </label>
                                        </FormGroup>
                                    </FormRow>
                                </FormSection>

                                {/* Seção de Loja (apenas para gerentes) */}
                                {formData.role === 'gerente' && (
                                    <FormSection>
                                        <FormSectionTitle>
                                            <FiCheck />
                                            Informações da Loja
                                        </FormSectionTitle>

                                        <FormRow $columns="1fr">
                                            <FormGroup>
                                                <FormLabel>Loja/Local de Trabalho</FormLabel>
                                                <FormInput
                                                    type="text"
                                                    value={formData.loja_nome}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, loja_nome: e.target.value }))}
                                                    $error={errors.loja_nome}
                                                    disabled={salvando}
                                                    placeholder="Ex: Loja Centro, Filial Norte, etc."
                                                />
                                                {errors.loja_nome && <ErrorMessage>{errors.loja_nome}</ErrorMessage>}
                                                <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                                                    Identifique a loja ou local onde este gerente trabalha
                                                </span>
                                            </FormGroup>
                                        </FormRow>
                                    </FormSection>
                                )}

                                <ModalActions>
                                    <ActionButton type="button" onClick={fecharModal} disabled={salvando}>
                                        <FiX />
                                        Cancelar
                                    </ActionButton>
                                    <ActionButton type="submit" $variant="success" disabled={salvando}>
                                        {salvando ? (
                                            <>
                                                <FiLoader className="animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <FiSave />
                                                {usuarioEditando ? 'Atualizar' : 'Criar Usuário'}
                                            </>
                                        )}
                                    </ActionButton>
                                </ModalActions>
                            </ModalForm>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </MainContent>
        </Container>
    );
}

export default AdminUsuarios;
