import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiGift, FiStar, FiShoppingCart, FiCheck, FiX, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { supabase, redeemPrize } from '../services/supabase';
import { CATEGORIAS_PREMIOS } from '../utils/inicializarPremios';
import toast from 'react-hot-toast';

// Animações
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

// Container principal otimizado
const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 1rem;
  font-family: 'Montserrat', sans-serif;
  
  @media (max-width: 900px) {
    padding: 0.5rem;
    min-height: calc(100vh - 64px);
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

const HeaderSection = styled.div`
  background: #fff;
  padding: 2rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  text-align: center;
  
  @media (max-width: 900px) {
    padding: 1rem;
    border-radius: 4px;
  }
`;

const HeaderTitle = styled.h1`
  color: #2D3748;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const HeaderSubtitle = styled.p`
  color: #4A5568;
  font-size: 1rem;
  margin: 0;
  
  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const PointsDisplay = styled.div`
  background: linear-gradient(135deg, #cc1515 0%, #9b0c0c 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  
  @media (max-width: 600px) {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
`;

// Container de filtros otimizado
const FilterContainer = styled.div`
  background: #fff;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  
  @media (max-width: 900px) {
    padding: 1rem;
    border-radius: 4px;
  }
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
  border: 1px solid ${props => props.$active ? '#cc1515' : '#CBD5E0'};
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    border-color: #cc1515;
    ${props => !props.$active && `
      background: #EDF2F7;
    `}
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

// Container de prêmios otimizado
const PremiosContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const PremioCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const PremioImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: #ffffff;
  overflow: hidden;
`;

const PremioImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-bottom: 1px solid #eee;
`;

const PremioContent = styled.div`
  padding: 1.5rem;
`;

const PremioHeader = styled.div`
  margin-bottom: 1rem;
`;

const PremioTitulo = styled.h3`
  color: #2D3748;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
`;

const PremioCategoria = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: #4A5568;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  backdrop-filter: blur(4px);
  z-index: 2;
`;

const PremioDescricao = styled.p`
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 1rem 0;
`;

const PremioFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const PremioPontos = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #cc1515;
  font-weight: 700;
  font-size: 0.95rem;
  flex-shrink: 0;
`;

const BotaoResgatar = styled.button`
  background: ${props => props.disabled ? '#CBD5E0' : 'linear-gradient(135deg, #cc1515 0%, #9b0c0c 100%)'};
  color: ${props => props.disabled ? '#718096' : 'white'};
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(204, 21, 21, 0.3);
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
  text-align: center;
  padding: 3rem;
  color: #718096;
  
  h3 {
    color: #2D3748;
    margin-bottom: 0.5rem;
  }
`;

// Modal Components
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
  animation: ${fadeIn} 0.2s ease-out;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.3s ease-out;
  
  @media (max-width: 600px) {
    padding: 1.5rem;
    margin: 1rem;
  }
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  
  svg {
    font-size: 3rem;
    color: #A91918;
    margin-bottom: 1rem;
  }
  
  h2 {
    color: #2D3748;
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
  }
  
  p {
    color: #666;
    margin: 0;
    line-height: 1.5;
  }
`;

const ModalPrizeInfo = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border-left: 4px solid #A91918;
`;

const PrizeName = styled.h3`
  color: #A91918;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const PrizePoints = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  
  span {
    font-weight: 600;
  }
  
  .points {
    color: #A91918;
    font-size: 1.1rem;
  }
  
  .balance {
    color: #666;
    font-size: 0.9rem;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 400px) {
    flex-direction: column;
  }
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.confirm {
    background: #A91918;
    color: white;
    
    &:hover {
      background: #8a1416;
      transform: translateY(-1px);
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }
  }
  
  &.cancel {
    background: #f1f1f1;
    color: #666;
    
    &:hover {
      background: #e1e1e1;
    }
  }
`;

function PremiosNovo({ user, onUserUpdate }) {
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [resgatandoPremio, setResgatandoPremio] = useState(null);
  const [modalConfirmacao, setModalConfirmacao] = useState(null);

  const buscarPremios = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('premios_catalogo')
        .select('*')
        .eq('ativo', true)
        .order('pontos_necessarios', { ascending: true });

      if (error) throw error;
      setPremios(data || []);
    } catch (error) {
      console.error('Erro ao buscar prêmios:', error);
      toast.error('Erro ao carregar prêmios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarPremios();
  }, [buscarPremios]);

  const premiosFiltrados = premios.filter(premio => {
    if (filtroCategoria === 'todos') return true;
    return premio.categoria === filtroCategoria;
  });

  const podeResgatar = (premio) => {
    return user?.saldo_pontos >= premio.pontos_necessarios;
  };

  const handleResgatar = async (premio) => {
    if (!podeResgatar(premio)) {
      toast.error('Pontos insuficientes para este resgate');
      return;
    }

    // Abrir modal de confirmação em vez de alert
    setModalConfirmacao(premio);
  };

  const confirmarResgate = async () => {
    if (!modalConfirmacao) return;

    const premio = modalConfirmacao;
    setModalConfirmacao(null);
    setResgatandoPremio(premio.id);

    try {
      // Usar a função redeemPrize que já faz tudo
      await redeemPrize(user.id, premio.id, premio.pontos_necessarios);

      // Atualizar contexto do usuário imediatamente
      const novoSaldo = user.saldo_pontos - premio.pontos_necessarios;
      const novoTotalGastos = (user.total_pontos_gastos || 0) + premio.pontos_necessarios;

      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          saldo_pontos: novoSaldo,
          total_pontos_gastos: novoTotalGastos
        });
      }

      toast.success(`🎉 Resgate realizado com sucesso!\n${premio.nome} - ${premio.pontos_necessarios} pontos`);

      // Recarregar prêmios para atualizar a interface
      buscarPremios();

      // Disparar evento global para atualizar outros componentes
      if (window.updateUserContext) {
        window.updateUserContext({ saldo_pontos: novoSaldo });
      }

      // Disparar evento userUpdated para atualizar sidebar e outros componentes
      window.dispatchEvent(new CustomEvent('userUpdated'));

      // Forçar refresh global para mostrar aba "Meus Resgates"
      if (window.triggerGlobalRefresh) {
        window.triggerGlobalRefresh();
      }

    } catch (error) {
      console.error('Erro ao resgatar prêmio:', error);
      toast.error('Erro ao realizar resgate. Tente novamente.');
    } finally {
      setResgatandoPremio(null);
    }
  };

  if (loading) {
    return (
      <Container>
        <MainContent>
          <LoadingContainer>
            <FiLoader className="animate-spin" size={32} />
            <p style={{ marginTop: '1rem' }}>Carregando prêmios...</p>
          </LoadingContainer>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <MainContent>
        {/* <HeaderSection>
          <HeaderTitle>
            <FiGift />
            Catálogo de Prêmios
          </HeaderTitle>
          <HeaderSubtitle>
            Troque seus pontos por prêmios incríveis
          </HeaderSubtitle>
          <PointsDisplay>
            <FiStar />
            {user?.saldo_pontos?.toLocaleString() || '0'} pontos disponíveis
          </PointsDisplay>
        </HeaderSection> */}

        {/* <FilterContainer>
          <FilterTitle>Filtrar por categoria:</FilterTitle>
          <FilterButtons>
            <FilterButton
              $active={filtroCategoria === 'todos'}
              onClick={() => setFiltroCategoria('todos')}
            >
              Todos os Prêmios
            </FilterButton>
            {Object.entries(CATEGORIAS_PREMIOS).map(([key, categoria]) => (
              <FilterButton
                key={key}
                $active={filtroCategoria === key}
                onClick={() => setFiltroCategoria(key)}
              >
                {categoria.nome}
              </FilterButton>
            ))}
          </FilterButtons>
        </FilterContainer> */}

        {premiosFiltrados.length === 0 ? (
          <EmptyContainer>
            <FiGift size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Nenhum prêmio encontrado</h3>
            <p>Não há prêmios disponíveis para a categoria selecionada.</p>
          </EmptyContainer>
        ) : (
          <PremiosContainer>
            {premiosFiltrados.map((premio) => (
              <PremioCard key={premio.id}>
                <PremioImageContainer>
                  {premio.imagem_url && (
                    <PremioImage
                      src={premio.imagem_url}
                      alt={premio.nome}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <PremioCategoria>
                    {CATEGORIAS_PREMIOS[premio.categoria]?.nome || premio.categoria}
                  </PremioCategoria>
                </PremioImageContainer>
                
                <PremioContent>
                  <PremioHeader>
                    <PremioTitulo>{premio.nome}</PremioTitulo>
                  </PremioHeader>

                  {premio.descricao && (
                    <PremioDescricao>{premio.descricao}</PremioDescricao>
                  )}

                  <PremioFooter>
                    <PremioPontos>
                      <FiStar />
                      {premio.pontos_necessarios?.toLocaleString()} pts
                    </PremioPontos>

                    <BotaoResgatar
                      disabled={!podeResgatar(premio) || resgatandoPremio === premio.id}
                      onClick={() => handleResgatar(premio)}
                    >
                      {resgatandoPremio === premio.id ? (
                        <>
                          <FiLoader className="animate-spin" />
                          Resgatando...
                        </>
                      ) : podeResgatar(premio) ? (
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
                    </BotaoResgatar>
                  </PremioFooter>
                </PremioContent>
              </PremioCard>
            ))}
          </PremiosContainer>
        )}
      </MainContent>

      {/* Modal de Confirmação */}
      {modalConfirmacao && (
        <ModalOverlay onClick={() => setModalConfirmacao(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <FiGift />
              <h2>Confirmar Resgate</h2>
              <p>Você tem certeza que deseja resgatar este prêmio?</p>
            </ModalHeader>

            <ModalPrizeInfo>
              <PrizeName>{modalConfirmacao.nome}</PrizeName>
              {modalConfirmacao.descricao && (
                <p>{modalConfirmacao.descricao}</p>
              )}
              <PrizePoints>
                <span>Pontos necessários:</span>
                <span className="points">{modalConfirmacao.pontos_necessarios?.toLocaleString()} pts</span>
              </PrizePoints>
              <PrizePoints>
                <span>Seu saldo atual:</span>
                <span className="balance">{user?.saldo_pontos?.toLocaleString()} pts</span>
              </PrizePoints>
              <PrizePoints>
                <span>Saldo após resgate:</span>
                <span className="balance">
                  {(user?.saldo_pontos - modalConfirmacao.pontos_necessarios)?.toLocaleString()} pts
                </span>
              </PrizePoints>
            </ModalPrizeInfo>

            <ModalActions>
              <ModalButton
                className="cancel"
                onClick={() => setModalConfirmacao(null)}
              >
                Cancelar
              </ModalButton>
              <ModalButton
                className="confirm"
                onClick={confirmarResgate}
                disabled={resgatandoPremio === modalConfirmacao.id}
              >
                {resgatandoPremio === modalConfirmacao.id ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Resgatando...
                  </>
                ) : (
                  'Confirmar Resgate'
                )}
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default PremiosNovo;
