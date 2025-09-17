import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FiPackage, FiCheck, FiX, FiClock, FiUser,
  FiGift, FiStar, FiFilter, FiRefreshCw, FiLoader,
  FiAlertCircle, FiCheckCircle, FiShield
} from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import LoadingGif from './LoadingGif';

// Animações
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// Container principal
const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 1rem;
  font-family: 'Montserrat', sans-serif;
`;

const MainContent = styled.div`
  max-width: 1200px;
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
    color: #10B981;
  }
`;

const HeaderSubtitle = styled.p`
  color: #718096;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ActionButton = styled.button`
  background: ${props => props.$variant === 'primary'
    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    : 'white'
  };
  color: ${props => props.$variant === 'primary' ? 'white' : '#4A5568'};
  border: ${props => props.$variant === 'primary' ? 'none' : '2px solid #E2E8F0'};
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

// Stats Cards
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  animation: ${fadeInUp} 0.6s ease-out;
  border-left: 4px solid ${props => props.$color || '#10B981'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3748;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
`;

// Filtros
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

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #10B981;
  }
`;

// Lista de resgates
const ResgatesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResgateCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out;
  border-left: 4px solid ${props => {
    switch (props.$status) {
      case 'pendente': return '#F59E0B';
      case 'entregue': return '#10B981';
      case 'cancelado': return '#EF4444';
      default: return '#6B7280';
    }
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
  
  ${props => props.$urgent && `
    animation: ${pulse} 2s infinite;
    border-left-color: #EF4444;
  `}
`;

const ResgateHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ResgateInfo = styled.div`
  flex: 1;
`;

const ResgateId = styled.div`
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const ResgateTitle = styled.h3`
  color: #2D3748;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ResgateCliente = styled.div`
  color: #4A5568;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ResgateStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const StatusBadge = styled.span`
  background: ${props => {
    switch (props.$status) {
      case 'pendente': return '#F59E0B';
      case 'entregue': return '#10B981';
      case 'cancelado': return '#EF4444';
      default: return '#6B7280';
    }
  }};
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ResgateData = styled.div`
  color: #718096;
  font-size: 0.875rem;
`;

const ResgateBody = styled.div`
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ResgateDetalhes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DetalheItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4A5568;
  font-size: 0.9rem;
  
  svg {
    color: #718096;
  }
`;

const PontosInfo = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cc1515;
  font-weight: 600;
`;

const ResgateActions = styled.div`
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    justify-content: stretch;
  }
`;

const ProcessButton = styled.button`
  background: ${props => {
    switch (props.$action) {
      case 'entregar': return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
      case 'cancelar': return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
      default: return 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)';
    }
  }};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  
  @media (min-width: 769px) {
    flex: none;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
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
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #4A5568;
`;

const EmptyContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  color: #718096;
  
  h3 {
    color: #2D3748;
    margin-bottom: 0.5rem;
  }
`;

function GerenteResgates({ user }) {
  const [resgates, setResgates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [processando, setProcessando] = useState({});
  const [stats, setStats] = useState({
    pendentes: 0,
    entregues: 0,
    cancelados: 0,
    total: 0
  });

  const carregarResgates = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar resgates
      let query = supabase
        .from('resgates_premios')
        .select(`
          *,
          premios_catalogo (
            nome,
            descricao,
            categoria,
            imagem_url
          ),
          clientes_fast (
            nome,
            cpf_cnpj,
            telefone,
            email
          )
        `)
        .order('data_resgate', { ascending: false });

      // Se for gerente, filtrar por loja (implementar lógica específica se necessário)
      if (user?.role === 'gerente' && user?.loja_id) {
        // Por enquanto, gerente vê todos os resgates
        // Pode implementar filtro por loja se necessário
      }

      const { data, error } = await query;

      if (error) throw error;

      setResgates(data || []);

      // Calcular estatísticas
      const resgatesTotais = data || [];
      setStats({
        pendentes: resgatesTotais.filter(r => r.status === 'pendente').length,
        entregues: resgatesTotais.filter(r => r.status === 'entregue').length,
        cancelados: resgatesTotais.filter(r => r.status === 'cancelado').length,
        total: resgatesTotais.length
      });

    } catch (error) {
      console.error('Erro ao carregar resgates:', error);
      toast.error('Erro ao carregar resgates');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregarResgates();
  }, [carregarResgates]);

  const resgatesFiltrados = resgates.filter(resgate => {
    if (filtroStatus === 'todos') return true;
    return resgate.status === filtroStatus;
  });

  const processarResgate = async (resgateId, novoStatus) => {
    const resgate = resgates.find(r => r.id === resgateId);
    if (!resgate) return;

    const confirmMessage = novoStatus === 'entregue'
      ? `Confirmar entrega do prêmio "${resgate.premios_catalogo.nome}" para ${resgate.clientes_fast.nome}?`
      : `Cancelar o resgate do prêmio "${resgate.premios_catalogo.nome}"?`;

    if (!confirm(confirmMessage)) return;

    setProcessando(prev => ({ ...prev, [resgateId]: true }));

    try {
      const updateData = {
        status: novoStatus,
        data_processamento: new Date().toISOString()
      };

      // Se está entregando, adicionar informações do gerente
      if (novoStatus === 'entregue') {
        updateData.processado_por = user.id;
        const lojaNome = user?.loja_nome || user?.lojas?.nome || '';
        const lojaSemPrefixo = (lojaNome || '').replace(/^Loja\s*\|?\s*/i, '').trim();
        const retiradaTxt = lojaSemPrefixo ? `${user.nome} | ${lojaSemPrefixo}` : `${user.nome}`;
        updateData.observacoes_gerente = `Entregue por ${retiradaTxt}`;
      }

      const { error } = await supabase
        .from('resgates_premios')
        .update(updateData)
        .eq('id', resgateId);

      if (error) throw error;

      const statusText = novoStatus === 'entregue' ? 'entregue' : 'cancelado';
      toast.success(`Resgate ${statusText} com sucesso!`);

      // Atualizar a lista
      carregarResgates();

    } catch (error) {
      console.error('Erro ao processar resgate:', error);
      toast.error('Erro ao processar resgate');
    } finally {
      setProcessando(prev => ({ ...prev, [resgateId]: false }));
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente': return <FiClock />;
      case 'entregue': return <FiCheckCircle />;
      case 'cancelado': return <FiX />;
      default: return <FiAlertCircle />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingGif
          text="Carregando resgates..."
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
            <div>
              <HeaderTitle>
                <FiPackage />
                Resgates para Entrega
              </HeaderTitle>
              <HeaderSubtitle>
                Gerencie os resgates de prêmios dos clientes
                {user?.lojas?.nome && ` - ${user.lojas.nome}`}
              </HeaderSubtitle>
            </div>
            <HeaderActions>
              <ActionButton onClick={carregarResgates} $variant="primary">
                <FiRefreshCw />
                Atualizar
              </ActionButton>
            </HeaderActions>
          </HeaderContent>
        </Header>

        <StatsContainer>
          <StatCard $color="#F59E0B">
            <StatValue>{stats.pendentes}</StatValue>
            <StatLabel>Resgates Pendentes</StatLabel>
          </StatCard>
          <StatCard $color="#10B981">
            <StatValue>{stats.entregues}</StatValue>
            <StatLabel>Resgates Entregues</StatLabel>
          </StatCard>
          <StatCard $color="#EF4444">
            <StatValue>{stats.cancelados}</StatValue>
            <StatLabel>Resgates Cancelados</StatLabel>
          </StatCard>
          <StatCard $color="#6B7280">
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total de Resgates</StatLabel>
          </StatCard>
        </StatsContainer>

        <FiltersContainer>
          <FiltersRow>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiFilter />
              <span style={{ fontWeight: '600', color: '#4A5568' }}>Filtrar por status:</span>
            </div>
            <FilterSelect
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="entregue">Entregues</option>
              <option value="cancelado">Cancelados</option>
            </FilterSelect>
          </FiltersRow>
        </FiltersContainer>

        <ResgatesContainer>
          {resgatesFiltrados.length === 0 ? (
            <EmptyContainer>
              <FiPackage size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3>Nenhum resgate encontrado</h3>
              <p>Não há resgates para o filtro selecionado.</p>
            </EmptyContainer>
          ) : (
            resgatesFiltrados.map((resgate) => (
              <ResgateCard
                key={resgate.id}
                $status={resgate.status}
                $urgent={resgate.status === 'pendente' &&
                  new Date() - new Date(resgate.data_resgate) > 24 * 60 * 60 * 1000}
              >
                <ResgateHeader>
                  <ResgateInfo>
                    <ResgateId>#{resgate.id.slice(-8).toUpperCase()}</ResgateId>
                    <ResgateTitle>
                      <FiGift />
                      {resgate.premios_catalogo.nome}
                    </ResgateTitle>
                    <ResgateCliente>
                      <FiUser />
                      {resgate.clientes_fast.nome}
                      {resgate.clientes_fast.telefone && ` - ${resgate.clientes_fast.telefone}`}
                    </ResgateCliente>
                  </ResgateInfo>
                  <ResgateStatus>
                    <StatusBadge $status={resgate.status}>
                      {getStatusIcon(resgate.status)}
                      {getStatusText(resgate.status)}
                    </StatusBadge>
                    <ResgateData>
                      {formatarData(resgate.data_resgate)}
                    </ResgateData>
                  </ResgateStatus>
                </ResgateHeader>

                <ResgateBody>
                  <ResgateDetalhes>
                    {resgate.premios_catalogo.descricao && (
                      <DetalheItem>
                        <FiGift />
                        {resgate.premios_catalogo.descricao}
                      </DetalheItem>
                    )}

                    <PontosInfo>
                      <FiStar />
                      {resgate.pontos_utilizados?.toLocaleString()} pontos utilizados
                    </PontosInfo>

                    {resgate.observacoes_gerente && (
                      <DetalheItem>
                        <FiShield />
                        {resgate.observacoes_gerente}
                      </DetalheItem>
                    )}
                  </ResgateDetalhes>

                  {resgate.status === 'pendente' && (
                    <ResgateActions>
                      <ProcessButton
                        $action="entregar"
                        onClick={() => processarResgate(resgate.id, 'entregue')}
                        disabled={processando[resgate.id]}
                      >
                        {processando[resgate.id] ? (
                          <>
                            <FiLoader className="animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <FiCheck />
                            Entregar
                          </>
                        )}
                      </ProcessButton>

                      <ProcessButton
                        $action="cancelar"
                        onClick={() => processarResgate(resgate.id, 'cancelado')}
                        disabled={processando[resgate.id]}
                      >
                        {processando[resgate.id] ? (
                          <>
                            <FiLoader className="animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <FiX />
                            Cancelar
                          </>
                        )}
                      </ProcessButton>
                    </ResgateActions>
                  )}
                </ResgateBody>
              </ResgateCard>
            ))
          )}
        </ResgatesContainer>
      </MainContent>
    </Container>
  );
}

export default GerenteResgates;
