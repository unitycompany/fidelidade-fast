import React, { useState, useEffect, useCallback } from 'react'
import styled, { keyframes, css } from 'styled-components'
import toast from 'react-hot-toast'
import { FiStar, FiTrendingUp, FiGift, FiUser, FiCalendar, FiShoppingBag, FiUpload, FiAward, FiRefreshCw, FiShield } from 'react-icons/fi'
import { supabase } from '../services/supabase'
import Loading from './Loading'
import MeusResgates from './MeusResgates'

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: #f1f1f1;
  /* background: linear-gradient(135deg, #f1f1f1 0%, #e8e8e8 50%, #f1f1f1 100%); */
  padding: 2rem;
  font-family: 'Montserrat', sans-serif;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${slideIn} 0.8s ease-out;
`;

const WelcomeCard = styled.div`
  background: linear-gradient(135deg, #A91918, #d32f2f);
  border: 2px dashed #ffffff70;
  color: white;
  padding: 2rem;
  border-radius: 5px;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(169, 25, 24, 0.2);
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 12px;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-family: 'Urbanist', sans-serif;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
  color: #fff;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.95;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.8s ease-out 0.4s both;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const UserInfo = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 0.8s ease-out 0.6s both;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const UserDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  animation: ${slideIn} 0.6s ease-out;
`;

const PointsBadge = styled.div`
  background: linear-gradient(135deg, #28a745, #20c997);
  padding: 0.6rem 1rem;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 16px rgba(40, 167, 69, 0.3);
  animation: ${pulse} 2s ease-in-out infinite;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 25px rgba(40, 167, 69, 0.4);
    
    &:before {
      left: 100%;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.8rem 1.2rem;
  }
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  animation: ${fadeIn} 1s ease-out;
  font-family: 'Montserrat', sans-serif;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 5px;
  box-shadow: 0 10px 20px rgba(53, 53, 53, 0.1);
  border-left: 4px solid ${props => props.$color || '#A91918'};
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, ${props => props.$color || '#A91918'}15, transparent);
    border-radius: 0 0 0 100px;
    transition: all .3s ease-in-out;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(53, 53, 53, 0.15);
    
    &:before {
      width: 120px;
      height: 120px;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 5px;
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, ${props => props.$color || '#A91918'}, ${props => props.$colorSecondary || '#d32f2f'});
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 8px 16px ${props => (props.$color || '#A91918') + '33'};
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  
  &:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 12px 24px ${props => (props.$color || '#A91918') + '50'};
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #353535;
  margin-bottom: 0.5rem;
  font-family: 'Urbanist', sans-serif;
  position: relative;
  z-index: 2;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 3px;
    background: linear-gradient(90deg, ${props => props.$color || '#A91918'}, transparent);
    transition: width 0.5s ease;
  }
  
  .stat-card:hover &::after {
    width: 60px;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 1rem;
  font-weight: 500;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ActionCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 5px;
  box-shadow: 0 10px 20px rgba(53, 53, 53, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;
  border: 1px solid rgba(169, 25, 24, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(53, 53, 53, 0.15);
    border-color: #A91918;
  }
  
  @media (max-width: 768px) {
    padding: 1.2rem;
    border-radius: 12px;
  }
`;

const ActionIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #A91918, #d32f2f);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  margin: 0 auto 1rem;
  box-shadow: 0 8px 16px rgba(169, 25, 24, 0.2);
`;

const ActionTitle = styled.h3`
  color: #353535;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-family: 'Urbanist', sans-serif;
`;

const ActionDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  
  h3 {
    color: #353535;
    margin-bottom: 1rem;
    font-family: 'Urbanist', sans-serif;
  }
`;

// Novo estilo de tabela para dashboard clean tipo planilha
const DashboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin: 0 0 2.5rem 0;
  box-shadow: 0 1px 8px rgba(0,0,0,0.03);
`;
const DashboardTh = styled.th`
  border: 1px solid #e3e6ea;
  background: #f8f9fa;
  color: #222;
  font-weight: 700;
  padding: 14px 16px;
  font-size: 15px;
  min-width: 160px;
  text-align: left;
`;
const DashboardTd = styled.td`
  border: 1px solid #e3e6ea;
  padding: 14px 16px;
  font-size: 15px;
  color: #222;
  background: #fafbfc;
  text-align: left;
`;

const DashboardFast = ({ user, setCurrentView, setSelectedUpload, refreshTrigger }) => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    saldoPontos: 0,
    totalGanhos: 0,
    totalGastos: 0,
    pedidosEnviados: 0,
    premiosDisponiveis: 0,
    resgatesRealizados: 0
  })

  const loadStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true)
      console.log('🔄 Carregando estatísticas do dashboard para usuário:', user.id)

      // Buscar dados do cliente com timestamp para evitar cache
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes_fast')
        .select('saldo_pontos, total_pontos_ganhos, total_pontos_gastos')
        .eq('id', user.id)
        .single()

      if (clienteError) {
        console.error('Erro ao buscar dados do cliente:', clienteError)
        return
      }

      console.log('📊 Dados do cliente carregados:', {
        saldo_pontos: clienteData?.saldo_pontos,
        total_pontos_ganhos: clienteData?.total_pontos_ganhos,
        total_pontos_gastos: clienteData?.total_pontos_gastos,
        clienteData: clienteData
      })

      // Contar pedidos (usando tabela correta)
      let pedidosCount = 0;
      try {
        const { count } = await supabase
          .from('pedidos_vendas')
          .select('*', { count: 'exact', head: true })
          .eq('cliente_id', user.id);
        pedidosCount = count || 0;
      } catch (error) {
        // Tentar tabela alternativa
        try {
          const { count } = await supabase
            .from('uploads_analise')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', user.id);
          pedidosCount = count || 0;
        } catch (error2) {
          console.log('Nenhuma tabela de pedidos encontrada, usando valor padrão');
          pedidosCount = 0;
        }
      }

      // Contar prêmios disponíveis (usando tabela correta)
      let premiosCount = 0;
      try {
        const { count } = await supabase
          .from('premios_catalogo')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true);
        premiosCount = count || 0;
      } catch (error) {
        console.log('Erro ao buscar prêmios:', error);
        premiosCount = 0;
      }

      // Contar resgates
      let resgatesCount = 0;
      try {
        const { count } = await supabase
          .from('resgates')
          .select('*', { count: 'exact', head: true })
          .eq('cliente_id', user.id);
        resgatesCount = count || 0;
      } catch (error) {
        console.log('Erro ao buscar resgates:', error);
        resgatesCount = 0;
      }

      const finalStats = {
        saldoPontos: clienteData?.saldo_pontos || 0,
        totalGanhos: clienteData?.total_pontos_ganhos || 0,
        totalGastos: clienteData?.total_pontos_gastos || 0,
        pedidosEnviados: pedidosCount || 0,
        premiosDisponiveis: premiosCount || 0,
        resgatesRealizados: resgatesCount || 0
      }

      console.log('📈 Estatísticas finais calculadas:', finalStats)
      setStats(finalStats)

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [user?.id]) // Apenas user.id como dependência

  // Carregar dados quando user.id muda
  useEffect(() => {
    if (user?.id) {
      loadStats()
    }
  }, [user?.id]) // Remover loadStats da dependência

  // Reagir ao trigger de refresh global
  useEffect(() => {
    if (user?.id && refreshTrigger > 0) {
      loadStats()
    }
  }, [refreshTrigger, user?.id]) // Remover loadStats da dependência

  const refreshStats = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
    toast.success('Dados atualizados!')
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Loading />
        </LoadingContainer>
      </Container>
    )
  }

  return (
    <Container>
      <MainContent>
        <WelcomeCard style={{ background: '#fff', color: '#222', border: 'none', boxShadow: 'none', marginBottom: 32 }}>
          <WelcomeTitle style={{ color: '#222', fontSize: 22, marginBottom: 8 }}>Pontos Disponíveis</WelcomeTitle>
          <DashboardTable>
            <tbody>
              <tr>
                <DashboardTh>Pontos Disponíveis</DashboardTh>
                <DashboardTd>{stats.saldoPontos.toLocaleString()}</DashboardTd>
              </tr>
            </tbody>
          </DashboardTable>
        </WelcomeCard>
        {stats.resgatesRealizados > 0 && (
          <MeusResgates usuario={user} onClose={() => { }} showAsSection={true} />
        )}
        {/* Removido ActionGrid de atalhos */}
      </MainContent>
    </Container>
  )
}

export default DashboardFast
