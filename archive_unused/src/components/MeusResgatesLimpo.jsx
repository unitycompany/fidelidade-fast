import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiGift, FiClock, FiCheckCircle, FiCopy, FiMapPin, FiInfo } from 'react-icons/fi';
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
  background: linear-gradient(135deg, #f1f1f1 0%, #e8e8e8 50%, #f1f1f1 100%);
  padding: 2rem;
  font-family: 'Montserrat', sans-serif;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const Title = styled.h1`
  color: #A91918;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  font-family: 'Urbanist', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ResgatesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ResgateCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 20px rgba(53, 53, 53, 0.1);
  border: 2px solid ${props => props.$coletado ? '#28a745' : '#e9ecef'};
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(53, 53, 53, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 1.2rem;
    border-radius: 12px;
  }
`;

const ResgateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const PremioInfo = styled.div`
  flex: 1;
  
  h3 {
    color: #353535;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    font-family: 'Urbanist', sans-serif;
  }
  
  p {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
  }
`;

const StatusBadge = styled.div`
  background: ${props => props.$coletado ?
    'linear-gradient(135deg, #28a745, #20c997)' :
    'linear-gradient(135deg, #ffc107, #fd7e14)'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${props => props.$coletado ? pulse : 'none'} 2s ease-in-out infinite;
`;

const CodigoSection = styled.div`
  background: linear-gradient(135deg, #A91918, #d32f2f);
  color: white;
  padding: 1rem;
  border-radius: 12px;
  margin-top: 1rem;
  text-align: center;
`;

const CodigoTexto = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  font-family: 'Urbanist', sans-serif;
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
`;

const CopiarButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  margin: 0 auto;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const InfoDetalhes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const InfoItem = styled.div`
  text-align: center;
  
  .label {
    color: #666;
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }
  
  .value {
    color: #353535;
    font-weight: 600;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  
  svg {
    font-size: 3rem;
    color: #A91918;
    margin-bottom: 1rem;
  }
  
  h3 {
    color: #353535;
    margin-bottom: 1rem;
    font-family: 'Urbanist', sans-serif;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #666;
`;

function MeusResgatesLimpo({ usuario, onClose, showAsSection = false }) {
  const [resgates, setResgates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuario?.id) {
      carregarResgates();
    }
  }, [usuario?.id]);

  const carregarResgates = async () => {
    try {
      setLoading(true);

      // Buscar resgates diretamente da tabela resgates
      const { data: resgatesData, error: resgatesError } = await supabase
        .from('resgates')
        .select(`
                    id,
                    codigo_resgate,
                    created_at,
                    coletado,
                    data_coleta,
                    gerente_retirada,
                    usuario_retirada_id,
                    pontos_utilizados,
                    status,
                    premio_id
                `)
        .eq('cliente_id', usuario.id)
        .eq('status', 'confirmado')
        .order('created_at', { ascending: false })
        .limit(10);

      if (resgatesError) throw resgatesError;

      if (!resgatesData || resgatesData.length === 0) {
        setResgates([]);
        return;
      }

      // Buscar dados dos prêmios separadamente
      const premioIds = resgatesData.map(r => r.premio_id);
      const { data: premiosData, error: premiosError } = await supabase
        .from('premios_catalogo')
        .select('id, nome, descricao, categoria')
        .in('id', premioIds);

      if (premiosError) {
        console.error('Erro ao buscar prêmios:', premiosError);
        // Continuar mesmo sem dados dos prêmios
      }

      // Combinar dados
      const resgatesCombinados = resgatesData.map(resgate => {
        const premio = premiosData?.find(p => p.id === resgate.premio_id) || {};

        return {
          id: resgate.id,
          codigo_resgate: resgate.codigo_resgate,
          data_resgate: resgate.created_at,
          coletado: resgate.coletado || false,
          data_coleta: resgate.data_coleta,
          gerente_retirada: resgate.gerente_retirada,
          usuario_retirada_id: resgate.usuario_retirada_id,
          pontos_utilizados: resgate.pontos_utilizados,
          status: resgate.status,
          premio_nome: premio.nome || 'Prêmio',
          premio_descricao: premio.descricao || '',
          premio_categoria: premio.categoria || 'Geral',
          status_retirada: resgate.coletado ? 'Retirado' : 'Aguardando Retirada'
        };
      });

      setResgates(resgatesCombinados);

    } catch (error) {
      console.error('Erro ao carregar resgates:', error);
      setResgates([]);
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    toast.success(`Código ${codigo} copiado!`);
  };

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <div>Carregando resgates...</div>
        </LoadingContainer>
      </Container>
    );
  }

  const ContainerComponent = showAsSection ? React.Fragment : Container;
  const content = (
    <>
      {!showAsSection && (
        <Header>
          <Title>Meus Resgates</Title>
          <Subtitle>Acompanhe o status dos seus resgates realizados</Subtitle>
        </Header>
      )}

      {resgates.length === 0 ? (
        <EmptyState>
          <FiGift />
          <h3>Nenhum resgate encontrado</h3>
          <p>Você ainda não realizou nenhum resgate de prêmios.</p>
        </EmptyState>
      ) : (
        <ResgatesList>
          {resgates.map(resgate => (
            <ResgateCard key={resgate.id} $coletado={resgate.coletado}>
              <ResgateHeader>
                <PremioInfo>
                  <h3>{resgate.premio_nome}</h3>
                  <p>{resgate.premio_descricao}</p>
                </PremioInfo>

                <StatusBadge $coletado={resgate.coletado}>
                  {resgate.coletado ? <FiCheckCircle /> : <FiClock />}
                  {resgate.status_retirada}
                </StatusBadge>
              </ResgateHeader>

              {resgate.codigo_resgate && (
                <CodigoSection>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Código de Resgate:
                  </div>
                  <CodigoTexto>{resgate.codigo_resgate}</CodigoTexto>
                  <CopiarButton onClick={() => copiarCodigo(resgate.codigo_resgate)}>
                    <FiCopy />
                    Copiar Código
                  </CopiarButton>
                </CodigoSection>
              )}

              <InfoDetalhes>
                <InfoItem>
                  <div className="label">Data do Resgate</div>
                  <div className="value">{formatarData(resgate.data_resgate)}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Pontos Utilizados</div>
                  <div className="value">{resgate.pontos_utilizados}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Categoria</div>
                  <div className="value">{resgate.premio_categoria}</div>
                </InfoItem>
                {resgate.data_coleta && (
                  <InfoItem>
                    <div className="label">Data da Retirada</div>
                    <div className="value">{formatarData(resgate.data_coleta)}</div>
                  </InfoItem>
                )}
                {resgate.gerente_retirada && (
                  <InfoItem>
                    <div className="label">Retirado por</div>
                    <div className="value">{resgate.gerente_retirada}</div>
                  </InfoItem>
                )}
              </InfoDetalhes>
            </ResgateCard>
          ))}
        </ResgatesList>
      )}
    </>
  );

  return showAsSection ? (
    <MainContent>
      {content}
    </MainContent>
  ) : (
    <Container>
      <MainContent>
        {content}
      </MainContent>
    </Container>
  );
}

export default MeusResgatesLimpo;
