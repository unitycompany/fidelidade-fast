import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    FiBarChart2,
    FiUsers,
    FiTrendingUp,
    FiGift,
    FiDollarSign,
    FiCalendar,
    FiActivity,
    FiTarget,
    FiRefreshCw,
    FiDownload,
    FiFilter
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
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.md};
  border-left: 4px solid ${props => props.color || props.theme.colors.primary};
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out;
  animation-delay: ${props => props.$delay || '0s'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${props => props.theme.radii.lg};
  background: ${props => props.color}15;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  animation: ${pulse} 2s infinite;
`;

const StatContent = styled.div`
  flex: 1;
  margin-left: 1rem;
`;

const StatTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  color: ${props => props.color || props.theme.colors.primary};
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const StatSubtitle = styled.p`
  color: ${props => props.theme.colors.gray600};
  font-size: 0.85rem;
  margin: 0;
`;

const Section = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.lg};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.md};
  animation: ${fadeInUp} 0.6s ease-out;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  h2 {
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    margin: 0;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background: ${props => props.theme.colors.gray100};
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  border-bottom: 2px solid ${props => props.theme.colors.gray200};
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
  color: ${props => props.theme.colors.text};
`;

const Tr = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.gray50};
  }
`;

// Componentes de filtro e exportação
const FiltersSection = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    font-size: 0.9rem;
  }
  
  input {
    padding: 0.5rem;
    border: 1px solid ${props => props.theme.colors.gray300};
    border-radius: ${props => props.theme.radii.md};
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
    }
  }
`;

const ExportButton = styled(Button)`
  background: linear-gradient(135deg, #28a745, #20803d);
  
  &:hover {
    background: linear-gradient(135deg, #20803d, #1e7e34);
  }
`;

function AdminEstatisticas() {
    const [stats, setStats] = useState({
        totalClientes: 0,
        totalPontos: 0,
        totalResgates: 0,
        premiosAtivos: 0,
        resgatesUltimos30Dias: 0,
        pontosUltimos30Dias: 0,
        clientesAtivos: 0,
        valorMedioResgates: 0
    });

    const [topClientes, setTopClientes] = useState([]);
    const [premiosPopulares, setPremiosPopulares] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);

            // Total de clientes
            const { count: totalClientes } = await supabase
                .from('clientes_fast')
                .select('id', { count: 'exact', head: true });

            // Total de pontos em circulação
            const { data: pontosData } = await supabase
                .from('clientes_fast')
                .select('saldo_pontos, total_pontos_ganhos');

            const totalPontos = pontosData?.reduce((sum, cliente) =>
                sum + (parseInt(cliente.saldo_pontos) || 0), 0) || 0;

            const totalPontosGanhos = pontosData?.reduce((sum, cliente) =>
                sum + (parseInt(cliente.total_pontos_ganhos) || 0), 0) || 0;

            // Total de resgates
            const { count: totalResgates } = await supabase
                .from('resgates')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'confirmado');

            // Prêmios ativos
            const { count: premiosAtivos } = await supabase
                .from('premios_catalogo')
                .select('id', { count: 'exact', head: true })
                .eq('ativo', true);

            // Resgates últimos 30 dias
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - 30);

            const { count: resgatesUltimos30Dias } = await supabase
                .from('resgates')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'confirmado')
                .gte('created_at', dataLimite.toISOString());

            // Pontos ganhos últimos 30 dias
            const { data: pontosRecentes } = await supabase
                .from('historico_pontos')
                .select('pontos')
                .eq('tipo_operacao', 'ganho')
                .gte('created_at', dataLimite.toISOString());

            const pontosUltimos30Dias = pontosRecentes?.reduce((sum, item) =>
                sum + (item.pontos || 0), 0) || 0;

            // Clientes ativos (com atividade nos últimos 30 dias)
            const { count: clientesAtivos } = await supabase
                .from('historico_pontos')
                .select('cliente_id', { count: 'exact', head: true })
                .gte('created_at', dataLimite.toISOString());

            // Valor médio dos resgates
            const { data: resgatesValor } = await supabase
                .from('resgates')
                .select('pontos_utilizados')
                .eq('status', 'confirmado');

            const valorMedioResgates = resgatesValor?.length > 0
                ? Math.round(resgatesValor.reduce((sum, r) => sum + (r.pontos_utilizados || 0), 0) / resgatesValor.length)
                : 0;

            // Top clientes
            const { data: topClientesData } = await supabase
                .from('clientes_fast')
                .select('nome, email, total_pontos_ganhos, saldo_pontos')
                .order('total_pontos_ganhos', { ascending: false })
                .limit(10);

            // Prêmios mais populares - usando SQL nativo para evitar .group
            const { data: premiosPopularesData, error: premiosError } = await supabase
                .rpc('get_premios_populares', { limite: 5 });

            if (premiosError) {
                console.warn('Erro ao buscar prêmios populares, usando fallback:', premiosError);
                // Fallback: buscar sem agrupamento
                const { data: fallbackPremios } = await supabase
                    .from('resgates')
                    .select('premio_id, premios_catalogo(nome, categoria)')
                    .eq('status', 'confirmado')
                    .limit(10);

                // Agrupar manualmente no frontend
                const premiosCount = {};
                fallbackPremios?.forEach(resgate => {
                    const key = resgate.premio_id;
                    if (!premiosCount[key]) {
                        premiosCount[key] = {
                            premio_id: resgate.premio_id,
                            premios_catalogo: resgate.premios_catalogo,
                            total_resgates: 0
                        };
                    }
                    premiosCount[key].total_resgates++;
                });

                const premiosArray = Object.values(premiosCount)
                    .sort((a, b) => b.total_resgates - a.total_resgates)
                    .slice(0, 5);

                setPremiosPopulares(premiosArray);
            } else {
                setPremiosPopulares(premiosPopularesData || []);
            }

            setStats({
                totalClientes: totalClientes || 0,
                totalPontos,
                totalResgates: totalResgates || 0,
                premiosAtivos: premiosAtivos || 0,
                resgatesUltimos30Dias: resgatesUltimos30Dias || 0,
                pontosUltimos30Dias,
                clientesAtivos: clientesAtivos || 0,
                valorMedioResgates
            });

            setTopClientes(topClientesData || []);

        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container>
                <LoadingGif
                    text="Carregando estatísticas..."
                    size="120px"
                    mobileSize="100px"
                />
            </Container>
        );
    }

    return (
        <Container>
            {/* Estatísticas Gerais */}
            <StatsGrid>
                <StatCard color="#3182ce" $delay="0.1s">
                    <StatHeader>
                        <StatIcon color="#3182ce">
                            <FiUsers />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Total de Clientes</StatTitle>
                            <StatValue color="#3182ce">{stats.totalClientes}</StatValue>
                            <StatSubtitle>Cadastrados no sistema</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#38a169" $delay="0.2s">
                    <StatHeader>
                        <StatIcon color="#38a169">
                            <FiTrendingUp />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Pontos em Circulação</StatTitle>
                            <StatValue color="#38a169">{stats.totalPontos.toLocaleString()}</StatValue>
                            <StatSubtitle>Pontos não utilizados</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#d69e2e" $delay="0.3s">
                    <StatHeader>
                        <StatIcon color="#d69e2e">
                            <FiGift />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Total de Resgates</StatTitle>
                            <StatValue color="#d69e2e">{stats.totalResgates}</StatValue>
                            <StatSubtitle>Prêmios resgatados</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#e53e3e" $delay="0.4s">
                    <StatHeader>
                        <StatIcon color="#e53e3e">
                            <FiTarget />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Prêmios Ativos</StatTitle>
                            <StatValue color="#e53e3e">{stats.premiosAtivos}</StatValue>
                            <StatSubtitle>Disponíveis para resgate</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#805ad5" $delay="0.5s">
                    <StatHeader>
                        <StatIcon color="#805ad5">
                            <FiActivity />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Resgates (30 dias)</StatTitle>
                            <StatValue color="#805ad5">{stats.resgatesUltimos30Dias}</StatValue>
                            <StatSubtitle>Últimos 30 dias</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#319795" $delay="0.6s">
                    <StatHeader>
                        <StatIcon color="#319795">
                            <FiDollarSign />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Pontos Ganhos (30 dias)</StatTitle>
                            <StatValue color="#319795">{stats.pontosUltimos30Dias.toLocaleString()}</StatValue>
                            <StatSubtitle>Últimos 30 dias</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#dd6b20" $delay="0.7s">
                    <StatHeader>
                        <StatIcon color="#dd6b20">
                            <FiUsers />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Clientes Ativos</StatTitle>
                            <StatValue color="#dd6b20">{stats.clientesAtivos}</StatValue>
                            <StatSubtitle>Com atividade recente</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#9f7aea" $delay="0.8s">
                    <StatHeader>
                        <StatIcon color="#9f7aea">
                            <FiBarChart2 />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Valor Médio Resgates</StatTitle>
                            <StatValue color="#9f7aea">{stats.valorMedioResgates}</StatValue>
                            <StatSubtitle>Pontos por resgate</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>
            </StatsGrid>

            {/* Filtros e Exportação */}
            <FiltersSection>
                <FilterGroup>
                    <label htmlFor="dataInicio">Data Início</label>
                    <input
                        type="date"
                        id="dataInicio"
                        onChange={(e) => setDataInicio(e.target.value)}
                    />
                </FilterGroup>

                <FilterGroup>
                    <label htmlFor="dataFim">Data Fim</label>
                    <input
                        type="date"
                        id="dataFim"
                        onChange={(e) => setDataFim(e.target.value)}
                    />
                </FilterGroup>

                <ExportButton onClick={handleExport}>
                    <FiDownload />
                    Exportar CSV
                </ExportButton>
            </FiltersSection>

            {/* Top Clientes */}
            <Section>
                <SectionHeader>
                    <h2>
                        <FiUsers />
                        Top Clientes por Pontos
                    </h2>
                    <Button onClick={loadStats}>
                        <FiRefreshCw />
                        Atualizar
                    </Button>
                </SectionHeader>

                <Table>
                    <thead>
                        <tr>
                            <Th>Cliente</Th>
                            <Th>Email</Th>
                            <Th>Total Ganhos</Th>
                            <Th>Saldo Atual</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {topClientes.map((cliente, index) => (
                            <Tr key={index}>
                                <Td>{cliente.nome}</Td>
                                <Td>{cliente.email}</Td>
                                <Td>{(cliente.total_pontos_ganhos || 0).toLocaleString()} pts</Td>
                                <Td>{(cliente.saldo_pontos || 0).toLocaleString()} pts</Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            </Section>

            {/* Prêmios Populares */}
            <Section>
                <SectionHeader>
                    <h2>
                        <FiGift />
                        Prêmios Mais Populares
                    </h2>
                </SectionHeader>

                <Table>
                    <thead>
                        <tr>
                            <Th>Prêmio</Th>
                            <Th>Categoria</Th>
                            <Th>Total de Resgates</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {premiosPopulares.map((premio, index) => (
                            <Tr key={index}>
                                <Td>{premio.premios_catalogo?.nome}</Td>
                                <Td>{premio.premios_catalogo?.categoria}</Td>
                                <Td>{premio.total_resgates}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            </Section>
        </Container>
    );
}

export default AdminEstatisticas;
