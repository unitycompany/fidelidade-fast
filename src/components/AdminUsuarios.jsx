import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    FiUsers, FiUserPlus, FiEdit3, FiTrash2, FiShield,
    FiSave, FiX, FiCheck, FiLoader, FiEye,
    FiUserCheck, FiAlertCircle, FiSearch, FiGift, FiFile,
    FiSlash, FiUnlock
} from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import LoadingGif from './LoadingGif';
import imagemNotaFiscalService from '../services/imagemNotaFiscalService';

// Função para formatação de números no padrão brasileiro
const formatarPontos = (valor) => {
    if (!valor || valor === 0) return '0';
    return Number(valor).toLocaleString('pt-BR');
};

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
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    animation: ${fadeInUp} 0.6s ease-out;
`;

const HeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
`;

const HeaderTitle = styled.h1`
    color: #2D3748;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  
    svg { color: #cc1515; }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
`;

const ActionButton = styled.button`
    background: ${props => {
        switch (props.$variant) {
            case 'primary':
                return 'linear-gradient(135deg, #cc1515 0%, #9b0c0c 100%)';
            case 'success':
                return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
            default:
                return 'white';
        }
    }};
    color: ${props => props.$variant ? 'white' : '#4A5568'};
    border: ${props => props.$variant ? 'none' : '2px solid #E2E8F0'};
    border-radius: 0;
    padding: 0.75rem 1rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover { transform: translateY(-2px); opacity: 0.95; }
    &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

// Filters
const FiltersContainer = styled.div`
    background: white;
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid #E2E8F0;
`;

const FiltersRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
`;

const SearchContainer = styled.div`
    position: relative;
    flex: 1;
    min-width: 260px;
`;

const SearchIcon = styled.div`
    position: absolute;
    top: 50%;
    left: 0.75rem;
    transform: translateY(-50%);
    color: #A0AEC0;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.25rem;
    border: 1px solid #E2E8F0;
    border-radius: 0;
    font-size: 1rem;
  
    &:focus { outline: none; border-color: #cc1515; }
`;

const FilterSelect = styled.select`
    padding: 0.75rem 1rem;
    border: 1px solid #E2E8F0;
    border-radius: 0;
    background: white;
    font-size: 1rem;
    min-width: 180px;

    &:focus { outline: none; border-color: #cc1515; }
`;

// Table
const TableContainer = styled.div`
    background: white;
    overflow: hidden;
    border: 1px solid #E2E8F0;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHeader = styled.thead`
    background: #F7FAFC;

    th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: #4A5568;
        border-bottom: 1px solid #E2E8F0;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
    }
`;

const TableBody = styled.tbody`
    tr { transition: background 0.2s ease; }
    tr:hover { background: #F8FAFC; }
    tr:not(:last-child) { border-bottom: 1px solid #E2E8F0; }

    td {
        padding: 1rem;
        color: #2D3748;
        vertical-align: middle;
    }

    td strong { font-weight: 600; }
`;

const RoleBadge = styled.span`
  background: ${props => {
        switch (props.$role) {
            case 'admin': return 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
            case 'dev': return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
            case 'gerente': return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
            default: return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
        }
    }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const StatusBadge = styled.span`
    background: ${props => props.$status === 'ativo' ? '#10B981' : props.$status === 'bloqueado' ? '#6B7280' : '#EF4444'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const StatusChip = styled.span`
    display: inline-block;
    margin-left: 0.5rem;
    padding: 0.15rem 0.4rem;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: .02em;
    color: white;
    background: ${props => props.$variant === 'blocked' ? '#6B7280' : '#10B981'};
`;

const IconButton = styled.button`
  background: ${props => {
        switch (props.$variant) {
            case 'edit': return '#F59E0B';
            case 'delete': return '#EF4444';
            case 'view': return '#3B82F6';
            case 'ban': return '#6B7280';
            default: return '#6B7280';
        }
    }};
  color: white;
  border: none;
  border-radius: 0;
  padding: 0.5rem;
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

// Modal de Detalhes Fullscreen
const FullscreenModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8fafc;
  z-index: 1000;
  overflow-y: auto;
`;

const FullscreenModalContent = styled.div`
  min-height: 100vh;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FullscreenModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  
  h2 {
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
  }
`;

const CloseButton = styled.button`
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 0;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #DC2626;
    transform: translateY(-2px);
  }
`;

// Resumo do Cliente Otimizado
const ClientSummaryCard = styled.div`
  background: white;
  padding: 2rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
`;

const ClientAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 0;
  background: linear-gradient(135deg, #cc1515 0%, #9b0c0c 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
`;

const ClientInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ClientName = styled.h3`
  color: #1d1d1b;
  font-size: 1.8rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 1px;
`;

const ClientDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  line-height: 1.0;
  gap: 1rem;
  color: #4A5568;
  font-size: 0.9rem;
  
  span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const ClientStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0;
  
  .value {
    font-size: 1.5rem;
    font-weight: 300;
    color: ${props => {
        switch (props.$type) {
            case 'points': return '#10B981';
            case 'spent': return '#EF4444';
            case 'balance': return '#3B82F6';
            default: return '#4A5568';
        }
    }};
  }
  
  .label {
    font-size: 0.8rem;
    color: #718096;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-top: 0.25rem;
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
  border: 1px solid ${props => props.$error ? '#EF4444' : '#E2E8F0'};
  border-radius: 0;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#EF4444' : '#cc1515'};
  }
  
  &:disabled {
    background: #f7fafc;
    color: #A0AEC0;
  }
`;

const FormSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.$error ? '#EF4444' : '#E2E8F0'};
  border-radius: 0;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#EF4444' : '#cc1515'};
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
    const [viewerRole, setViewerRole] = useState(user?.role || 'cliente');
    const [syncingPerms, setSyncingPerms] = useState(false);
    const [lojas, setLojas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [filtroRole, setFiltroRole] = useState('todos');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [busca, setBusca] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [modalDetalhes, setModalDetalhes] = useState(false);
    const [usuarioDetalhes, setUsuarioDetalhes] = useState(null);
    const [historicoUsuario, setHistoricoUsuario] = useState([]);
    const [pedidosUsuario, setPedidosUsuario] = useState([]);
    const [loadingDetalhes, setLoadingDetalhes] = useState(false);
    const [imagensUsuario, setImagensUsuario] = useState([]);
    const [modalImagem, setModalImagem] = useState(false);
    const [imagemSelecionada, setImagemSelecionada] = useState(null);
    const [premiosResgatados, setPremiosResgatados] = useState([]);
    const [modalPremio, setModalPremio] = useState(false);
    const [premioSelecionado, setPremioSelecionado] = useState(null);

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        senha: '',
        role: 'cliente',
        loja_nome: '', // Campo opcional para identificar loja
        ativo: true,
        saldo_pontos: 0
    });

    const [errors, setErrors] = useState({});

    // Carregar dados
    const carregarUsuarios = useCallback(async () => {
        try {
            setLoading(true);

            // Buscar apenas da tabela clientes_fast (simplificado)
            const { data: clientes, error: errorClientes } = await supabase
                .from('clientes_fast')
                .select(`
                    *,
                    total_pontos_ganhos,
                    total_pontos_gastos,
                    saldo_pontos
                `)
                .order('created_at', { ascending: false });

            if (errorClientes) throw errorClientes;

            // Buscar quantidade de imagens por cliente
            const { data: imagensCount, error: errorImagens } = await supabase
                .from('imagens_notas_fiscais')
                .select('cliente_id');

            // Contar imagens por cliente
            const imagensPorCliente = {};
            if (imagensCount && !errorImagens) {
                imagensCount.forEach(img => {
                    imagensPorCliente[img.cliente_id] = (imagensPorCliente[img.cliente_id] || 0) + 1;
                });
            }

            // Padronizar os dados para a interface
            const todosUsuarios = (clientes || []).map(c => ({
                ...c,
                source: 'clientes_fast',
                role: c.role || 'cliente',
                ativo: c.status === 'ativo',
                status: c.status || 'ativo',
                cpf: c.cpf_cnpj,
                loja_nome: c.loja_nome || 'N/A',
                telefone: c.telefone || '',
                email: c.email || '',
                saldo_pontos: c.saldo_pontos || 0,
                total_pontos_ganhos: c.total_pontos_ganhos || 0,
                total_pontos_gastos: c.total_pontos_gastos || 0,
                total_imagens: imagensPorCliente[c.id] || 0
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

    // Função para carregar detalhes completos do usuário
    const carregarDetalhesUsuario = async (usuario) => {
        try {
            setLoadingDetalhes(true);
            setUsuarioDetalhes(usuario);
            setModalDetalhes(true);

            // Buscar histórico de pontos
            const { data: historico, error: errorHistorico } = await supabase
                .from('historico_pontos')
                .select(`
                    *,
                    pedidos_vendas (
                        numero_pedido,
                        data_emissao,
                        valor_total_pedido
                    )
                `)
                .eq('cliente_id', usuario.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (errorHistorico) {
                console.error('Erro ao buscar histórico:', errorHistorico);
                setHistoricoUsuario([]);
            } else {
                setHistoricoUsuario(historico || []);
            }

            // Buscar pedidos/notas do usuário
            const { data: pedidos, error: errorPedidos } = await supabase
                .from('pedidos_vendas')
                .select(`
                    *,
                    fornecedores_fast (
                        nome,
                        razao_social
                    )
                `)
                .eq('cliente_id', usuario.id)
                .order('data_emissao', { ascending: false })
                .limit(20);

            if (errorPedidos) {
                console.error('Erro ao buscar pedidos:', errorPedidos);
                setPedidosUsuario([]);
            } else {
                setPedidosUsuario(pedidos || []);
            }

            // Buscar prêmios resgatados diretamente da tabela resgates
            const { data: premios, error: errorPremios } = await supabase
                .from('resgates')
                .select(`
                    id,
                    cliente_id,
                    premio_id,
                    pontos_utilizados,
                    codigo_resgate,
                    coletado,
                    data_coleta,
                    gerente_retirada,
                    observacoes_admin,
                    created_at,
                    premios_catalogo (
                        id,
                        nome,
                        descricao,
                        pontos_necessarios,
                        categoria,
                        imagem_url,
                        ativo
                    ),
                    clientes_fast!cliente_id (
                        loja_nome
                    )
                `)
                .eq('cliente_id', usuario.id)
                .order('created_at', { ascending: false });

            if (errorPremios) {
                console.error('Erro ao buscar prêmios:', errorPremios);
                setPremiosResgatados([]);
            } else {
                // Processar os dados dos resgates
                const premiosProcessados = (premios || []).map(resgate => ({
                    id: resgate.id,
                    cliente_id: resgate.cliente_id,
                    premio_id: resgate.premio_id,
                    pontos_utilizados: resgate.pontos_utilizados || 0,
                    pontos: -Math.abs(resgate.pontos_utilizados || 0), // Negativo pois é gasto
                    codigo_resgate: resgate.codigo_resgate,
                    coletado: resgate.coletado,
                    data_coleta: resgate.data_coleta,
                    gerente_retirada: resgate.gerente_retirada,
                    observacoes_admin: resgate.observacoes_admin,
                    created_at: resgate.created_at,
                    // Dados da loja
                    loja_nome: resgate.clientes_fast?.loja_nome || 'N/A',
                    // Status baseado no campo coletado
                    status: resgate.coletado ? 'entregue' : 'pendente',
                    status_resgate: resgate.coletado ? 'Entregue' : 'Aguardando Retirada',
                    // Dados do prêmio do catálogo
                    premios_catalogo: resgate.premios_catalogo,
                    premio_detalhes: resgate.premios_catalogo || {
                        nome: 'Prêmio não encontrado',
                        descricao: 'Prêmio removido do catálogo',
                        pontos_necessarios: resgate.pontos_utilizados || 0,
                        categoria: 'N/A',
                        imagem_url: null,
                        ativo: false
                    },
                    // Para compatibilidade com o modal
                    descricao: resgate.premios_catalogo?.nome || 'Prêmio não encontrado'
                }));

                setPremiosResgatados(premiosProcessados);
            }

            // Buscar imagens das notas fiscais do usuário
            const resultadoImagens = await imagemNotaFiscalService.listarImagensCliente(usuario.id, 100);
            if (resultadoImagens.success) {
                setImagensUsuario(resultadoImagens.data);
            } else {
                console.error('Erro ao buscar imagens:', resultadoImagens.error);
                setImagensUsuario([]);
            }

        } catch (error) {
            console.error('Erro ao carregar detalhes do usuário:', error);
            toast.error('Erro ao carregar detalhes do usuário');
        } finally {
            setLoadingDetalhes(false);
        }
    };

    // Função para visualizar imagem
    const visualizarImagem = (imagem) => {
        setImagemSelecionada(imagem);
        setModalImagem(true);
    };

    // Função para visualizar prêmio resgatado
    const visualizarPremio = (premio) => {
        setPremioSelecionado(premio);
        setModalPremio(true);
    };

    // Sincronizar role do visualizador com o BD (caso tenha sido alterado fora da sessão)
    const syncViewerRole = useCallback(async () => {
        if (!user?.id) return;
        try {
            setSyncingPerms(true);
            const { data, error } = await supabase
                .from('clientes_fast')
                .select('role')
                .eq('id', user.id)
                .single();
            if (error) throw error;
            const dbRole = data?.role || 'cliente';
            setViewerRole(dbRole);
            if (dbRole !== user.role && typeof window.updateUserContext === 'function') {
                window.updateUserContext({ role: dbRole });
                toast.success(`Permissões atualizadas: ${dbRole}`);
            }
        } catch (e) {
            console.warn('Não foi possível sincronizar permissões do usuário atual:', e?.message || e);
        } finally {
            setSyncingPerms(false);
        }
    }, [user?.id, user?.role]);

    useEffect(() => {
        carregarUsuarios();
        carregarLojas();
        syncViewerRole();
    }, [carregarUsuarios, carregarLojas, syncViewerRole]);

    // Filtrar usuários
    const usuariosFiltrados = usuarios.filter(usuario => {
        // Filtro por role
        if (filtroRole !== 'todos' && usuario.role !== filtroRole) {
            return false;
        }

        // Filtro por status (inclui 'bloqueado')
        if (filtroStatus !== 'todos') {
            const status = usuario.status || (usuario.ativo ? 'ativo' : 'inativo');
            if (status !== filtroStatus) return false;
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

        const toggleBanUsuario = async (usuario) => {
            const vaiBanir = usuario.status !== 'bloqueado';
            const confirmMsg = vaiBanir
                ? `Tem certeza que deseja banir o usuário "${usuario.nome}"? Ele ficará bloqueado para login.`
                : `Deseja desbanir o usuário "${usuario.nome}" e reativar o acesso?`;
            if (!window.confirm(confirmMsg)) return;
            try {
                const novoStatus = usuario.status === 'bloqueado' ? 'ativo' : 'bloqueado';
                const { error } = await supabase
                    .from('clientes_fast')
                    .update({ status: novoStatus })
                    .eq('id', usuario.id);
                if (error) throw error;
                toast.success(novoStatus === 'bloqueado' ? 'Usuário banido com sucesso.' : 'Usuário desbanido com sucesso.');
                await carregarUsuarios();
            } catch (e) {
                console.error('Erro ao alterar status do usuário:', e);
                toast.error('Não foi possível alterar o status.');
            }
        };

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
                ativo: usuario.ativo || usuario.status === 'ativo',
                saldo_pontos: usuario.saldo_pontos || 0
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
                ativo: true,
                saldo_pontos: 0
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
            ativo: true,
            saldo_pontos: 0
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
                role: user?.role === 'dev' ? formData.role : (usuarioEditando?.role || 'cliente'),
                telefone: formData.telefone.trim() || null,
                ativo: formData.ativo,
                loja_nome: formData.loja_nome.trim() || 'N/A',
                saldo_pontos: user?.role === 'dev' ? (parseInt(formData.saldo_pontos) || 0) : (usuarioEditando?.saldo_pontos || 0)
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
                    status: (usuarioEditando?.status === 'bloqueado') ? 'bloqueado' : (dadosUsuario.ativo ? 'ativo' : 'inativo'),
                    saldo_pontos: dadosUsuario.saldo_pontos
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
            // Verificar se existem dados relacionados para informar o usuário
            const { data: historico, error: errorHistorico } = await supabase
                .from('historico_pontos')
                .select('id')
                .eq('cliente_id', usuario.id)
                .limit(1);

            const { data: pedidos, error: errorPedidos } = await supabase
                .from('pedidos_vendas')
                .select('id')
                .eq('cliente_id', usuario.id)
                .limit(1);

            const { data: imagens, error: errorImagens } = await supabase
                .from('imagens_notas_fiscais')
                .select('id')
                .eq('cliente_id', usuario.id)
                .limit(1);

            // Avisar se existem dados relacionados (apenas informativo)
            const temDadosRelacionados = (historico?.length > 0) || (pedidos?.length > 0) || (imagens?.length > 0);

            if (temDadosRelacionados) {
                const confirmarExclusao = confirm(
                    `ATENÇÃO: Este usuário possui dados relacionados (histórico, pedidos e/ou imagens). ` +
                    `A exclusão irá remover TODOS os dados relacionados automaticamente. ` +
                    `Esta ação não pode ser desfeita. Deseja continuar?`
                );

                if (!confirmarExclusao) {
                    return;
                }
            }

            // Excluir o usuário - as foreign keys CASCADE cuidarão dos dados relacionados
            const { error } = await supabase
                .from('clientes_fast')
                .delete()
                .eq('id', usuario.id);

            if (error) {
                throw error;
            }

            toast.success('Usuário e todos os dados relacionados foram excluídos com sucesso!');
            carregarUsuarios();

        } catch (error) {
            console.error('Erro ao excluir usuário:', error);

            // Tratamento de erro mais detalhado
            let errorMessage = 'Erro desconhecido ao excluir usuário';

            if (error?.code) {
                // Erros específicos do PostgreSQL
                switch (error.code) {
                    case '23503':
                        errorMessage = `❌ FOREIGN KEY CONSTRAINT: Este usuário possui dados relacionados que impedem a exclusão.\n\n` +
                            `🔧 SOLUÇÃO: Execute este comando no SQL Editor do Supabase:\n\n` +
                            `ALTER TABLE pedidos_vendas DROP CONSTRAINT IF EXISTS pedidos_vendas_cliente_id_fkey;\n` +
                            `ALTER TABLE pedidos_vendas ADD CONSTRAINT pedidos_vendas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;\n\n` +
                            `ALTER TABLE historico_pontos DROP CONSTRAINT IF EXISTS historico_pontos_cliente_id_fkey;\n` +
                            `ALTER TABLE historico_pontos ADD CONSTRAINT historico_pontos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;\n\n` +
                            `📋 Ou use o arquivo: sql/29_fix_foreign_keys_SIMPLES.sql`;
                        break;
                    case '23505':
                        errorMessage = 'Este email já está em uso por outro usuário.';
                        break;
                    case '42501':
                        errorMessage = 'Permissão negada. Verifique se você tem permissão para excluir usuários.';
                        break;
                    default:
                        errorMessage = `Erro do banco de dados (${error.code}): ${error.message}`;
                }
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.error_description) {
                errorMessage = error.error_description;
            } else if (error?.details) {
                errorMessage = error.details;
            }

            // Mensagens adicionais para problemas comuns (texto)
            const errorText = errorMessage.toLowerCase();
            if (errorText.includes('foreign key constraint') || errorText.includes('still referenced')) {
                errorMessage = `❌ PROBLEMA: Usuário possui dados relacionados.\n\n` +
                    `🔧 EXECUTE este comando no Supabase SQL Editor:\n\n` +
                    `ALTER TABLE pedidos_vendas ADD CONSTRAINT pedidos_vendas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;\n` +
                    `ALTER TABLE historico_pontos ADD CONSTRAINT historico_pontos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;`;
            } else if (errorText.includes('permission denied')) {
                errorMessage = 'Permissão negada. Verifique suas permissões de administrador.';
            } else if (errorText.includes('row-level security')) {
                errorMessage = 'Erro de segurança RLS. Verifique as políticas de segurança do banco de dados.';
            }

            toast.error(`Erro ao excluir usuário: ${errorMessage}`, {
                duration: 8000, // Mais tempo para ler a mensagem
                style: {
                    maxWidth: '600px',
                    fontSize: '14px'
                }
            });
        }
    };

    if (loading) {
        return (
            <Container>
                <LoadingGif
                    text="Carregando usuários..."
                    size="120px"
                    mobileSize="100px"
                />
            </Container>
        );
    }

    return (
        <Container>
            <MainContent>
                <Header>
                    <HeaderContent>
                        <HeaderTitle>
                            Gerenciar Usuários
                        </HeaderTitle>
                        <HeaderActions>
                            <ActionButton onClick={syncViewerRole} disabled={syncingPerms} title="Atualizar permissões">
                                {syncingPerms ? <FiLoader className="animate-spin" /> : <FiShield />}
                                {syncingPerms ? 'Verificando...' : `Permissões: ${viewerRole}`}
                            </ActionButton>
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
                            <option value="dev">Dev</option>
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
                            <option value="bloqueado">Bloqueado</option>
                        </FilterSelect>
                    </FiltersRow>
                </FiltersContainer>

                <TableContainer>
                    <Table>
                        <TableHeader>
                            <tr>
                                <th>Nome</th>
                                <th>Função</th>
                                <th>Pontos</th>
                                <th>Loja</th>
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
                                    <td>
                                        <RoleBadge $role={usuario.role}>
                                            {usuario.role === 'admin' ? 'Admin' :
                                                usuario.role === 'dev' ? 'Dev' :
                                                usuario.role === 'gerente' ? 'Gerente' : 'Cliente'}
                                        </RoleBadge>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500', color: '#1d1d1b' }}>
                                            {formatarPontos(usuario.saldo_pontos)} pts
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                                            TP: {formatarPontos(usuario.total_pontos_ganhos)}
                                        </div>
                                    </td>
                                    <td>{usuario.loja_nome}</td>
                                    <td>
                                        <ActionsCell>
                                            <IconButton
                                                $variant="view"
                                                onClick={() => carregarDetalhesUsuario(usuario)}
                                                title="Ver detalhes"
                                            >
                                                <FiEye size={14} />
                                            </IconButton>
                                            <IconButton
                                                $variant="edit"
                                                onClick={() => abrirModal(usuario)}
                                                title="Editar usuário"
                                            >
                                                <FiEdit3 size={14} />
                                            </IconButton>
                                                {(user?.role === 'admin' || user?.role === 'dev') && (
                                                    <IconButton
                                                        $variant="ban"
                                                        onClick={() => toggleBanUsuario(usuario)}
                                                        title={usuario.status === 'bloqueado' ? 'Desbanir usuário' : 'Banir usuário'}
                                                    >
                                                        {usuario.status === 'bloqueado' ? <FiUnlock size={14} /> : <FiSlash size={14} />}
                                                    </IconButton>
                                                )}
                                            {/* Excluir apenas para dev; admin não pode */}
                                            {user?.role === 'dev' && (
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
                                                disabled={salvando || (user?.role !== 'dev')}
                                            >
                                                <option value="cliente">Cliente</option>
                                                <option value="gerente">Gerente</option>
                                                <option value="admin">Administrador</option>
                                                <option value="dev">Desenvolvedor</option>
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

                                    <FormRow>
                                        <FormGroup>
                                            <FormLabel>Saldo de Pontos</FormLabel>
                                            <FormInput
                                                type="number"
                                                min="0"
                                                value={formData.saldo_pontos}
                                                onChange={(e) => setFormData(prev => ({ ...prev, saldo_pontos: e.target.value }))}
                                                disabled={salvando || (user?.role !== 'dev')}
                                                placeholder="0"
                                            />
                                            <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                                                Pontos disponíveis para o cliente
                                            </span>
                                        </FormGroup>

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

                {/* Modal de Detalhes do Usuário */}
                {modalDetalhes && usuarioDetalhes && (
                    <FullscreenModalOverlay>
                        <FullscreenModalContent onClick={(e) => e.stopPropagation()}>
                            <FullscreenModalHeader>
                                <h2>
                                    Detalhes do Usuário: {usuarioDetalhes.nome}
                                </h2>
                                <CloseButton onClick={() => setModalDetalhes(false)}>
                                    <FiX size={20} />
                                    Fechar
                                </CloseButton>
                            </FullscreenModalHeader>

                            {loadingDetalhes ? (
                                <LoadingContainer>
                                    <FiLoader className="animate-spin" size={40} />
                                    <p>Carregando detalhes...</p>
                                </LoadingContainer>
                            ) : (
                                <>
                                    {/* Resumo do Cliente Otimizado */}
                                    <ClientSummaryCard>
                                        <ClientAvatar>
                                            {usuarioDetalhes.nome.charAt(0).toUpperCase()}
                                        </ClientAvatar>

                                        <ClientInfo>
                                            <ClientName>{usuarioDetalhes.nome}</ClientName>
                                            <ClientDetails>
                                                <span><FiUserCheck size={14} />{usuarioDetalhes.email}</span>
                                                <span><FiUserCheck size={14} />{usuarioDetalhes.cpf || 'CPF não informado'}</span>
                                                <span><FiUserCheck size={14} />{usuarioDetalhes.loja_nome || 'Loja não informada'}</span>
                                                <span><FiFile size={14} />{imagensUsuario.length} imagem{imagensUsuario.length !== 1 ? 's' : ''}</span>
                                                <span><FiGift size={14} />{premiosResgatados.length} prêmio{premiosResgatados.length !== 1 ? 's' : ''}</span>
                                            </ClientDetails>
                                        </ClientInfo>

                                        <ClientStats>
                                            <StatCard $type="balance">
                                                <div className="value">{formatarPontos(usuarioDetalhes.saldo_pontos)}</div>
                                                <div className="label">Saldo Atual</div>
                                            </StatCard>
                                            <StatCard $type="points">
                                                <div className="value">{formatarPontos(usuarioDetalhes.total_pontos_ganhos)}</div>
                                                <div className="label">Total Ganho</div>
                                            </StatCard>
                                            <StatCard $type="spent">
                                                <div className="value">{formatarPontos(usuarioDetalhes.total_pontos_gastos)}</div>
                                                <div className="label">Total Gasto</div>
                                            </StatCard>
                                        </ClientStats>
                                    </ClientSummaryCard>

                                    {/* Histórico de Pontos - Formato Planilha */}
                                    <FormSection>
                                        <FormSectionTitle>
                                            <FiCheck />
                                            Histórico de Pontos (Últimas 50 movimentações)
                                        </FormSectionTitle>

                                        {historicoUsuario.length > 0 ? (
                                            <div style={{
                                                border: '1px solid #E2E8F0',

                                                overflow: 'hidden',
                                                background: 'white'
                                            }}>
                                                {/* Cabeçalho da planilha */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '140px 120px 120px 120px 1fr',
                                                    background: '#F7FAFC',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.875rem',
                                                    color: '#4A5568',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    <div style={{ padding: '0.75rem', borderRight: '1px solid #E2E8F0' }}>Data/Hora</div>
                                                    <div style={{ padding: '0.75rem', borderRight: '1px solid #E2E8F0', textAlign: 'center' }}>Tipo</div>
                                                    <div style={{ padding: '0.75rem', borderRight: '1px solid #E2E8F0', textAlign: 'right' }}>Pontos</div>
                                                    <div style={{ padding: '0.75rem', borderRight: '1px solid #E2E8F0', textAlign: 'right' }}>Saldo</div>
                                                    <div style={{ padding: '0.75rem' }}>Descrição</div>
                                                </div>

                                                {/* Linhas da planilha */}
                                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                    {historicoUsuario.map((hist, index) => (
                                                        <div
                                                            key={hist.id}
                                                            style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: '140px 120px 120px 120px 1fr',
                                                                borderBottom: index < historicoUsuario.length - 1 ? '1px solid #E2E8F0' : 'none',
                                                                transition: 'background 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                        >
                                                            <div style={{
                                                                padding: '0.75rem',
                                                                borderRight: '1px solid #E2E8F0',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                <div style={{ fontWeight: 'bold' }}>
                                                                    {new Date(hist.created_at).toLocaleDateString('pt-BR')}
                                                                </div>
                                                                <div style={{ color: '#718096' }}>
                                                                    {new Date(hist.created_at).toLocaleTimeString('pt-BR', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div style={{
                                                                padding: '0.75rem',
                                                                borderRight: '1px solid #E2E8F0',
                                                                textAlign: 'center',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <span style={{
                                                                    padding: '0.25rem 0.5rem',

                                                                    fontSize: '0.65rem',
                                                                    fontWeight: 'bold',
                                                                    color: 'white',
                                                                    background: hist.tipo_operacao === 'ganho' ? '#10B981' :
                                                                        hist.tipo_operacao === 'resgate' ? '#EF4444' :
                                                                            hist.tipo_operacao === 'ajuste' ? '#F59E0B' : '#6B7280'
                                                                }}>
                                                                    {hist.tipo_operacao === 'ganho' ? 'GANHO' :
                                                                        hist.tipo_operacao === 'resgate' ? 'RESGATE' :
                                                                            hist.tipo_operacao === 'ajuste' ? 'AJUSTE' : 'OUTRO'}
                                                                </span>
                                                            </div>

                                                            <div style={{
                                                                padding: '0.75rem',
                                                                borderRight: '1px solid #E2E8F0',
                                                                textAlign: 'right',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.875rem',
                                                                color: hist.pontos > 0 ? '#10B981' : '#EF4444'
                                                            }}>
                                                                {hist.pontos > 0 ? '+' : ''}{hist.pontos.toLocaleString('pt-BR')}
                                                            </div>

                                                            <div style={{
                                                                padding: '0.75rem',
                                                                borderRight: '1px solid #E2E8F0',
                                                                textAlign: 'right',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.875rem',
                                                                color: '#2D3748'
                                                            }}>
                                                                {hist.saldo_posterior?.toLocaleString('pt-BR') || '0'}
                                                            </div>

                                                            <div style={{
                                                                padding: '0.75rem',
                                                                fontSize: '0.875rem',
                                                                color: '#4A5568'
                                                            }}>
                                                                {hist.descricao ? (
                                                                    <div title={hist.descricao}>
                                                                        {hist.descricao.length > 60
                                                                            ? `${hist.descricao.substring(0, 60)}...`
                                                                            : hist.descricao
                                                                        }
                                                                    </div>
                                                                ) : (
                                                                    <span style={{ color: '#A0AEC0', fontStyle: 'italic' }}>Sem descrição</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Rodapé com resumo */}
                                                <div style={{
                                                    background: '#F7FAFC',
                                                    padding: '0.75rem',
                                                    borderTop: '2px solid #E2E8F0',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    <span>Total de movimentações: {historicoUsuario.length}</span>
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <span style={{ color: '#10B981' }}>
                                                            Ganhos: {historicoUsuario.filter(h => h.tipo_operacao === 'ganho').length}
                                                        </span>
                                                        <span style={{ color: '#EF4444' }}>
                                                            Resgates: {historicoUsuario.filter(h => h.tipo_operacao === 'resgate').length}
                                                        </span>
                                                        <span style={{ color: '#F59E0B' }}>
                                                            Ajustes: {historicoUsuario.filter(h => h.tipo_operacao === 'ajuste').length}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '3rem',
                                                background: '#F7FAFC',

                                                border: '1px solid #E2E8F0'
                                            }}>
                                                <FiCheck size={48} style={{ color: '#A0AEC0', marginBottom: '1rem' }} />
                                                <h3 style={{ color: '#4A5568', marginBottom: '0.5rem' }}>Nenhuma movimentação encontrada</h3>
                                            </div>
                                        )}
                                    </FormSection>

                                    {/* Prêmios Resgatados */}
                                    <FormSection>
                                        <FormSectionTitle>
                                            <FiGift />
                                            Prêmios Resgatados ({premiosResgatados.length} item{premiosResgatados.length !== 1 ? 's' : ''})
                                        </FormSectionTitle>

                                        {premiosResgatados.length > 0 ? (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                                gap: '1.5rem',
                                                maxHeight: '600px',
                                                overflowY: 'auto',
                                                padding: '0.5rem'
                                            }}>
                                                {premiosResgatados.map((resgate) => (
                                                    <div
                                                        key={resgate.id}
                                                        style={{
                                                            background: 'white',
                                                            border: '1px solid #E2E8F0',
                                                            overflow: 'hidden',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onClick={() => visualizarPremio(resgate)}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0px)';
                                                        }}
                                                    >
                                                        {/* Header do Card */}
                                                        <div style={{
                                                            background: '#F8FAFC',
                                                            padding: '1rem',
                                                            borderBottom: '1px solid #E2E8F0',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}>
                                                            <div style={{
                                                                padding: '0.25rem 0.75rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                color: 'white',
                                                                background: resgate.status === 'entregue' ? '#10B981' : '#3B82F6'
                                                            }}>
                                                                {resgate.status === 'entregue' ? 'ENTREGUE' : 'PENDENTE'}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '0.75rem',
                                                                color: '#718096',
                                                                fontWeight: '500'
                                                            }}>
                                                                {new Date(resgate.coletado && resgate.data_coleta ? resgate.data_coleta : resgate.created_at).toLocaleDateString('pt-BR')}
                                                            </div>
                                                        </div>

                                                        {/* Imagem do Prêmio */}
                                                        <div style={{
                                                            position: 'relative',
                                                            width: '100%',
                                                            height: '180px',
                                                            overflow: 'hidden',
                                                            background: '#F8FAFC'
                                                        }}>
                                                            {resgate.premios_catalogo?.imagem_url ? (
                                                                <img
                                                                    src={resgate.premios_catalogo.imagem_url}
                                                                    alt={resgate.premios_catalogo.nome}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'contain',
                                                                        objectPosition: 'center',
                                                                        padding: '0.5rem'
                                                                    }}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div style={{
                                                                display: resgate.premios_catalogo?.imagem_url ? 'none' : 'flex',
                                                                width: '100%',
                                                                height: '100%',
                                                                background: '#E2E8F0',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <FiGift size={40} style={{ color: '#718096' }} />
                                                            </div>
                                                        </div>

                                                        {/* Conteúdo do Card */}
                                                        <div style={{ padding: '1rem' }}>
                                                            {/* Nome do Prêmio */}
                                                            <h4 style={{
                                                                margin: '0 0 0.5rem 0',
                                                                fontSize: '1.1rem',
                                                                fontWeight: 'bold',
                                                                color: '#2D3748',
                                                                lineHeight: 1.3
                                                            }}>
                                                                {resgate.premios_catalogo?.nome || 'Prêmio não encontrado'}
                                                            </h4>

                                                            {/* Descrição */}
                                                            <p style={{
                                                                margin: '0 0 1rem 0',
                                                                fontSize: '0.875rem',
                                                                color: '#4A5568',
                                                                lineHeight: 1.4,
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {resgate.premios_catalogo?.descricao || 'Sem descrição disponível'}
                                                            </p>

                                                            {/* Código do Resgate */}
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                marginBottom: '1rem',
                                                                padding: '0.5rem',
                                                                background: '#F8FAFC',
                                                                border: '1px solid #E2E8F0'
                                                            }}>
                                                                <div style={{ fontSize: '0.75rem', color: '#4A5568', fontWeight: 'bold' }}>
                                                                    Código:
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '0.8rem',
                                                                    color: '#2D3748',
                                                                    fontWeight: 'bold',
                                                                    fontFamily: 'monospace',
                                                                    letterSpacing: '0.05em'
                                                                }}>
                                                                    {resgate.codigo_resgate}
                                                                </div>
                                                            </div>

                                                            {/* Informações Resumidas */}
                                                            <div style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: '1fr 1fr',
                                                                gap: '0.75rem',
                                                                fontSize: '0.8rem'
                                                            }}>
                                                                <div>
                                                                    <div style={{ color: '#718096', fontWeight: '500' }}>Pontos do Prêmio:</div>
                                                                    <div style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                                        {formatarPontos(resgate.premios_catalogo?.pontos_necessarios)} pts
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div style={{ color: '#718096', fontWeight: '500' }}>Categoria:</div>
                                                                    <div style={{ color: '#2D3748', fontWeight: '500', fontSize: '0.85rem' }}>
                                                                        {resgate.premios_catalogo?.categoria || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Informações de Coleta */}
                                                            {resgate.coletado && resgate.data_coleta && (
                                                                <div style={{
                                                                    marginTop: '1rem',
                                                                    padding: '0.75rem',
                                                                    background: '#F0FDF4',
                                                                    borderLeft: '3px solid #10B981'
                                                                }}>
                                                                    <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 'bold' }}>
                                                                        Coletado em: {new Date(resgate.data_coleta).toLocaleDateString('pt-BR')}
                                                                    </div>
                                                                    {(resgate.gerente_retirada || resgate.loja_nome) && (
                                                                        <div style={{ fontSize: '0.7rem', color: '#15803D', marginTop: '0.25rem' }}>
                                                                            Retirado por: {resgate.gerente_retirada || 'Gerente'}
                                                                            {resgate.loja_nome && resgate.loja_nome !== 'N/A' && (
                                                                                <span> | Loja | {resgate.loja_nome}</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '3rem',
                                                background: '#F7FAFC',
                                                border: '1px solid #E2E8F0'
                                            }}>
                                                <FiGift size={48} style={{ color: '#A0AEC0', marginBottom: '1rem' }} />
                                                <h3 style={{ color: '#4A5568', marginBottom: '0.5rem' }}>Nenhum prêmio resgatado</h3>
                                                <p style={{ color: '#718096' }}>Este usuário ainda não resgatou nenhum prêmio.</p>
                                            </div>
                                        )}
                                    </FormSection>

                                    {/* Notas Enviadas - inclui dados e pontos retornados */}
                                    <FormSection>
                                        <FormSectionTitle>
                                            <FiAlertCircle />
                                            Notas Enviadas ({imagensUsuario.length} nota{imagensUsuario.length !== 1 ? 's' : ''})
                                        </FormSectionTitle>

                                        {imagensUsuario.length > 0 ? (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                                gap: '1rem',
                                                maxHeight: '500px',
                                                overflowY: 'auto'
                                            }}>
                                                {imagensUsuario.map((imagem) => (
                                                    <div
                                                        key={imagem.id}
                                                        style={{
                                                            border: '1px solid #E2E8F0',
                                                            padding: '1rem',
                                                            background: 'white',
                                                            transition: 'all 0.2s ease',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                        }}
                                                    >
                                                        {/* Header com status e data */}
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            marginBottom: '0.75rem'
                                                        }}>
                                                            <div style={{
                                                                padding: '0.25rem 0.75rem',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 'bold',
                                                                color: 'white',
                                                                background: imagem.status_upload === 'processado' ? '#10B981' :
                                                                    imagem.status_upload === 'erro' ? '#EF4444' :
                                                                        imagem.status_upload === 'processando' ? '#F59E0B' : '#6B7280'
                                                            }}>
                                                                {imagem.status_upload === 'processado' ? 'PROCESSADO' :
                                                                    imagem.status_upload === 'erro' ? 'ERRO' :
                                                                        imagem.status_upload === 'processando' ? 'PROCESSANDO' : 'PENDENTE'}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '0.75rem',
                                                                color: '#718096',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {new Date(imagem.created_at).toLocaleDateString('pt-BR')} {new Date(imagem.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>

                                                        {/* Linha com tipo e horário */}
                                                        <div style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: '1fr 1fr',
                                                            gap: '0.5rem',
                                                            marginTop: '0.25rem',
                                                            padding: '0.5rem',
                                                            background: '#F7FAFC',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            <div>
                                                                <span style={{ color: '#718096' }}>Tipo:</span><br />
                                                                <span style={{ color: '#4A5568', fontWeight: 'bold' }}>
                                                                    {imagem.tipo_arquivo?.split('/')[1]?.toUpperCase() || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span style={{ color: '#718096' }}>Horário:</span><br />
                                                                <span style={{ color: '#4A5568', fontWeight: 'bold' }}>
                                                                    {new Date(imagem.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Pontos retornados e dados da nota (resumo) */}
                                                        {(typeof imagem.pontos_retornados !== 'undefined' || imagem.dados_nota) && (
                                                            <div style={{ marginTop: '0.75rem' }}>
                                                                {typeof imagem.pontos_retornados !== 'undefined' && (
                                                                    <div style={{ marginBottom: '0.5rem' }}>
                                                                        <div style={{ color: '#718096', fontWeight: 500 }}>Pontos retornados:</div>
                                                                        <div style={{ color: '#10B981', fontWeight: 'bold' }}>
                                                                            {(Number(imagem.pontos_retornados) || 0).toLocaleString('pt-BR')} pts
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {imagem.dados_nota && (
                                                                    <div>
                                                                        <div style={{ color: '#718096', fontWeight: 500, marginBottom: '0.25rem' }}>Dados da Nota (resumo):</div>
                                                                        <pre style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', padding: '0.5rem', maxHeight: 150, overflow: 'auto', fontSize: '0.75rem' }}>
{JSON.stringify(imagem.dados_nota, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '3rem', background: '#F7FAFC', border: '1px solid #E2E8F0' }}>
                                                <FiAlertCircle size={48} style={{ color: '#A0AEC0', marginBottom: '1rem' }} />
                                                <h3 style={{ color: '#4A5568', marginBottom: '0.5rem' }}>Nenhuma nota enviada</h3>
                                                <p style={{ color: '#718096' }}>As notas processadas aparecerão aqui com os dados e pontos retornados.</p>
                                            </div>
                                        )}
                                    </FormSection>
                                </>
                            )}
                        </FullscreenModalContent>
                    </FullscreenModalOverlay>
                )}

                {/* Modal de Visualização de Imagem - Melhorado */}
                {modalImagem && imagemSelecionada && (
                    <ModalOverlay onClick={() => setModalImagem(false)}>
                        <ModalContent
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: '1000px', maxHeight: '95vh' }}
                        >
                            <ModalHeader>
                                <h2>
                                    <FiEye />
                                    Detalhes do Arquivo
                                </h2>
                                <IconButton onClick={() => setModalImagem(false)}>
                                    <FiX size={20} />
                                </IconButton>
                            </ModalHeader>

                            <div>
                                {/* Informações principais da imagem */}
                                <div style={{
                                    background: '#F7FAFC',
                                    padding: '1.5rem',
                                    marginBottom: '1.5rem',

                                    border: '1px solid #E2E8F0'
                                }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                        gap: '1rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#718096',
                                                textTransform: 'uppercase',
                                                fontWeight: 'bold',
                                                letterSpacing: '0.5px',
                                                marginBottom: '0.25rem'
                                            }}>
                                                Número da Nota
                                            </div>
                                            <div style={{
                                                fontSize: '1.125rem',
                                                fontWeight: 'bold',
                                                color: '#2D3748',
                                                fontFamily: 'monospace'
                                            }}>
                                                {imagemSelecionada.numero_nota || 'Não identificado'}
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#718096',
                                                textTransform: 'uppercase',
                                                fontWeight: 'bold',
                                                letterSpacing: '0.5px',
                                                marginBottom: '0.25rem'
                                            }}>
                                                Data/Hora do Upload
                                            </div>
                                            <div style={{ fontSize: '1rem', color: '#4A5568', fontWeight: '500' }}>
                                                {new Date(imagemSelecionada.created_at).toLocaleString('pt-BR')}
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#718096',
                                                textTransform: 'uppercase',
                                                fontWeight: 'bold',
                                                letterSpacing: '0.5px',
                                                marginBottom: '0.25rem'
                                            }}>
                                                Status do Processamento
                                            </div>
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '0.375rem 0.75rem',

                                                fontSize: '0.875rem',
                                                fontWeight: 'bold',
                                                color: 'white',
                                                background: imagemSelecionada.status_upload === 'processado' ? '#10B981' :
                                                    imagemSelecionada.status_upload === 'erro' ? '#EF4444' :
                                                        imagemSelecionada.status_upload === 'processando' ? '#F59E0B' : '#6B7280'
                                            }}>
                                                {imagemSelecionada.status_upload === 'processado' ? 'PROCESSADO' :
                                                    imagemSelecionada.status_upload === 'erro' ? 'ERRO' :
                                                        imagemSelecionada.status_upload === 'processando' ? 'PROCESSANDO' : 'PENDENTE'}
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#718096',
                                                textTransform: 'uppercase',
                                                fontWeight: 'bold',
                                                letterSpacing: '0.5px',
                                                marginBottom: '0.25rem'
                                            }}>
                                                Tamanho do Arquivo
                                            </div>
                                            <div style={{ fontSize: '1rem', color: '#4A5568', fontWeight: '500' }}>
                                                {(imagemSelecionada.tamanho_bytes / 1024 / 1024).toFixed(2)} MB
                                                <span style={{ fontSize: '0.875rem', color: '#718096', marginLeft: '0.5rem' }}>
                                                    ({imagemSelecionada.tipo_arquivo})
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chave de Acesso (se disponível) */}
                                    {imagemSelecionada.chave_acesso && (
                                        <div style={{
                                            padding: '1rem',
                                            background: '#EBF8FF',

                                            borderLeft: '4px solid #3B82F6',
                                            marginTop: '1rem'
                                        }}>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#1E40AF',
                                                fontWeight: 'bold',
                                                marginBottom: '0.5rem'
                                            }}>
                                                Chave de Acesso NFe
                                            </div>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#1E40AF',
                                                fontFamily: 'monospace',
                                                wordBreak: 'break-all',
                                                padding: '0.5rem',
                                                background: 'white',

                                                border: '1px solid #BFDBFE'
                                            }}>
                                                {imagemSelecionada.chave_acesso}
                                            </div>
                                        </div>
                                    )}

                                    {/* Pedido Relacionado (se disponível) */}
                                    {imagemSelecionada.pedidos_vendas && (
                                        <div style={{
                                            padding: '1rem',
                                            background: '#F0FDF4',

                                            borderLeft: '4px solid #10B981',
                                            marginTop: '1rem'
                                        }}>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#166534',
                                                fontWeight: 'bold',
                                                marginBottom: '0.5rem'
                                            }}>
                                                Pedido Relacionado
                                            </div>
                                            <div style={{ fontSize: '1rem', color: '#166534', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                {imagemSelecionada.pedidos_vendas.numero_pedido}
                                            </div>
                                        </div>
                                    )}

                                    {/* Mensagem de erro (se houver) */}
                                    {imagemSelecionada.status_upload === 'erro' && imagemSelecionada.mensagem_erro && (
                                        <div style={{
                                            padding: '1rem',
                                            background: '#FEF2F2',

                                            borderLeft: '4px solid #EF4444',
                                            marginTop: '1rem'
                                        }}>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#DC2626',
                                                fontWeight: 'bold',
                                                marginBottom: '0.5rem'
                                            }}>
                                                Erro no Processamento
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#DC2626' }}>
                                                {imagemSelecionada.mensagem_erro}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Visualização da imagem/arquivo */}
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    {imagemSelecionada.tipo_arquivo?.startsWith('image/') ? (
                                        <img
                                            src={imagemSelecionada.url_supabase}
                                            alt="Arquivo"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '70vh',
                                                objectFit: 'contain',
                                                border: '2px solid #E2E8F0',

                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    ) : imagemSelecionada.tipo_arquivo === 'application/pdf' ? (
                                        <div style={{
                                            height: '70vh',
                                            border: '2px solid #E2E8F0',

                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }}>
                                            <iframe
                                                src={imagemSelecionada.url_supabase}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    border: 'none',

                                                }}
                                                title="Arquivo PDF"
                                            />
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '4rem',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

                                            textAlign: 'center',
                                            color: 'white',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }}>
                                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                                <FiFile size={64} />
                                            </div>
                                            <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>Arquivo não pode ser visualizado</h3>
                                            <p style={{ margin: '0 0 2rem 0', opacity: 0.9 }}>
                                                Este tipo de arquivo não suporta visualização no navegador
                                            </p>
                                            <ActionButton
                                                onClick={() => window.open(imagemSelecionada.url_supabase, '_blank')}
                                                style={{
                                                    background: 'white',
                                                    color: '#667eea',
                                                    border: 'none'
                                                }}
                                            >
                                                Baixar Arquivo
                                            </ActionButton>
                                        </div>
                                    )}
                                </div>

                                {/* Ações */}
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap'
                                }}>
                                    <ActionButton
                                        onClick={() => window.open(imagemSelecionada.url_supabase, '_blank')}
                                        $variant="primary"
                                    >
                                        <FiEye />
                                        Abrir em Nova Aba
                                    </ActionButton>
                                    {imagemSelecionada.chave_acesso && (
                                        <ActionButton
                                            onClick={() => {
                                                navigator.clipboard.writeText(imagemSelecionada.chave_acesso);
                                                toast.success('Chave de acesso copiada!');
                                            }}
                                            $variant="success"
                                        >
                                            <FiCheck />
                                            Copiar Chave
                                        </ActionButton>
                                    )}
                                    <ActionButton onClick={() => setModalImagem(false)}>
                                        <FiX />
                                        Fechar
                                    </ActionButton>
                                </div>
                            </div>
                        </ModalContent>
                    </ModalOverlay>
                )}

                {/* Modal de Visualização de Prêmio */}
                {modalPremio && premioSelecionado && (
                    <ModalOverlay onClick={() => setModalPremio(false)}>
                        <ModalContent
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: '700px', maxHeight: '90vh' }}
                        >
                            <ModalHeader>
                                <h2>
                                    <FiGift />
                                    Detalhes do Prêmio Resgatado
                                </h2>
                                <IconButton onClick={() => setModalPremio(false)}>
                                    <FiX size={20} />
                                </IconButton>
                            </ModalHeader>

                            <div>
                                {/* Status e Data */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    background: '#F7FAFC',

                                    border: '1px solid #E2E8F0'
                                }}>
                                    <div style={{
                                        padding: '0.5rem 1rem',

                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        background: premioSelecionado.status === 'entregue' ? '#10B981' : '#3B82F6'
                                    }}>
                                        {premioSelecionado.status === 'entregue' ? 'ENTREGUE' : 'PENDENTE'}
                                    </div>
                                                        <div style={{ fontSize: '0.875rem', color: '#4A5568' }}>
                                                            <strong>Resgatado em:</strong> {new Date(premioSelecionado.created_at).toLocaleString('pt-BR')}
                                                        </div>
                                </div>

                                {/* Imagem do Prêmio */}
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    {premioSelecionado.premios_catalogo?.imagem_url ? (
                                        <img
                                            src={premioSelecionado.premios_catalogo.imagem_url}
                                            alt={premioSelecionado.premios_catalogo.nome}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '300px',
                                                objectFit: 'contain',
                                                border: '1px solid #E2E8F0',
                                                background: '#F8FAFC',
                                                padding: '1rem'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            maxWidth: '300px',
                                            height: '200px',
                                            margin: '0 auto',
                                            background: '#E2E8F0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid #CBD5E0'
                                        }}>
                                            <FiGift size={48} style={{ color: '#718096' }} />
                                        </div>
                                    )}
                                </div>

                                {/* Informações do Prêmio */}
                                <div style={{
                                    background: '#F7FAFC',
                                    padding: '1.5rem',
                                    marginBottom: '1.5rem',
                                    border: '1px solid #E2E8F0'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 1rem 0',
                                        fontSize: '1.25rem',
                                        fontWeight: 'bold',
                                        color: '#2D3748'
                                    }}>
                                        {premioSelecionado.premios_catalogo?.nome || premioSelecionado.descricao || 'Prêmio não encontrado'}
                                    </h3>

                                    <p style={{
                                        margin: '0 0 1rem 0',
                                        fontSize: '1rem',
                                        color: '#4A5568',
                                        lineHeight: 1.6
                                    }}>
                                        {premioSelecionado.premios_catalogo?.descricao || 'Sem descrição disponível'}
                                    </p>

                                    {/* Grid de Informações */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '1.5rem'
                                    }}>
                                        {premioSelecionado.codigo_resgate && (
                                            <div>
                                                <strong style={{ color: '#2D3748' }}>Código do Resgate:</strong>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    color: '#2D3748',
                                                    fontWeight: 'bold',
                                                    letterSpacing: '0.05em',
                                                    fontFamily: 'monospace',
                                                    marginTop: '0.25rem'
                                                }}>
                                                    {premioSelecionado.codigo_resgate}
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <strong style={{ color: '#2D3748' }}>Categoria:</strong>
                                            <div style={{ fontSize: '1rem', color: '#4A5568', fontWeight: '500', marginTop: '0.25rem' }}>
                                                {premioSelecionado.premios_catalogo?.categoria || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <strong style={{ color: '#2D3748' }}>Pontos do Prêmio:</strong>
                                            <div style={{ fontSize: '1.125rem', color: '#3B82F6', fontWeight: 'bold', marginTop: '0.25rem' }}>
                                                {formatarPontos(premioSelecionado.premios_catalogo?.pontos_necessarios)} pontos
                                            </div>
                                        </div>
                                        <div>
                                            <strong style={{ color: '#2D3748' }}>Status do Prêmio:</strong>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 'bold',
                                                color: premioSelecionado.premio_detalhes?.ativo ? '#10B981' : '#EF4444'
                                            }}>
                                                {premioSelecionado.premio_detalhes?.ativo ? 'ATIVO' : 'INATIVO'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Informações de Entrega/Status */}
                                {premioSelecionado.coletado && premioSelecionado.data_coleta ? (
                                    <div style={{
                                        padding: '1rem',
                                        background: '#F0FDF4',
                                        borderLeft: '4px solid #10B981',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '1rem' }}>
                                            Prêmio Entregue
                                        </h4>
                                        <p style={{ margin: '0', color: '#15803D' }}>
                                            <strong>Data de coleta:</strong> {new Date(premioSelecionado.data_coleta).toLocaleString('pt-BR')}
                                        </p>
                                        {(premioSelecionado.gerente_retirada || premioSelecionado.loja_nome) && (
                                            <p style={{ margin: '0.5rem 0 0 0', color: '#15803D' }}>
                                                <strong>Entregue por:</strong> {premioSelecionado.gerente_retirada || 'Gerente'}
                                                {premioSelecionado.loja_nome && premioSelecionado.loja_nome !== 'N/A' && (
                                                    <span> | Loja | {premioSelecionado.loja_nome}</span>
                                                )}
                                            </p>
                                        )}
                                        {premioSelecionado.observacoes_admin && (
                                            <p style={{ margin: '0.5rem 0 0 0', color: '#15803D' }}>
                                                <strong>Observações:</strong> {premioSelecionado.observacoes_admin}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '1rem',
                                        background: '#F8FAFC',
                                        borderLeft: '4px solid #3B82F6',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2563EB', fontSize: '1rem' }}>
                                            Aguardando Retirada
                                        </h4>
                                        <p style={{ margin: '0', color: '#3B82F6' }}>
                                            O prêmio foi resgatado e está disponível para retirada.
                                        </p>
                                    </div>
                                )}

                                {/* Ações */}
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    justifyContent: 'center'
                                }}>
                                    <ActionButton onClick={() => setModalPremio(false)}>
                                        <FiX />
                                        Fechar
                                    </ActionButton>
                                </div>
                            </div>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </MainContent>
        </Container>
    );
}

export default AdminUsuarios;
