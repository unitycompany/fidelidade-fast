import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiSearch, FiCheck, FiClock, FiUser, FiGift, FiEye, FiEdit3, FiFilter, FiShield } from 'react-icons/fi';
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

const TableScroll = styled.div`
  max-height: 65vh;
  overflow-y: auto;
`;

const TableHeader = styled.div`
  background: ${props => props.theme.colors.gradientPrimary};
  color: white;
  padding: 1rem 1.5rem;
  display: grid;
  grid-template-columns: 160px 1.1fr 1.1fr 140px 110px 220px 140px;
  gap: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 2;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const TableRow = styled.div`
  padding: 1rem 1.5rem;
  display: grid;
  grid-template-columns: 160px 1.1fr 1.1fr 140px 110px 220px 140px;
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

const Cell = styled.div`
  min-width: 0; /* allow text-overflow */
`;

const CellTitle = styled.div`
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CellSub = styled.div`
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CellRight = styled.div`
  text-align: right;
  font-weight: 600;
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
  max-width: 880px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${fadeInUp} 0.3s ease-out;
  
  h3 {
    color: ${props => props.theme.colors.text};
    margin-bottom: 1rem;
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(360px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: ${props => props.theme.colors.gray50};
  border: 1px solid ${props => props.theme.colors.gray100};
  padding: 1rem;
  border-radius: 8px;
`;

const SectionTitle = styled.div`
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
`;

const KV = styled.div`
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 0.75rem 1rem;
  align-items: baseline;
`;

const K = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  text-align: right;
`;

const V = styled.div`
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  word-break: normal;
  overflow-wrap: break-word;
  white-space: normal;
  min-width: 0;
  line-height: 1.4;
`;

const CodeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray200};
  background: ${props => props.theme.colors.gray50};
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  letter-spacing: 2px;
`;

const DetailsTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  margin-top: 0.75rem;
`;

const SectionHeaderCell = styled.td`
  background: ${props => props.theme.colors.gray50};
  border: 1px solid ${props => props.theme.colors.gray100};
  padding: 0.6rem 0.9rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-radius: 8px;
`;

const KeyCell = styled.td`
  width: 180px;
  color: ${props => props.theme.colors.textSecondary};
  text-align: right;
  padding: 0.5rem 0.75rem;
  vertical-align: top;
`;

const ValCell = styled.td`
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  line-height: 1.45;
  word-break: normal;
  overflow-wrap: break-word;
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

const Chip = styled.span`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #0b5;
  background: rgba(16, 185, 129, 0.1);
`;

// (removido botão pequeno de ícone)

const InfoBanner = styled.div`
  background: #fff8e1;
  color: #7a5d00;
  border: 1px solid #ffe58f;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
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
  const [confirmCpfModal, setConfirmCpfModal] = useState({ open: false, resgate: null, cpf: '' });
  const cpfInputRef = useRef(null);

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
            telefone,
            cpf_cnpj
                    )
                `)
        .order('created_at', { ascending: false });

      if (resgatesError) throw resgatesError;

      // Formatar dados para o admin
      const resgatesFormatados = resgatesData?.map(resgate => {
        // Calcular dias desde o resgate
        const dataResgate = new Date(resgate.created_at);
        const hoje = new Date();
        const diferenca = hoje.getTime() - dataResgate.getTime();
        const diasDesdeResgate = Math.floor(diferenca / (1000 * 3600 * 24));

        return {
          id: resgate.id,
          codigo_resgate: resgate.codigo_resgate || `RES-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${resgate.id.substring(0, 4).toUpperCase()}`, // Gerar código temporário se não existir
          data_resgate: resgate.created_at,
          coletado: resgate.coletado || false,
          data_coleta: resgate.data_coleta,
          gerente_retirada: resgate.gerente_retirada,
          usuario_retirada_id: resgate.usuario_retirada_id,
          pontos_utilizados: resgate.pontos_utilizados,
          status: resgate.status,
          dias_desde_resgate: diasDesdeResgate,
          // Dados do cliente
          cliente_nome: resgate.clientes_fast.nome,
          cliente_email: resgate.clientes_fast.email,
          cliente_telefone: resgate.clientes_fast.telefone,
          cliente_cpf: resgate.clientes_fast.cpf_cnpj,
          // Dados do prêmio
          premio_nome: resgate.premios_catalogo.nome,
          premio_categoria: resgate.premios_catalogo.categoria,
          premio_descricao: resgate.premios_catalogo.descricao,
          premio_pontos: resgate.premios_catalogo.pontos_necessarios,
          // Status formatado
          status_retirada: resgate.coletado ? 'Retirado' : 'Aguardando Retirada'
        };
      }) || [];

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

  const somenteDigitos = (v) => (v || '').toString().replace(/\D/g, '');

  const formatCpf = (v) => {
    const digits = somenteDigitos(v).slice(0, 11);
    const parts = [];
    if (digits.length > 0) parts.push(digits.slice(0, 3));
    if (digits.length > 3) parts.push(digits.slice(3, 6));
    if (digits.length > 6) parts.push(digits.slice(6, 9));
    const rest = digits.slice(9, 11);
    let out = '';
    if (parts.length) out = parts.join('.');
    if (rest) out += (out ? '-' : '') + rest;
    return out;
  };

  // (removida dica de CPF final)

  const normalizeRetiradaStr = (txt) => {
    if (!txt) return '';
    let out = String(txt);
    // Remove repetições como "| Loja | Loja |"
    out = out.replace(/\s*\|\s*Loja\s*/gi, ' | ');
    out = out.replace(/\s*\|\s*\|\s*/g, ' | ');
    return out.replace(/\s{2,}/g, ' ').replace(/^\s*\|\s*|\s*\|\s*$/g, '').trim();
  };

  const abrirConfirmacaoCPF = (resgate) => {
    setConfirmCpfModal({ open: true, resgate, cpf: '' });
  };

  const confirmarEntregaComCPF = async () => {
    const esperado = somenteDigitos(confirmCpfModal.resgate?.cliente_cpf);
    const informado = somenteDigitos(confirmCpfModal.cpf);
    if (!esperado) {
      toast.error('CPF do cliente não está cadastrado. Não é possível validar.');
      return;
    }
    if (!informado) {
      toast.error('Digite o CPF do titular da conta que resgatou.');
      return;
    }
    if (informado !== esperado) {
      toast.error('CPF não confere com a conta que realizou o resgate.');
      return;
    }
    // OK: prosseguir com a entrega
    setConfirmCpfModal(prev => ({ ...prev, open: false }));
    await marcarComoResgatado(confirmCpfModal.resgate.codigo_resgate);
  };

  useEffect(() => {
    if (confirmCpfModal.open) {
      // Focus no input do CPF ao abrir
      setTimeout(() => cpfInputRef.current?.focus(), 0);
    }
  }, [confirmCpfModal.open]);

  // Utilitário para formatar retirada: "Nome | Cidade/UF"
  const formatRetiradaInfo = (gerente, loja) => {
    const nome = (gerente || '').toString().trim();
    const lojaClean = (loja || '').toString().trim();
    if (!nome && !lojaClean) return null;
    if (!lojaClean) return nome || null;
    const lojaSemPrefixo = lojaClean.replace(/^Loja\s*\|?\s*/i, '').trim();
    return `${nome}${nome && lojaSemPrefixo ? ' | ' : ''}${lojaSemPrefixo}`;
  };

  const marcarComoResgatado = async (codigo) => {
    try {
      setProcessando(true);

      // Preparar informações do gerente e loja
  const gerenteNome = user?.nome || 'Gerente';
  const lojaNome = user?.loja_nome || user?.lojas?.nome || '';
  const gerenteInfo = formatRetiradaInfo(gerenteNome, lojaNome) || gerenteNome;

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
      <Header>
        <h1>
          <FiGift /> Resgates de Prêmios (Admin)
        </h1>
        <p>Gerencie as entregas com validação por CPF e mantenha a auditoria em dia.</p>
      </Header>

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

      <InfoBanner>
        <FiShield /> Antes de entregar: confirme o CPF do titular e peça um comprovante de CPF.
      </InfoBanner>

      <ResgatesTable>
        <TableScroll>
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
              <Cell style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                <CodigoDestaque style={{ margin: 0, padding: '0.5rem', display: 'inline-block' }}>
                  <div className="codigo" style={{ fontSize: '0.9rem' }}>
                    {resgate.codigo_resgate}
                  </div>
                </CodigoDestaque>
              </Cell>

              <Cell>
                <CellTitle title={resgate.cliente_nome}>{resgate.cliente_nome}</CellTitle>
                <CellSub title={resgate.cliente_email}>{resgate.cliente_email}</CellSub>
              </Cell>

              <Cell>
                <CellTitle title={resgate.premio_nome}>{resgate.premio_nome}</CellTitle>
                <CellSub>
                  {resgate.premio_categoria && (<Chip>{resgate.premio_categoria}</Chip>)}
                </CellSub>
              </Cell>

              <Cell>
                <CellTitle>{new Date(resgate.data_resgate).toLocaleDateString('pt-BR')}</CellTitle>
                <CellSub>{resgate.dias_desde_resgate} dias atrás</CellSub>
              </Cell>

              <CellRight>
                {Number(resgate.pontos_utilizados || 0).toLocaleString('pt-BR')} pts
              </CellRight>

              <Cell>
                <StatusBadge status={resgate.coletado ? 'resgatado' : 'pendente'}>
                  {resgate.status_retirada}
                </StatusBadge>
                {!resgate.coletado && (
                  <div style={{ fontSize: '0.75rem', color: '#8a6d3b', marginTop: '0.25rem' }}>
                    Exija documento com CPF para validar.
                  </div>
                )}
                {resgate.coletado && resgate.data_coleta && (
                  <CellSub>
                    <span style={{ fontWeight: 500 }}>Entregue em:</span> {new Date(resgate.data_coleta).toLocaleDateString('pt-BR')}
                  </CellSub>
                )}
                {resgate.coletado && resgate.gerente_retirada && (
                  <CellSub>
                    <span style={{ fontWeight: 500 }}>Retirado por:</span> {normalizeRetiradaStr(resgate.gerente_retirada)}
                  </CellSub>
                )}
              </Cell>

              <Cell style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                    onClick={() => abrirConfirmacaoCPF(resgate)}
                    disabled={processando}
                  >
                    <FiCheck />
                    Entregar
                  </ActionButton>
                )}
              </Cell>
            </TableRow>
          ))}

          {resgatesFiltrados.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              Nenhum resgate encontrado com os filtros aplicados.
            </div>
          )}
        </TableScroll>
      </ResgatesTable>

      {/* Modal de Detalhes */}
      {modalDetalhes && (
        <Modal onClick={() => setModalDetalhes(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3>Detalhes do Resgate</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <CodeBadge>{modalDetalhes.codigo_resgate}</CodeBadge>
            </div>

            <DetailsTable>
              <tbody>
                <tr>
                  <SectionHeaderCell colSpan={2}>Cliente</SectionHeaderCell>
                </tr>
                <tr>
                  <KeyCell>Nome</KeyCell>
                  <ValCell>{modalDetalhes.cliente_nome}</ValCell>
                </tr>
                <tr>
                  <KeyCell>Email</KeyCell>
                  <ValCell>{modalDetalhes.cliente_email}</ValCell>
                </tr>
                <tr>
                  <KeyCell>Telefone</KeyCell>
                  <ValCell>{modalDetalhes.cliente_telefone || 'Não informado'}</ValCell>
                </tr>

                <tr>
                  <SectionHeaderCell colSpan={2}>Prêmio</SectionHeaderCell>
                </tr>
                <tr>
                  <KeyCell>Nome</KeyCell>
                  <ValCell>{modalDetalhes.premio_nome}</ValCell>
                </tr>
                <tr>
                  <KeyCell>Categoria</KeyCell>
                  <ValCell>{modalDetalhes.premio_categoria}</ValCell>
                </tr>
                <tr>
                  <KeyCell>Descrição</KeyCell>
                  <ValCell>{modalDetalhes.premio_descricao}</ValCell>
                </tr>

                <tr>
                  <SectionHeaderCell colSpan={2}>Resumo</SectionHeaderCell>
                </tr>
                <tr>
                  <KeyCell>Resgate</KeyCell>
                  <ValCell>{new Date(modalDetalhes.data_resgate).toLocaleString('pt-BR')}</ValCell>
                </tr>
                <tr>
                  <KeyCell>Pontos</KeyCell>
                  <ValCell>{Number(modalDetalhes.pontos_utilizados || 0).toLocaleString('pt-BR')} pts</ValCell>
                </tr>
                <tr>
                  <KeyCell>Status</KeyCell>
                  <ValCell>{modalDetalhes.status_retirada}</ValCell>
                </tr>
                {modalDetalhes.coletado && modalDetalhes.data_coleta && (
                  <tr>
                    <KeyCell>Entregue</KeyCell>
                    <ValCell>{new Date(modalDetalhes.data_coleta).toLocaleString('pt-BR')}</ValCell>
                  </tr>
                )}
                {modalDetalhes.coletado && modalDetalhes.gerente_retirada && (
                  <tr>
                    <KeyCell>Retirado por</KeyCell>
                    <ValCell>{normalizeRetiradaStr(modalDetalhes.gerente_retirada)}</ValCell>
                  </tr>
                )}
                {modalDetalhes.observacoes_admin && (
                  <tr>
                    <KeyCell>Observações</KeyCell>
                    <ValCell>{modalDetalhes.observacoes_admin}</ValCell>
                  </tr>
                )}
              </tbody>
            </DetailsTable>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
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

      {/* Modal de confirmação por CPF */}
      {confirmCpfModal.open && confirmCpfModal.resgate && (
        <Modal onClick={() => setConfirmCpfModal({ open: false, resgate: null, cpf: '' })}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3>Confirmar entrega do prêmio</h3>
            <p style={{ color: '#666', lineHeight: 1.5 }}>
              Para concluir a entrega, confirme o CPF do titular da conta que realizou o resgate.
              <br />
              <strong>Atenção:</strong> Solicite ao cliente um comprovante de CPF da conta que resgatou o prêmio.
            </p>
            <div style={{ margin: '1rem 0' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '.25rem' }}>CPF do titular</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                ref={cpfInputRef}
                value={confirmCpfModal.cpf}
                onChange={(e) => setConfirmCpfModal(prev => ({ ...prev, cpf: formatCpf(e.target.value) }))}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmarEntregaComCPF(); }}
                style={{ width: '100%', padding: '.75rem 1rem', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
              <ActionButton variant="info" onClick={() => setConfirmCpfModal({ open: false, resgate: null, cpf: '' })}>Cancelar</ActionButton>
              <ActionButton variant="success" onClick={confirmarEntregaComCPF}><FiCheck /> Confirmar e Entregar</ActionButton>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default AdminResgates;
