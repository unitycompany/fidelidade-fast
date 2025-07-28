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
import ClienteDetalhes from './ClienteDetalhes';

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
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #A91918, #8B1510);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-out;
  
  h1 {
    font-family: 'Urbanist', sans-serif;
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  
  p {
    opacity: 0.9;
    font-size: 1.1rem;
    margin: 0;
  }
`;

// Seção de filtros e exportação
const FiltersSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: end;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-weight: 600;
    color: #4a5568;
    font-size: 0.9rem;
  }
  
  input {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: #A91918;
      box-shadow: 0 0 0 3px rgba(169, 25, 24, 0.1);
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#A91918'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
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
  color: #4a5568;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  color: ${props => props.color || '#A91918'};
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const StatSubtitle = styled.p`
  color: #718096;
  font-size: 0.85rem;
  margin: 0;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #A91918, #8B1510);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(169, 25, 24, 0.3);
    }
  ` : props.variant === 'success' ? `
    background: linear-gradient(135deg, #28a745, #20803d);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }
  ` : `
    background: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #edf2f7;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.6s ease-out 0.3s both;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  h2 {
    color: #A91918;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    margin: 0;
    font-family: 'Urbanist', sans-serif;
    font-weight: 700;
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
  background: #f8fafc;
  color: #4a5568;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
`;

const Tr = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8fafc;
  }
`;

const ClickableRow = styled(Tr)`
  &:hover {
    background: #e3f2fd;
    transform: translateX(2px);
  }
`;

function AdminEstatisticasNovo() {
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
    const [exporting, setExporting] = useState(false);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);

    // Filtros para exportação
    const [filters, setFilters] = useState({
        dataInicio: '',
        dataFim: '',
        tipoRelatorio: 'clientes' // clientes, resgates, pontos
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);

            // Total de clientes
            const { count: totalClientes } = await supabase
                .from('clientes_fast')
                .select('*', { count: 'exact', head: true });

            // Total de pontos disponíveis
            const { data: pontosData } = await supabase
                .from('clientes_fast')
                .select('saldo_pontos');

            const totalPontos = pontosData?.reduce((sum, cliente) =>
                sum + (cliente.saldo_pontos || 0), 0) || 0;

            // Total de resgates
            const { count: totalResgates } = await supabase
                .from('resgates')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'confirmado');

            // Prêmios ativos
            const { count: premiosAtivos } = await supabase
                .from('premios')
                .select('*', { count: 'exact', head: true })
                .eq('ativo', true);

            // Resgates últimos 30 dias
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - 30);

            const { count: resgatesUltimos30Dias } = await supabase
                .from('resgates')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'confirmado')
                .gte('created_at', dataLimite.toISOString());

            // Pontos ganhos últimos 30 dias
            const { data: pontosRecentes } = await supabase
                .from('historico_pontos')
                .select('pontos')
                .eq('tipo', 'ganho')
                .gte('created_at', dataLimite.toISOString());

            const pontosUltimos30Dias = pontosRecentes?.reduce((sum, item) =>
                sum + (item.pontos || 0), 0) || 0;

            // Clientes ativos (que enviaram pelo menos 1 nota)
            const { count: clientesAtivos } = await supabase
                .from('pedidos_fast')
                .select('cliente_id', { count: 'exact', head: true });

            // Valor médio dos resgates
            const { data: resgatesValor } = await supabase
                .from('resgates')
                .select('pontos_utilizados')
                .eq('status', 'confirmado');

            const valorMedioResgates = resgatesValor?.length > 0
                ? resgatesValor.reduce((sum, resgate) => sum + (resgate.pontos_utilizados || 0), 0) / resgatesValor.length
                : 0;

            setStats({
                totalClientes: totalClientes || 0,
                totalPontos,
                totalResgates: totalResgates || 0,
                premiosAtivos: premiosAtivos || 0,
                resgatesUltimos30Dias: resgatesUltimos30Dias || 0,
                pontosUltimos30Dias,
                clientesAtivos: clientesAtivos || 0,
                valorMedioResgates: Math.round(valorMedioResgates)
            });

            // Top clientes
            const { data: topClientesData } = await supabase
                .from('clientes_fast')
                .select('nome, email, saldo_pontos, total_pontos_ganhos')
                .order('total_pontos_ganhos', { ascending: false })
                .limit(5);

            setTopClientes(topClientesData || []);

            // Prêmios mais populares
            const { data: premiosData } = await supabase
                .from('resgates')
                .select(`
                    premio_id,
                    premios (nome)
                `)
                .eq('status', 'confirmado');

            // Contar popularidade dos prêmios
            const premiosCount = {};
            premiosData?.forEach(resgate => {
                const premioNome = resgate.premios?.nome;
                if (premioNome) {
                    premiosCount[premioNome] = (premiosCount[premioNome] || 0) + 1;
                }
            });

            const premiosPopularesArray = Object.entries(premiosCount)
                .map(([nome, count]) => ({ nome, resgates: count }))
                .sort((a, b) => b.resgates - a.resgates)
                .slice(0, 5);

            setPremiosPopulares(premiosPopularesArray);

        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            toast.error('Erro ao carregar estatísticas');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = async () => {
        try {
            setExporting(true);

            let data = [];
            let filename = '';
            let headers = [];

            const { dataInicio, dataFim, tipoRelatorio } = filters;

            // Construir filtros de data
            let query = supabase;
            let whereClause = '';

            if (dataInicio && dataFim) {
                whereClause = `created_at >= '${dataInicio}' AND created_at <= '${dataFim} 23:59:59'`;
            }

            switch (tipoRelatorio) {
                case 'clientes':
                    const { data: clientesData } = await supabase
                        .from('clientes_fast')
                        .select(`
                            nome,
                            email,
                            telefone,
                            saldo_pontos,
                            total_pontos_ganhos,
                            total_pontos_gastos,
                            created_at
                        `)
                        .order('created_at', { ascending: false });

                    data = clientesData || [];
                    filename = 'clientes_fast';
                    headers = ['Nome', 'Email', 'Telefone', 'Saldo Pontos', 'Total Ganho', 'Total Gasto', 'Data Cadastro'];
                    break;

                case 'resgates':
                    let resgatesQuery = supabase
                        .from('resgates')
                        .select(`
                            created_at,
                            pontos_utilizados,
                            status,
                            clientes_fast (nome, email),
                            premios (nome, pontos_necessarios)
                        `);

                    if (dataInicio && dataFim) {
                        resgatesQuery = resgatesQuery
                            .gte('created_at', dataInicio)
                            .lte('created_at', dataFim + ' 23:59:59');
                    }

                    const { data: resgatesData } = await resgatesQuery.order('created_at', { ascending: false });

                    data = resgatesData?.map(resgate => ({
                        data: new Date(resgate.created_at).toLocaleDateString('pt-BR'),
                        cliente: resgate.clientes_fast?.nome || '',
                        email: resgate.clientes_fast?.email || '',
                        premio: resgate.premios?.nome || '',
                        pontos_utilizados: resgate.pontos_utilizados,
                        status: resgate.status
                    })) || [];

                    filename = 'resgates_fast';
                    headers = ['Data', 'Cliente', 'Email', 'Prêmio', 'Pontos Utilizados', 'Status'];
                    break;

                case 'pontos':
                    let pontosQuery = supabase
                        .from('historico_pontos')
                        .select(`
                            created_at,
                            pontos,
                            tipo,
                            descricao,
                            clientes_fast (nome, email)
                        `);

                    if (dataInicio && dataFim) {
                        pontosQuery = pontosQuery
                            .gte('created_at', dataInicio)
                            .lte('created_at', dataFim + ' 23:59:59');
                    }

                    const { data: pontosData } = await pontosQuery.order('created_at', { ascending: false });

                    data = pontosData?.map(ponto => ({
                        data: new Date(ponto.created_at).toLocaleDateString('pt-BR'),
                        cliente: ponto.clientes_fast?.nome || '',
                        email: ponto.clientes_fast?.email || '',
                        pontos: ponto.pontos,
                        tipo: ponto.tipo,
                        descricao: ponto.descricao
                    })) || [];

                    filename = 'historico_pontos_fast';
                    headers = ['Data', 'Cliente', 'Email', 'Pontos', 'Tipo', 'Descrição'];
                    break;
            }

            if (data.length === 0) {
                toast.error('Nenhum dado encontrado para exportar');
                return;
            }

            // Converter para CSV
            const csvContent = [
                headers.join(','),
                ...data.map(row =>
                    headers.map(header => {
                        const key = header.toLowerCase().replace(/\s+/g, '_');
                        const value = typeof row === 'object' ? Object.values(row)[headers.indexOf(header)] : row[key];
                        return `"${String(value || '').replace(/"/g, '""')}"`;
                    }).join(',')
                )
            ].join('\n');

            // Download do arquivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Relatório exportado com sucesso!');

        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            toast.error('Erro ao exportar relatório');
        } finally {
            setExporting(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <Container>
                <Header>
                    <h1>
                        <FiBarChart2 />
                        Carregando Estatísticas...
                    </h1>
                </Header>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <h1>
                    <FiBarChart2 />
                    Estatísticas do Sistema
                </h1>
                <p>Relatórios e métricas do programa de fidelidade</p>
            </Header>

            {/* Filtros e Exportação */}
            <FiltersSection>
                <FilterGroup>
                    <label>Data Início</label>
                    <input
                        type="date"
                        value={filters.dataInicio}
                        onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                    />
                </FilterGroup>

                <FilterGroup>
                    <label>Data Fim</label>
                    <input
                        type="date"
                        value={filters.dataFim}
                        onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                    />
                </FilterGroup>

                <FilterGroup>
                    <label>Tipo de Relatório</label>
                    <select
                        value={filters.tipoRelatorio}
                        onChange={(e) => handleFilterChange('tipoRelatorio', e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    >
                        <option value="clientes">Clientes</option>
                        <option value="resgates">Resgates</option>
                        <option value="pontos">Histórico de Pontos</option>
                    </select>
                </FilterGroup>

                <Button
                    variant="success"
                    onClick={exportToCSV}
                    disabled={exporting}
                >
                    <FiDownload />
                    {exporting ? 'Exportando...' : 'Exportar CSV'}
                </Button>

                <Button onClick={loadStats} disabled={loading}>
                    <FiRefreshCw />
                    Atualizar
                </Button>
            </FiltersSection>

            {/* Grid de Estatísticas */}
            <StatsGrid>
                <StatCard color="#3182ce">
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

                <StatCard color="#38a169">
                    <StatHeader>
                        <StatIcon color="#38a169">
                            <FiDollarSign />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Total de Pontos</StatTitle>
                            <StatValue color="#38a169">{stats.totalPontos.toLocaleString()}</StatValue>
                            <StatSubtitle>Disponíveis para resgate</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#d69e2e">
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

                <StatCard color="#805ad5">
                    <StatHeader>
                        <StatIcon color="#805ad5">
                            <FiTarget />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Prêmios Ativos</StatTitle>
                            <StatValue color="#805ad5">{stats.premiosAtivos}</StatValue>
                            <StatSubtitle>Disponíveis para resgate</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#e53e3e">
                    <StatHeader>
                        <StatIcon color="#e53e3e">
                            <FiTrendingUp />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Resgates (30 dias)</StatTitle>
                            <StatValue color="#e53e3e">{stats.resgatesUltimos30Dias}</StatValue>
                            <StatSubtitle>Últimos 30 dias</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#00b4d8">
                    <StatHeader>
                        <StatIcon color="#00b4d8">
                            <FiActivity />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Pontos (30 dias)</StatTitle>
                            <StatValue color="#00b4d8">{stats.pontosUltimos30Dias.toLocaleString()}</StatValue>
                            <StatSubtitle>Ganhos recentes</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#f56565">
                    <StatHeader>
                        <StatIcon color="#f56565">
                            <FiUsers />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Clientes Ativos</StatTitle>
                            <StatValue color="#f56565">{stats.clientesAtivos}</StatValue>
                            <StatSubtitle>Com notas enviadas</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>

                <StatCard color="#9f7aea">
                    <StatHeader>
                        <StatIcon color="#9f7aea">
                            <FiCalendar />
                        </StatIcon>
                        <StatContent>
                            <StatTitle>Média de Resgates</StatTitle>
                            <StatValue color="#9f7aea">{stats.valorMedioResgates.toLocaleString()}</StatValue>
                            <StatSubtitle>Pontos por resgate</StatSubtitle>
                        </StatContent>
                    </StatHeader>
                </StatCard>
            </StatsGrid>

            {/* Top Clientes */}
            <Section>
                <SectionHeader>
                    <h2>
                        <FiUsers />
                        Top Clientes
                    </h2>
                </SectionHeader>

                <Table>
                    <thead>
                        <tr>
                            <Th>Cliente</Th>
                            <Th>Email</Th>
                            <Th>Pontos Atuais</Th>
                            <Th>Total Ganho</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {topClientes.map((cliente, index) => (
                            <ClickableRow
                                key={index}
                                onClick={() => setClienteSelecionado(cliente)}
                                title="Clique para ver detalhes completos"
                            >
                                <Td>{cliente.nome}</Td>
                                <Td>{cliente.email}</Td>
                                <Td>{(cliente.saldo_pontos || 0).toLocaleString()}</Td>
                                <Td>{(cliente.total_pontos_ganhos || 0).toLocaleString()}</Td>
                            </ClickableRow>
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
                            <Th>Total de Resgates</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {premiosPopulares.map((premio, index) => (
                            <Tr key={index}>
                                <Td>{premio.nome}</Td>
                                <Td>{premio.resgates}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            </Section>

            {/* Modal de detalhes do cliente */}
            {clienteSelecionado && (
                <ClienteDetalhes
                    cliente={clienteSelecionado}
                    onClose={() => setClienteSelecionado(null)}
                />
            )}
        </Container>
    );
}

export default AdminEstatisticasNovo;
