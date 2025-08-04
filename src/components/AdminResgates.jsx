import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiSearch, FiCheck, FiClock, FiUser, FiGift, FiEye, FiEdit3, FiFilter } from 'react-icons/fi';
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
  min-height: 100vh;
  background: ${props => props.theme.colors.backgroundSecondary};
  padding: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  background: white;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme.shadows.md};
  animation: ${fadeInUp} 0.6s ease-out;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  p {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 1.1rem;
  }
`;

const Filters = styled.div`
  background: white;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme.shadows.md};
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.theme.colors.gray200};
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23666' viewBox='0 0 24 24'%3E%3Cpath d='M23.809 21.646l-6.205-6.205c1.167-1.605 1.857-3.579 1.857-5.711 0-5.365-4.365-9.73-9.731-9.73-5.365 0-9.73 4.365-9.73 9.73 0 5.366 4.365 9.73 9.73 9.73 2.034 0 3.923-.627 5.487-1.698l6.238 6.238 2.354-2.354zm-20.955-11.916c0-3.792 3.085-6.877 6.877-6.877s6.877 3.085 6.877 6.877-3.085 6.877-6.877 6.877-6.877-3.085-6.877-6.877z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 0.75rem center;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.gray200};
  font-size: 1rem;
  background: white;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.md};
  border-left: 2px solid ${props => props.color || props.theme.colors.primary};
  animation: ${fadeInUp} 0.6s ease-out ${props => props.delay || '0s'} both;
  
  .value {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.color || props.theme.colors.primary};
    margin-bottom: 0.5rem;
  }
  
  .label {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ResgatesTable = styled.div`
  background: white;
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out 0.3s both;
`;

const TableHeader = styled.div`
  background: ${props => props.theme.colors.gradientPrimary};
  color: white;
  padding: 1rem 1.5rem;
  display: grid;
  grid-template-columns: 120px 1fr 1fr 120px 120px 150px 100px;
  gap: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const TableRow = styled.div`
  padding: 1rem 1.5rem;
  display: grid;
  grid-template-columns: 120px 1fr 1fr 120px 120px 150px 100px;
  gap: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.gray100};
  align-items: center;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray50};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => props.status === 'resgatado' && `
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
  `}
  
  ${props => props.status === 'pendente' && `
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
  `}
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  ${props => props.variant === 'success' && `
    background: #28a745;
    color: white;
    
    &:hover:not(:disabled) {
      background: #218838;
      transform: translateY(-1px);
    }
  `}
  
  ${props => props.variant === 'info' && `
    background: #17a2b8;
    color: white;
    
    &:hover:not(:disabled) {
      background: #138496;
      transform: translateY(-1px);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
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
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${fadeInUp} 0.3s ease-out;
  
  h3 {
    color: ${props => props.theme.colors.text};
    margin-bottom: 1rem;
  }
`;

const CodigoDestaque = styled.div`
  background: ${props => props.theme.colors.gray50};
  border: 1px dashed ${props => props.theme.colors.primary};
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
  
  .codigo {
    font-family: 'Courier New', monospace;
    font-size: 1.5rem;
    font-weight: bold;
    color: ${props => props.theme.colors.primary};
    letter-spacing: 2px;
  }
`;

function AdminResgates({ user }) {
    const [resgates, setResgates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [busca, setBusca] = useState('');
    const [modalDetalhes, setModalDetalhes] = useState(null);
    const [processando, setProcessando] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pendentes: 0,
        coletados: 0,
        hoje: 0
    });

    const carregarResgates = async () => {
        try {
            setLoading(true);

            // Buscar resgates com joins para ter dados completos
            const { data: resgatesData, error: resgatesError } = await supabase
                .from('resgates')
                .select(`
                    *,
                    premios_catalogo!inner(
                        id,
                        nome,
                        categoria,
                        descricao,
                        pontos_necessarios
                    ),
                    clientes_fast!inner(
                        id,
                        nome,
                        email,
                        telefone
                    )
                `)
                .order('created_at', { ascending: false });

            if (resgatesError) throw resgatesError;

            // Formatar dados para o admin
            const resgatesFormatados = resgatesData?.map(resgate => ({
                id: resgate.id,
                codigo_resgate: resgate.codigo_resgate || `RES-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${resgate.id.substring(0, 4).toUpperCase()}`, // Gerar código temporário se não existir
                data_resgate: resgate.created_at,
                coletado: resgate.coletado || false,
                data_coleta: resgate.data_coleta,
                gerente_retirada: resgate.gerente_retirada,
                usuario_retirada_id: resgate.usuario_retirada_id,
                pontos_utilizados: resgate.pontos_utilizados,
                status: resgate.status,
                // Dados do cliente
                cliente_nome: resgate.clientes_fast.nome,
                cliente_email: resgate.clientes_fast.email,
                cliente_telefone: resgate.clientes_fast.telefone,
                // Dados do prêmio
                premio_nome: resgate.premios_catalogo.nome,
                premio_categoria: resgate.premios_catalogo.categoria,
                premio_descricao: resgate.premios_catalogo.descricao,
                premio_pontos: resgate.premios_catalogo.pontos_necessarios,
                // Status formatado
                status_retirada: resgate.coletado ? 'Retirado' : 'Aguardando Retirada'
            })) || [];

            setResgates(resgatesFormatados);

            // Calcular estatísticas
            const total = resgatesFormatados?.length || 0;
            const pendentes = resgatesFormatados?.filter(r => !r.coletado).length || 0;
            const retirados = resgatesFormatados?.filter(r => r.coletado).length || 0;
            const hoje = resgatesFormatados?.filter(r => {
                const dataResgate = new Date(r.data_resgate);
                const hoje = new Date();
                return dataResgate.toDateString() === hoje.toDateString();
            }).length || 0;

            setStats({ total, pendentes, coletados: retirados, hoje });

        } catch (error) {
            console.error('Erro ao carregar resgates:', error);
            toast.error('Erro ao carregar resgates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarResgates();
    }, []);

    const marcarComoResgatado = async (codigo) => {
        try {
            setProcessando(true);

            // Preparar informações do gerente e loja
            const gerenteNome = user?.nome || 'Gerente';
            const lojaNome = user?.lojas?.nome || 'Loja';
            const gerenteInfo = `${gerenteNome} | ${lojaNome}`;

            // Atualizar resgate como retirado usando o código
            const { data, error } = await supabase
                .from('resgates')
                .update({
                    coletado: true,
                    data_coleta: new Date().toISOString(),
                    gerente_retirada: gerenteInfo,
                    usuario_retirada_id: user?.id
                })
                .eq('codigo_resgate', codigo)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                toast.success('Resgate marcado como entregue!');
                carregarResgates(); // Recarregar dados
                setModalDetalhes(null);
            } else {
                toast.error('Resgate não encontrado ou já foi entregue');
            }

        } catch (error) {
            console.error('Erro ao marcar como resgatado:', error);
            toast.error('Erro ao marcar como entregue');
        } finally {
            setProcessando(false);
        }
    };

    const resgatesFiltrados = resgates.filter(resgate => {
        const matchBusca = busca === '' ||
            resgate.codigo_resgate.toLowerCase().includes(busca.toLowerCase()) ||
            resgate.cliente_nome.toLowerCase().includes(busca.toLowerCase()) ||
            resgate.premio_nome.toLowerCase().includes(busca.toLowerCase());

        const matchStatus = filtroStatus === 'todos' ||
            (filtroStatus === 'pendentes' && !resgate.coletado) ||
            (filtroStatus === 'retirados' && resgate.coletado);

        return matchBusca && matchStatus;
    });

    if (loading) {
        return (
            <Container>
                <Header>
                    <h1><FiGift /> Carregando...</h1>
                </Header>
            </Container>
        );
    }

    return (
        <Container>

            <Stats>
                <StatCard color="#007bff" delay="0.1s">
                    <div className="value">{stats.total}</div>
                    <div className="label">Total de Resgates</div>
                </StatCard>
                <StatCard color="#ffc107" delay="0.2s">
                    <div className="value">{stats.pendentes}</div>
                    <div className="label">Aguardando Entrega</div>
                </StatCard>
                <StatCard color="#28a745" delay="0.3s">
                    <div className="value">{stats.coletados}</div>
                    <div className="label">Entregues</div>
                </StatCard>
                <StatCard color="#17a2b8" delay="0.4s">
                    <div className="value">{stats.hoje}</div>
                    <div className="label">Entregas Hoje</div>
                </StatCard>
            </Stats>

            <Filters>
                <SearchInput
                    type="text"
                    placeholder="Buscar por código, cliente ou prêmio..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
                <FilterSelect
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                >
                    <option value="todos">Todos os Status</option>
                    <option value="pendentes">Aguardando</option>
                    <option value="retirados">Entregues</option>
                </FilterSelect>
            </Filters>

            <ResgatesTable>
                <TableHeader>
                    <div>Código</div>
                    <div>Cliente</div>
                    <div>Prêmio</div>
                    <div>Data Resgate</div>
                    <div>Pontos</div>
                    <div>Status</div>
                    <div>Ações</div>
                </TableHeader>

                {resgatesFiltrados.map((resgate, index) => (
                    <TableRow key={resgate.id}>
                        <CodigoDestaque style={{ margin: 0, padding: '0.5rem', display: 'inline-block' }}>
                            <div className="codigo" style={{ fontSize: '0.9rem' }}>
                                {resgate.codigo_resgate}
                            </div>
                        </CodigoDestaque>

                        <div>
                            <div style={{ fontWeight: '600' }}>{resgate.cliente_nome}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{resgate.cliente_email}</div>
                        </div>

                        <div>
                            <div style={{ fontWeight: '600' }}>{resgate.premio_nome}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{resgate.premio_categoria}</div>
                        </div>

                        <div>
                            {new Date(resgate.data_resgate).toLocaleDateString('pt-BR')}
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                {resgate.dias_desde_resgate} dias atrás
                            </div>
                        </div>

                        <div style={{ fontWeight: '600' }}>
                            {resgate.pontos_utilizados} pts
                        </div>

                        <div>
                            <StatusBadge status={resgate.coletado ? 'resgatado' : 'pendente'}>
                                {resgate.status_retirada}
                            </StatusBadge>
                            {resgate.coletado && resgate.data_coleta && (
                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                    <div style={{ fontWeight: '500' }}>
                                        Data da Entrega: {new Date(resgate.data_coleta).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            )}
                            {resgate.coletado && resgate.gerente_retirada && (
                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                    <div style={{ fontWeight: '500' }}>
                                        Retirado por: {resgate.gerente_retirada}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <ActionButton
                                variant="info"
                                onClick={() => setModalDetalhes(resgate)}
                            >
                                <FiEye />
                                Ver
                            </ActionButton>

                            {!resgate.coletado && (
                                <ActionButton
                                    variant="success"
                                    onClick={() => marcarComoResgatado(resgate.codigo_resgate)}
                                    disabled={processando}
                                >
                                    <FiCheck />
                                    Entregar
                                </ActionButton>
                            )}
                        </div>
                    </TableRow>
                ))}

                {resgatesFiltrados.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        Nenhum resgate encontrado com os filtros aplicados.
                    </div>
                )}
            </ResgatesTable>

            {/* Modal de Detalhes */}
            {modalDetalhes && (
                <Modal onClick={() => setModalDetalhes(null)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h3>Detalhes do Resgate</h3>

                        <CodigoDestaque>
                            <div className="codigo">{modalDetalhes.codigo_resgate}</div>
                        </CodigoDestaque>

                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Cliente:</strong> {modalDetalhes.cliente_nome}<br />
                            <strong>Email:</strong> {modalDetalhes.cliente_email}<br />
                            <strong>Telefone:</strong> {modalDetalhes.cliente_telefone || 'Não informado'}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Prêmio:</strong> {modalDetalhes.premio_nome}<br />
                            <strong>Categoria:</strong> {modalDetalhes.premio_categoria}<br />
                            <strong>Descrição:</strong> {modalDetalhes.premio_descricao}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Data do Resgate:</strong> {new Date(modalDetalhes.data_resgate).toLocaleString('pt-BR')}<br />
                            <strong>Pontos Utilizados:</strong> {modalDetalhes.pontos_utilizados}<br />
                            <strong>Status:</strong> {modalDetalhes.status_retirada}
                        </div>

                        {modalDetalhes.coletado && modalDetalhes.data_coleta && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Data da Entrega:</strong> {new Date(modalDetalhes.data_coleta).toLocaleString('pt-BR')}
                                {modalDetalhes.gerente_retirada && (
                                    <>
                                        <br />
                                        <strong>Retirado por:</strong> {modalDetalhes.gerente_retirada}
                                    </>
                                )}
                            </div>
                        )}

                        {modalDetalhes.observacoes_admin && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Observações:</strong> {modalDetalhes.observacoes_admin}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                            {!modalDetalhes.coletado && (
                                <ActionButton
                                    variant="success"
                                    onClick={() => marcarComoResgatado(modalDetalhes.codigo_resgate)}
                                    disabled={processando}
                                >
                                    <FiCheck />
                                    {processando ? 'Processando...' : 'Marcar como entregue'}
                                </ActionButton>
                            )}

                            <ActionButton
                                variant="info"
                                onClick={() => setModalDetalhes(null)}
                            >
                                Fechar
                            </ActionButton>
                        </div>
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
}

export default AdminResgates;
