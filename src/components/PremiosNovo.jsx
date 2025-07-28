import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FiGift, FiStar, FiShoppingCart, FiCheck, FiX, FiLoader, FiRefreshCw, FiCopy, FiFilter } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import { CATEGORIAS_PREMIOS } from '../utils/inicializarPremios';
import toast from 'react-hot-toast';

// Animações do AdminPanel
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled Components - Seguindo padrão do AdminPanel
const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, #cc1515 0%, #a70d0d 100%);
  color: white;
  border-radius: 5px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.2);
  animation: ${fadeInUp} 0.6s ease-out;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    color: #fff;
    gap: 1rem;
    font-weight: 700;
  }
  
  p {
    font-size: 1.2rem;
    opacity: 0.9;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`;

const SaldoContainer = styled.div`
  background: white;
  border-radius: 5px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;
`;

const SaldoValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #cc1515;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SaldoLabel = styled.div`
  font-size: 1rem;
  color: #4A5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const FilterContainer = styled.div`
  background: white;
  border-radius: 5px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
`;

const FilterTitle = styled.h3`
  color: #2D3748;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active ? 'linear-gradient(135deg, #cc1515 0%, #9b0c0c 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#2D3748'};
  border: 2px solid ${props => props.$active ? '#cc1515' : '#CBD5E0'};
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    border-color: #00000030;
    ${props => !props.$active && css`
      background: #EDF2F7;
    `}
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

const PremiosContainer = styled.div`
  background: white;
  border-radius: 5px;
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.md};
  animation: ${fadeInUp} 0.6s ease-out 0.3s both;
`;

const PremiosHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h2 {
    color: ${props => props.theme.colors.text};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: ${props => props.theme.fontWeights.semibold};
  }
`;

const PremiosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PremioCard = styled.div`
  background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 16px;
  padding: 1.8rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.8);
  
  ${props => props.$destaque && css`
    border: 2px solid #ffd700;
    box-shadow: 0 8px 32px rgba(255, 215, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08);
    
    &::before {
      content: '⭐ DESTAQUE';
      position: absolute;
      top: -1px;
      right: -1px;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #856404;
      padding: 0.3rem 0.8rem;
      border-radius: 0 16px 0 12px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }
  `}
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.theme.colors.primary};
  }
`;

const PremioHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const PremioIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #cc1515, #a70d0d);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(204, 21, 21, 0.3);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    border-radius: 14px;
    pointer-events: none;
  }
`;

const PremioInfo = styled.div`
  flex: 1;
`;

const PremioNome = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: 1.1rem;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
`;

const PremioCategoria = styled.span`
  display: inline-block;
  background: ${props => props.theme.colors.gray100};
  color: ${props => props.theme.colors.primary};
  padding: 0.25rem 0.6rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: ${props => props.theme.fontWeights.semibold};
  text-transform: capitalize;
`;

const PremioDescricao = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0.75rem 0 1rem 0;
`;

const PremioFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const PontosBadge = styled.div`
  background: linear-gradient(135deg, #38a169, #2f855a);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    border-radius: 25px;
    pointer-events: none;
  }
`;

const ResgatarButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: ${props => props.disabled ?
    'linear-gradient(135deg, #cbd5e0, #a0aec0)' :
    'linear-gradient(135deg, #cc1515, #a70d0d)'};
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 130px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    border-radius: 25px;
    pointer-events: none;
    opacity: ${props => props.disabled ? 0 : 1};
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 20px rgba(204, 21, 21, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px) scale(1.02);
  }
  
  &:disabled {
    opacity: 0.7;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.2rem;
    font-size: 0.85rem;
    min-width: 120px;
  }
`;

const Modal = styled.div`
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
  backdrop-filter: blur(5px);
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 5px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: ${props => props.theme.shadows.xl};
  animation: ${slideUp} 0.3s ease-out;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: ${props => props.theme.radii.md};
  }
`;

const ModalTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: 1.3rem;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-bottom: 1rem;
`;

const ModalText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 0.875rem;
  border: none;
  border-radius: 5px;
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$primary ? css`
    background: ${props.theme.colors.gradientPrimary};
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    }
  ` : css`
    background: ${props.theme.colors.gray400};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.gray500};
    }
  `}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textSecondary};
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.gray400};
  }
  
  h3 {
    color: ${props => props.theme.colors.text};
    margin-bottom: 1rem;
    font-weight: ${props => props.theme.fontWeights.semibold};
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const CodigoResgate = styled.div`
  background: ${props => props.theme.colors.gradientSuccess};
  color: white;
  padding: 1.5rem;
  border-radius: 5px;
  margin: 1rem 0;
  text-align: center;
  
  .codigo {
    font-size: 1.5rem;
    font-weight: ${props => props.theme.fontWeights.bold};
    margin-bottom: 0.5rem;
  }
  
  .instrucao {
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;

const CopiarButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const PremiosNovo = ({ user, onUserUpdate }) => {
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [modalResgate, setModalResgate] = useState(null);
  const [processandoResgate, setProcessandoResgate] = useState(false);
  const [codigoResgate, setCodigoResgate] = useState(null);
  const [userAtualizado, setUserAtualizado] = useState(user);

  // Função para buscar dados atualizados do usuário
  const buscarDadosUsuario = useCallback(async () => {
    if (!user?.id) return user;

    try {
      const { data, error } = await supabase
        .from('clientes_fast')
        .select('saldo_pontos, total_pontos_ganhos, total_pontos_gastos')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const dadosAtualizados = {
        ...user,
        saldo_pontos: data.saldo_pontos,
        total_pontos_ganhos: data.total_pontos_ganhos,
        total_pontos_gastos: data.total_pontos_gastos
      };

      setUserAtualizado(dadosAtualizados);

      return dadosAtualizados;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return user;
    }
  }, [user?.id]); // Apenas user.id como dependência

  // Buscar dados do usuário sempre que o user.id mudar
  useEffect(() => {
    if (user?.id) {
      buscarDadosUsuario();
    }
  }, [user?.id, buscarDadosUsuario]);

  // Listener para atualizações globais do usuário
  useEffect(() => {
    const handleUserUpdate = () => {
      console.log('📊 PremiosNovo: Recebido evento de atualização de usuário');
      if (user?.id) {
        buscarDadosUsuario();
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, [user?.id, buscarDadosUsuario]);

  const carregarPremios = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('premios_catalogo')
        .select('*')
        .eq('ativo', true);

      if (filtro !== 'todos') {
        query = query.eq('categoria', filtro);
      }

      const { data, error } = await query.order('pontos_necessarios', { ascending: true });

      if (error) throw error;

      setPremios(data || []);
    } catch (error) {
      console.error('Erro ao carregar prêmios:', error);
      toast.error('Erro ao carregar prêmios');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  // Carregar prêmios quando filtro muda
  useEffect(() => {
    carregarPremios();
  }, [filtro]); // Remover carregarPremios da dependência

  const handleResgate = async () => {
    if (!modalResgate) return;

    try {
      setProcessandoResgate(true);

      // SEMPRE buscar dados atualizados do banco antes do resgate
      const { data: clienteAtual, error: clienteError } = await supabase
        .from('clientes_fast')
        .select('saldo_pontos, total_pontos_gastos')
        .eq('id', user.id)
        .single();

      if (clienteError) throw clienteError;

      if (clienteAtual.saldo_pontos < modalResgate.pontos_necessarios) {
        toast.error('Pontos insuficientes');
        return;
      }

      // Criar resgate
      const { data: resgateData, error: resgateError } = await supabase
        .from('resgates')
        .insert([{
          cliente_id: user.id,
          premio_id: modalResgate.id,
          pontos_utilizados: modalResgate.pontos_necessarios,
          status: 'confirmado'
        }])
        .select('codigo_resgate')
        .single();

      if (resgateError) throw resgateError;

      // Calcular novos valores
      const novoSaldo = clienteAtual.saldo_pontos - modalResgate.pontos_necessarios;
      const novoTotalGastos = (clienteAtual.total_pontos_gastos || 0) + modalResgate.pontos_necessarios;

      // Atualizar saldo do cliente no banco
      const { error: updateError } = await supabase
        .from('clientes_fast')
        .update({
          saldo_pontos: novoSaldo,
          total_pontos_gastos: novoTotalGastos
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Registrar no histórico (usando campos mínimos obrigatórios)
      try {
        const { error: historicoError } = await supabase
          .from('historico_pontos')
          .insert([{
            cliente_id: user.id,
            tipo_operacao: 'resgate',
            pontos: modalResgate.pontos_necessarios,
            saldo_anterior: clienteAtual.saldo_pontos,
            saldo_posterior: novoSaldo,
            observacoes: `Resgate: ${modalResgate.nome} - Código: ${resgateData?.codigo_resgate || 'SEM_CODIGO'}`
          }]);

        if (historicoError) {
          console.error('Erro ao registrar histórico:', historicoError);
          // Não bloquear o resgate se o histórico falhar
        }
      } catch (histError) {
        console.error('Erro no histórico (não crítico):', histError);
        // Histórico é opcional, não bloquear o resgate
      }

      // Buscar dados ATUALIZADOS do banco após a operação
      await buscarDadosUsuario();

      // Disparar evento global para outros componentes atualizarem
      window.dispatchEvent(new CustomEvent('userUpdated'));

      const codigo = resgateData?.codigo_resgate || 'SEM_CODIGO';
      setCodigoResgate(codigo);

      toast.success('Resgate realizado com sucesso!');

      // Fechar modal após 3 segundos para dar tempo de ver o código
      setTimeout(() => {
        fecharModal();
      }, 3000);

    } catch (error) {
      console.error('Erro no resgate:', error);
      toast.error(`Erro ao realizar resgate: ${error.message}`);
    } finally {
      setProcessandoResgate(false);
    }
  };

  const copiarCodigo = () => {
    if (codigoResgate) {
      navigator.clipboard.writeText(codigoResgate);
      toast.success('Código copiado!');
    }
  };

  const fecharModal = () => {
    setModalResgate(null);
    setCodigoResgate(null);
  };

  const categorias = [
    { value: 'todos', label: 'Todos os Prêmios', icon: FiGift },
    { value: 'ferramentas', label: 'Ferramentas', icon: FiGift },
    { value: 'vale_compras', label: 'Vale-Compras', icon: FiShoppingCart },
    { value: 'brindes', label: 'Brindes', icon: FiStar }
  ];

  const premiosDestaque = premios.filter(p => p.destaque === true);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <FiLoader className="animate-spin" size={32} />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>
          <FiGift />
          Catálogo de Prêmios
        </h1>
        <p>Troque seus pontos por prêmios incríveis</p>
      </Header>

      <SaldoContainer>
        <SaldoValue>{userAtualizado?.saldo_pontos || 0}</SaldoValue>
        <SaldoLabel>pontos disponíveis</SaldoLabel>
      </SaldoContainer>

      <FilterContainer>
        <FilterTitle>
          <FiFilter />
          Filtrar por Categoria
        </FilterTitle>
        <FilterButtons>
          {categorias.map(categoria => {
            const IconComponent = categoria.icon;
            return (
              <FilterButton
                key={categoria.value}
                $active={filtro === categoria.value}
                onClick={() => setFiltro(categoria.value)}
              >
                <IconComponent />
                {categoria.label}
              </FilterButton>
            );
          })}
        </FilterButtons>
      </FilterContainer>

      <PremiosContainer>
        <PremiosHeader>
          <h2>
            <FiGift />
            {filtro === 'todos' ? 'Todos os Prêmios' : `Categoria: ${filtro.charAt(0).toUpperCase() + filtro.slice(1)}`}
          </h2>
        </PremiosHeader>

        {premios.length === 0 ? (
          <EmptyState>
            <div className="icon">
              <FiGift />
            </div>
            <h3>Nenhum prêmio encontrado</h3>
            <p>Tente selecionar uma categoria diferente</p>
          </EmptyState>
        ) : (
          <PremiosGrid>
            {premios.map(premio => (
              <PremioCard
                key={premio.id}
                $destaque={premiosDestaque.includes(premio)}
              >
                <PremioHeader>
                  <PremioIcon>
                    <FiGift />
                  </PremioIcon>
                  <PremioInfo>
                    <PremioNome>{premio.nome}</PremioNome>
                    <PremioCategoria>{premio.categoria}</PremioCategoria>
                  </PremioInfo>
                </PremioHeader>

                <PremioDescricao>{premio.descricao}</PremioDescricao>

                <PremioFooter>
                  <PontosBadge>
                    <FiStar />
                    {premio.pontos_necessarios}
                  </PontosBadge>

                  <ResgatarButton
                    disabled={!userAtualizado || userAtualizado.saldo_pontos < premio.pontos_necessarios}
                    onClick={() => setModalResgate(premio)}
                  >
                    {userAtualizado?.saldo_pontos >= premio.pontos_necessarios ? (
                      <>
                        <FiShoppingCart />
                        Resgatar
                      </>
                    ) : (
                      <>
                        <FiX />
                        Insuficiente
                      </>
                    )}
                  </ResgatarButton>
                </PremioFooter>
              </PremioCard>
            ))}
          </PremiosGrid>
        )}
      </PremiosContainer>

      {/* Modais permanecem iguais */}
      {modalResgate && !codigoResgate && (
        <Modal onClick={(e) => e.target === e.currentTarget && fecharModal()}>
          <ModalContent>
            <ModalTitle>Confirmar Resgate</ModalTitle>
            <ModalText>
              Você deseja resgatar <strong>{modalResgate.nome}</strong> por {modalResgate.pontos_necessarios} pontos?
            </ModalText>
            <ModalText>
              Seu saldo atual: <strong>{userAtualizado?.saldo_pontos} pontos</strong>
              <br />
              Saldo após resgate: <strong>{(userAtualizado?.saldo_pontos || 0) - modalResgate.pontos_necessarios} pontos</strong>
            </ModalText>
            <ModalButtons>
              <ModalButton onClick={fecharModal}>
                Cancelar
              </ModalButton>
              <ModalButton $primary onClick={handleResgate} disabled={processandoResgate}>
                {processandoResgate ? <FiLoader className="animate-spin" /> : <FiCheck />}
                {processandoResgate ? 'Processando...' : 'Confirmar'}
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}

      {codigoResgate && (
        <Modal onClick={(e) => e.target === e.currentTarget && fecharModal()}>
          <ModalContent>
            <ModalTitle>🎉 Resgate Realizado!</ModalTitle>
            <ModalText>
              Seu resgate foi processado com sucesso!
            </ModalText>

            <CodigoResgate>
              <div className="codigo">{codigoResgate}</div>
              <div className="instrucao">
                Para resgatar seu produto, dirija-se à loja Fast mais próxima de você
              </div>
              <div className="instrucao" style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                Apresente este código na loja para retirar seu prêmio
              </div>
              <div className="aviso-estoque" style={{
                fontSize: '0.85rem',
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                color: '#856404'
              }}>
                ⚠️ <strong>Importante:</strong> A disponibilidade do produto está sujeita ao estoque da loja.
                Recomendamos entrar em contato antes de se dirigir à loja.
              </div>
              <CopiarButton onClick={copiarCodigo}>
                <FiCopy />
                Copiar Código
              </CopiarButton>
            </CodigoResgate>

            <ModalButtons>
              <ModalButton $primary onClick={fecharModal}>
                <FiCheck />
                Entendi
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default PremiosNovo;
