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
  max-width: 100%;
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

const ResgatesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin: 0 0 2.5rem 0;
  box-shadow: 0 1px 8px rgba(0,0,0,0.03);
`;

const ResgatesTh = styled.th`
  border: 1px solid #e3e6ea;
  background: #f8f9fa;
  color: #222;
  font-weight: 700;
  padding: 14px 16px;
  font-size: 15px;
  min-width: 120px;
  text-align: left;
`;

const ResgatesTd = styled.td`
  border: 1px solid #e3e6ea;
  padding: 14px 16px;
  font-size: 15px;
  color: #222;
  background: #fafbfc;
  text-align: left;
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

// Status visual highlight
const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  background: ${({ status }) =>
    status === 'Coletado' ? '#3CB371' : '#FFC107'};
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`;

// Linha destacada para coletado
const ColetadoRow = styled.tr`
  background: #eafaf1 !important;
`;

function MeusResgates({ usuario, onClose, showAsSection = false }) {
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
          pontos_utilizados: resgate.pontos_utilizados,
          status: resgate.status,
          premio_nome: premio.nome || 'Prêmio',
          premio_descricao: premio.descricao || '',
          premio_categoria: premio.categoria || 'Geral',
          status_coleta: resgate.coletado ? 'Coletado' : 'Aguardando Coleta'
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
        <ResgatesTable>
          <thead>
            <tr>
              <ResgatesTh>Prêmio</ResgatesTh>
              {/* <ResgatesTh>Categoria</ResgatesTh> */}
              <ResgatesTh>Pontos Utilizados</ResgatesTh>
              <ResgatesTh>Data do Resgate</ResgatesTh>
              <ResgatesTh>Status</ResgatesTh>
              <ResgatesTh>Código</ResgatesTh>
              <ResgatesTh>Data da Coleta</ResgatesTh>
            </tr>
          </thead>
          <tbody>
            {resgates.map(resgate => {
              const isColetado = resgate.status_coleta === 'Coletado';
              const RowTag = isColetado ? ColetadoRow : 'tr';
              return (
                <RowTag key={resgate.id}>
                  <ResgatesTd>{resgate.premio_nome}</ResgatesTd>
                  {/* <ResgatesTd>{resgate.premio_categoria}</ResgatesTd> */}
                  <ResgatesTd>{resgate.pontos_utilizados}</ResgatesTd>
                  <ResgatesTd>{formatarData(resgate.data_resgate)}</ResgatesTd>
                  <ResgatesTd>
                    <StatusBadge status={resgate.status_coleta}>
                      {resgate.status_coleta}
                    </StatusBadge>
                  </ResgatesTd>
                  <ResgatesTd>{resgate.codigo_resgate || '-'}</ResgatesTd>
                  <ResgatesTd>{resgate.data_coleta ? formatarData(resgate.data_coleta) : '-'}</ResgatesTd>
                </RowTag>
              );
            })}
          </tbody>
        </ResgatesTable>
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

export default MeusResgates;
