import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiGift, FiClock, FiCheckCircle, FiCopy, FiMapPin, FiInfo, FiCalendar, FiHash, FiUser } from 'react-icons/fi';
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
// Ajuste do Container para responsividade máxima
const Container = styled.div`
  min-height: 100vh;
  background: #fcfcff;
  padding: 2rem 0;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 900px) {
    padding: 1rem 0;
    margin-top: -9vh;
  }
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 2rem auto;
  padding: 2.5rem 2rem 2rem 2rem;
  background: linear-gradient(135deg, #A91918 0%, #c41e3a 100%);
  color: #fff;
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-out;
  
  @media (max-width: 768px) {
    margin: 0 1rem 1.5rem 1rem;
    padding: 2rem 1.5rem;
    
    h1 {
      font-size: 1.5rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 480px) {
    margin: 0 0.5rem 1rem 0.5rem;
    padding: 1.5rem 1rem;
    
    h1 {
      font-size: 1.3rem;
    }
    
    p {
      font-size: 0.85rem;
    }
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  opacity: 0.95;
  margin: 0;
`;

const ResgatesContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 2.5rem auto;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const ResgatesGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  
  /* Desktop: Tabela */
  @media (min-width: 769px) {
    display: block;
  }
  
  /* Mobile: Cards */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ResgatesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  overflow: hidden;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ResgatesTh = styled.th`
  border: 1px solid #e3e6ea;
  background: #f8f9fa;
  color: #222;
  font-weight: 700;
  padding: 14px 16px;
  font-size: 15px;
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

const ResgateCard = styled.div`
  background: #fff;
  padding: 1.5rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  border: 1px solid #e3e6ea;
  animation: ${fadeInUp} 0.3s ease-out;
  
  /* Destaque para itens retirados */
  ${({ isColetado }) => isColetado && `
    background: #eafaf1;
    border-color: #3CB371;
  `}
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #A91918;
  margin: 0;
  line-height: 1.3;
  flex: 1;
`;

const CardInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const CardField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CardLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    font-size: 0.8rem;
  }
`;

const CardValue = styled.span`
  font-size: 0.95rem;
  color: #222;
  font-weight: 500;
  line-height: 1.3;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e3e6ea;
  gap: 1rem;
`;

const CardCode = styled.div`
  background: #f8f9fa;
  padding: 0.75rem;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #666;
  border: 1px solid #e3e6ea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #999;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
  background: #fff;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  margin: 2rem auto;
  max-width: 600px;
  
  svg {
    font-size: 3rem;
    color: #A91918;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.25rem;
    color: #333;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    font-size: 1rem;
    margin: 0;
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    margin: 1rem;
    
    svg {
      font-size: 2.5rem;
    }
    
    h3 {
      font-size: 1.1rem;
    }
    
    p {
      font-size: 0.9rem;
    }
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
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 6px 12px;
  font-weight: 600;
  font-size: 0.8rem;
  color: #fff;
  background: ${({ status }) =>
    status === 'Retirado' ? '#3CB371' :
      status === 'Disponível' ? '#FFC107' :
        '#6c757d'};
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 4px 8px;
  }
`;

// Linha destacada para retirado
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

  // Função de emergência para gerar códigos faltantes
  const gerarCodigosFaltantes = async () => {
    try {
      console.log('🚨 Executando correção de códigos faltantes...');

      // Buscar resgates sem código
      const { data: resgatesSemCodigo, error: searchError } = await supabase
        .from('resgates')
        .select('id, created_at')
        .is('codigo_resgate', null);

      if (searchError) throw searchError;

      if (resgatesSemCodigo && resgatesSemCodigo.length > 0) {
        console.log(`🔧 Encontrados ${resgatesSemCodigo.length} resgates sem código`);

        // Gerar códigos para cada resgate
        for (let i = 0; i < resgatesSemCodigo.length; i++) {
          const resgate = resgatesSemCodigo[i];
          const dataResgate = new Date(resgate.created_at);
          const codigoGerado = `RES-${dataResgate.toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`;

          const { error: updateError } = await supabase
            .from('resgates')
            .update({ codigo_resgate: codigoGerado })
            .eq('id', resgate.id);

          if (updateError) {
            console.error('❌ Erro ao atualizar resgate:', resgate.id, updateError);
          } else {
            console.log(`✅ Código gerado para resgate ${resgate.id}: ${codigoGerado}`);
          }
        }

        toast.success(`Códigos gerados para ${resgatesSemCodigo.length} resgates!`);
        return true;
      } else {
        console.log('✅ Todos os resgates já têm códigos');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao gerar códigos:', error);
      toast.error('Erro ao gerar códigos faltantes');
      return false;
    }
  };

  const carregarResgates = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando resgates para usuario:', usuario.id);

      // Primeiro, tentar corrigir códigos faltantes
      await gerarCodigosFaltantes();

      // Buscar resgates diretamente da tabela resgates
      const { data: resgatesData, error: resgatesError } = await supabase
        .from('resgates')
        .select(`
                    id,
                    created_at,
                    coletado,
                    data_coleta,
                    gerente_retirada,
                    usuario_retirada_id,
                    pontos_utilizados,
                    status,
                    premio_id,
                    codigo_resgate
                `)
        .eq('cliente_id', usuario.id)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('📊 Dados dos resgates:', { resgatesData, resgatesError });

      if (resgatesError) throw resgatesError;

      if (!resgatesData || resgatesData.length === 0) {
        console.log('❌ Nenhum resgate encontrado');
        setResgates([]);
        return;
      }

      // Debug: verificar se codes estão sendo retornados
      console.log('🔍 Códigos dos resgates:', resgatesData.map(r => ({ id: r.id, codigo: r.codigo_resgate })));

      // Buscar dados dos prêmios separadamente
      const premioIds = resgatesData.map(r => r.premio_id);
      const { data: premiosData, error: premiosError } = await supabase
        .from('premios_catalogo')
        .select('id, nome, descricao, categoria')
        .in('id', premioIds);

      console.log('🎁 Dados dos prêmios:', { premiosData, premiosError });

      if (premiosError) {
        console.error('Erro ao buscar prêmios:', premiosError);
        // Continuar mesmo sem dados dos prêmios
      }

      // Combinar dados
      const resgatesCombinados = resgatesData.map(resgate => {
        const premio = premiosData?.find(p => p.id === resgate.premio_id) || {};

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
          premio_nome: premio.nome || 'Prêmio',
          premio_descricao: premio.descricao || '',
          premio_categoria: premio.categoria || 'Geral',
          status_retirada: resgate.coletado ? 'Retirado' : 'Aguardando Retirada'
        };
      });

      console.log('✅ Resgates combinados:', resgatesCombinados);
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
        <LoadingGif
          text="Carregando resgates..."
          size="300px"
          mobileSize="250px"
        />
      </Container>
    );
  }

  const ContainerComponent = showAsSection ? React.Fragment : Container;
  const content = (
    <>
      {/* {!showAsSection && (
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
      ) : ( */}
      <ResgatesContainer>
        <ResgatesGrid>
          {/* Tabela para Desktop */}
          <ResgatesTable>
            <thead>
              <tr>
                <ResgatesTh>Prêmio</ResgatesTh>
                <ResgatesTh>Pontos Utilizados</ResgatesTh>
                <ResgatesTh>Data do Resgate</ResgatesTh>
                <ResgatesTh>Status</ResgatesTh>
                <ResgatesTh>Código</ResgatesTh>
                <ResgatesTh>Data da Retirada</ResgatesTh>
              </tr>
            </thead>
            <tbody>
              {resgates.map(resgate => {
                const isRetirado = resgate.status_retirada === 'Retirado';
                const RowTag = isRetirado ? ColetadoRow : 'tr';
                return (
                  <RowTag key={resgate.id}>
                    <ResgatesTd>{resgate.premio_nome}</ResgatesTd>
                    <ResgatesTd>{resgate.pontos_utilizados}</ResgatesTd>
                    <ResgatesTd>{formatarData(resgate.data_resgate)}</ResgatesTd>
                    <ResgatesTd>
                      <StatusBadge status={resgate.status_retirada}>
                        {resgate.status_retirada}
                      </StatusBadge>
                    </ResgatesTd>
                    <ResgatesTd>{resgate.codigo_resgate || '-'}</ResgatesTd>
                    <ResgatesTd>{resgate.data_coleta ? formatarData(resgate.data_coleta) : '-'}</ResgatesTd>
                  </RowTag>
                );
              })}
            </tbody>
          </ResgatesTable>

          {/* Cards para Mobile */}
          {resgates.map(resgate => {
            const isRetirado = resgate.status_retirada === 'Retirado';
            return (
              <ResgateCard key={`card-${resgate.id}`} isColetado={isRetirado}>
                <CardHeader>
                  <CardTitle>{resgate.premio_nome}</CardTitle>
                  <StatusBadge status={resgate.status_retirada}>
                    {resgate.status_retirada}
                  </StatusBadge>
                </CardHeader>

                <CardInfo>
                  <CardField>
                    <CardLabel>
                      <FiGift />
                      Pontos Utilizados
                    </CardLabel>
                    <CardValue>{resgate.pontos_utilizados} pontos</CardValue>
                  </CardField>
                  <CardField>
                    <CardLabel>
                      <FiCalendar />
                      Data do Resgate
                    </CardLabel>
                    <CardValue>{formatarData(resgate.data_resgate)}</CardValue>
                  </CardField>
                  {resgate.data_coleta && (
                    <>
                      <CardField>
                        <CardLabel>
                          <FiCheckCircle />
                          Data da Retirada
                        </CardLabel>
                        <CardValue>{formatarData(resgate.data_coleta)}</CardValue>
                      </CardField>
                      {resgate.gerente_retirada && (
                        <CardField>
                          <CardLabel>
                            <FiUser />
                            Retirado por
                          </CardLabel>
                          <CardValue>{resgate.gerente_retirada}</CardValue>
                        </CardField>
                      )}
                    </>
                  )}
                </CardInfo>

                {resgate.codigo_resgate && (
                  <CardFooter>
                    <CardField style={{ width: '100%' }}>
                      <CardLabel>
                        <FiHash />
                        Código do Resgate
                      </CardLabel>
                      <CardCode>
                        <FiCopy />
                        {resgate.codigo_resgate}
                      </CardCode>
                    </CardField>
                  </CardFooter>
                )}
              </ResgateCard>
            );
          })}
        </ResgatesGrid>
      </ResgatesContainer>
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
