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
import * as XLSX from 'xlsx';
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
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, #A91918, #8B1510);
  color: white;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-out;
  
  h1 {
    font-family: 'Urbanist', sans-serif;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    
    @media (min-width: 768px) {
      font-size: 2.2rem;
      gap: 1rem;
    }
  }
  
  p {
    opacity: 0.9;
    font-size: 1rem;
    margin: 0;
    
    @media (min-width: 768px) {
      font-size: 1.1rem;
    }
  }
  
  @media (min-width: 768px) {
    padding: 2rem;
    margin-bottom: 2rem;
  }
`;

// Seção de filtros e exportação - REMOVIDO
// FilterGroup - REMOVIDO
// FiltersSection - REMOVIDO

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 1.25rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-left: 2px solid ${props => props.color || '#A91918'};
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (min-width: 768px) {
    padding: 1.5rem;
    min-height: 140px;
  }
  
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
  width: 40px;
  height: 40px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  animation: ${pulse} 2s infinite;
  flex-shrink: 0;
  
  @media (min-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
`;

const StatContent = styled.div`
  flex: 1;
  margin-left: 0.75rem;
  min-width: 0;
  
  @media (min-width: 768px) {
    margin-left: 1rem;
  }
`;

const StatTitle = styled.h3`
  color: #4a5568;
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
  }
`;

const StatValue = styled.div`
  color: ${props => props.color || '#A91918'};
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.1rem;
  line-height: 1;
  word-break: break-all;
  
  @media (min-width: 768px) {
    font-size: 2rem;
    margin-bottom: 0.25rem;
  }
`;

const StatSubtitle = styled.p`
  color: #718096;
  font-size: 0.75rem;
  margin: 0;
  line-height: 1.2;
  
  @media (min-width: 768px) {
    font-size: 0.85rem;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  font-size: 0.9rem;
  
  @media (min-width: 768px) {
    padding: 0.75rem 1.5rem;
    width: auto;
    font-size: 1rem;
  }
  
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
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.6s ease-out 0.3s both;
  
  @media (min-width: 768px) {
    padding: 2rem;
    margin-bottom: 2rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 0;
  }
  
  h2 {
    color: #A91918;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.2rem;
    margin: 0;
    font-family: 'Urbanist', sans-serif;
    font-weight: 700;
    
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 767px) {
    -webkit-overflow-scrolling: touch;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
  
  @media (max-width: 767px) {
    min-width: 500px;
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  background: #f8fafc;
  color: #4a5568;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.9rem;
  white-space: nowrap;
  
  @media (min-width: 768px) {
    padding: 1rem;
    font-size: 1rem;
  }
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
  font-size: 0.9rem;
  
  @media (min-width: 768px) {
    padding: 1rem;
    font-size: 1rem;
  }
`;

const Tr = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8fafc;
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

  const [premiosPopulares, setPremiosPopulares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const exportToExcel = async () => {
    try {
      setLoading(true);
      toast.loading('Gerando relatório Excel...');

      // Buscar dados detalhados para o relatório
      const { data: clientesData } = await supabase
        .from('clientes_fast')
        .select('nome, email, telefone, saldo_pontos, created_at');

      const { data: resgatesData } = await supabase
        .from('resgates')
        .select(`
                    codigo_resgate,
                    pontos_utilizados,
                    coletado,
                    created_at,
                    data_coleta,
                    gerente_retirada,
                    clientes_fast (nome, email),
                    premios_catalogo (nome, categoria)
                `);

      const { data: premiosData } = await supabase
        .from('premios_catalogo')
        .select('nome, categoria, pontos_necessarios, ativo');

      // Criar planilhas
      const wb = XLSX.utils.book_new();

      // Planilha 1: Resumo Estatísticas
      const statsData = [
        ['Estatística', 'Valor'],
        ['Total de Clientes', stats.totalClientes],
        ['Total de Pontos Disponíveis', stats.totalPontos],
        ['Total de Resgates', stats.totalResgates],
        ['Prêmios Ativos', stats.premiosAtivos],
        ['Resgates (30 dias)', stats.resgatesUltimos30Dias],
        ['Pontos Ganhos (30 dias)', stats.pontosUltimos30Dias],
        ['Clientes Ativos', stats.clientesAtivos],
        ['Média Pontos por Resgate', stats.valorMedioResgates]
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Estatísticas');

      // Planilha 2: Clientes
      const clientesFormatted = clientesData?.map(cliente => ({
        'Nome': cliente.nome,
        'Email': cliente.email,
        'Telefone': cliente.telefone || 'Não informado',
        'Saldo de Pontos': cliente.saldo_pontos || 0,
        'Data de Cadastro': new Date(cliente.created_at).toLocaleDateString('pt-BR')
      })) || [];
      const ws2 = XLSX.utils.json_to_sheet(clientesFormatted);
      XLSX.utils.book_append_sheet(wb, ws2, 'Clientes');

      // Planilha 3: Resgates
      const resgatesFormatted = resgatesData?.map(resgate => ({
        'Código': resgate.codigo_resgate,
        'Cliente': resgate.clientes_fast?.nome,
        'Email Cliente': resgate.clientes_fast?.email,
        'Prêmio': resgate.premios_catalogo?.nome,
        'Categoria': resgate.premios_catalogo?.categoria,
        'Pontos Utilizados': resgate.pontos_utilizados,
        'Status': resgate.coletado ? 'Retirado' : 'Aguardando',
        'Data Resgate': new Date(resgate.created_at).toLocaleDateString('pt-BR'),
        'Data Entrega': resgate.data_coleta ? new Date(resgate.data_coleta).toLocaleDateString('pt-BR') : 'Não entregue',
        'Responsável Entrega': resgate.gerente_retirada || 'N/A'
      })) || [];
      const ws3 = XLSX.utils.json_to_sheet(resgatesFormatted);
      XLSX.utils.book_append_sheet(wb, ws3, 'Resgates');

      // Planilha 4: Prêmios
      const premiosFormatted = premiosData?.map(premio => ({
        'Nome': premio.nome,
        'Categoria': premio.categoria,
        'Pontos Necessários': premio.pontos_necessarios,
        'Status': premio.ativo ? 'Ativo' : 'Inativo'
      })) || [];
      const ws4 = XLSX.utils.json_to_sheet(premiosFormatted);
      XLSX.utils.book_append_sheet(wb, ws4, 'Prêmios');

      // Planilha 5: Prêmios Populares
      const premiosPopularesFormatted = premiosPopulares.map(premio => ({
        'Prêmio': premio.nome,
        'Total de Resgates': premio.resgates
      }));
      const ws5 = XLSX.utils.json_to_sheet(premiosPopularesFormatted);
      XLSX.utils.book_append_sheet(wb, ws5, 'Prêmios Populares');

      // Gerar e baixar arquivo
      const fileName = `Sistema_Fidelidade_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.dismiss();
      toast.success('Relatório Excel gerado com sucesso!');

    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.dismiss();
      toast.error('Erro ao gerar relatório Excel');
    } finally {
      setLoading(false);
    }
  };

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
        .select('*', { count: 'exact', head: true });

      // Prêmios ativos
      const { count: premiosAtivos } = await supabase
        .from('premios_catalogo')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Resgates últimos 30 dias
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);

      const { count: resgatesUltimos30Dias } = await supabase
        .from('resgates')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dataLimite.toISOString());

      // Pontos ganhos últimos 30 dias
      const { data: pontosRecentes } = await supabase
        .from('historico_pontos')
        .select('pontos')
        .eq('tipo', 'ganho')
        .gte('created_at', dataLimite.toISOString());

      const pontosUltimos30Dias = pontosRecentes?.reduce((sum, item) =>
        sum + (item.pontos || 0), 0) || 0;

      // Clientes ativos (que enviaram pelo menos 1 nota) - contar clientes únicos
      const { data: clientesAtivosData } = await supabase
        .from('pedidos_fast')
        .select('cliente_id');

      const clientesUnicos = new Set(clientesAtivosData?.map(p => p.cliente_id) || []);
      const clientesAtivos = clientesUnicos.size;

      // Valor médio dos resgates
      const { data: resgatesValor } = await supabase
        .from('resgates')
        .select('pontos_utilizados');

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

      // Prêmios mais populares
      const { data: premiosData } = await supabase
        .from('resgates')
        .select(`
                    premio_id,
                    premios_catalogo (nome)
                `);

      // Contar popularidade dos prêmios
      const premiosCount = {};
      premiosData?.forEach(resgate => {
        const premioNome = resgate.premios_catalogo?.nome;
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

  if (loading) {
    return (
      <Container>
        <LoadingGif
          text="Carregando Estatísticas..."
          size="120px"
          mobileSize="100px"
        />
      </Container>
    );
  }

  return (
    <Container>

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

      {/* Prêmios Populares */}
      <Section>
        <SectionHeader>
          <h2>
            Prêmios Mais Populares
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button onClick={exportToExcel} disabled={loading}>
              <FiDownload />
              Exportar Excel
            </Button>
            <Button onClick={loadStats} disabled={loading}>
              <FiRefreshCw />
              Atualizar
            </Button>
          </div>
        </SectionHeader>

        <TableContainer>
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
        </TableContainer>
      </Section>
    </Container>
  );
}

export default AdminEstatisticasNovo;
