import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiCalendar,
    FiDollarSign,
    FiTrendingUp,
    FiGift,
    FiClock,
    FiX,
    FiActivity,
    FiStar,
    FiAward
} from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.3s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  background: linear-gradient(135deg, #A91918, #8B1510);
  color: white;
  padding: 2rem;
  border-radius: 12px 12px 0 0;
  position: relative;
  
  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const Content = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  color: #2d3748;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid ${props => props.color || '#A91918'};
  
  .label {
    font-size: 0.8rem;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }
  
  .value {
    font-size: 1rem;
    color: #2d3748;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.color || '#667eea'}, ${props => props.colorEnd || '#764ba2'});
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  
  .value {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }
  
  .label {
    font-size: 0.8rem;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th {
    text-align: left;
    padding: 0.75rem;
    background: #f8fafc;
    color: #4a5568;
    font-weight: 600;
    border-bottom: 2px solid #e2e8f0;
    font-size: 0.9rem;
  }
  
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
    color: #4a5568;
    font-size: 0.9rem;
  }
  
  tr:hover {
    background: #f8fafc;
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => props.type === 'ganho' ? `
    background: #c6f6d5;
    color: #2f855a;
  ` : `
    background: #fed7d7;
    color: #c53030;
  `}
`;

function ClienteDetalhes({ cliente, onClose }) {
    const [historicoPontos, setHistoricoPontos] = useState([]);
    const [resgates, setResgates] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (cliente) {
            loadClientDetails();
        }
    }, [cliente]);

    const loadClientDetails = async () => {
        try {
            setLoading(true);

            // Carregar histórico de pontos
            const { data: pontosData } = await supabase
                .from('historico_pontos')
                .select('*')
                .eq('cliente_id', cliente.id)
                .order('created_at', { ascending: false })
                .limit(10);

            setHistoricoPontos(pontosData || []);

            // Carregar resgates
            const { data: resgatesData } = await supabase
                .from('resgates')
                .select(`
                    *,
                    premios (nome, pontos_necessarios)
                `)
                .eq('cliente_id', cliente.id)
                .order('created_at', { ascending: false })
                .limit(10);

            setResgates(resgatesData || []);

            // Carregar pedidos
            const { data: pedidosData } = await supabase
                .from('pedidos_fast')
                .select('*')
                .eq('cliente_id', cliente.id)
                .order('created_at', { ascending: false })
                .limit(10);

            setPedidos(pedidosData || []);

        } catch (error) {
            console.error('Erro ao carregar detalhes do cliente:', error);
            toast.error('Erro ao carregar detalhes do cliente');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    if (!cliente) return null;

    return (
        <Modal onClick={(e) => e.target === e.currentTarget && onClose()}>
            <ModalContent>
                <Header>
                    <h2>
                        <FiUser />
                        Detalhes do Cliente
                    </h2>
                    <p>Informações completas e histórico</p>
                    <CloseButton onClick={onClose}>
                        <FiX />
                    </CloseButton>
                </Header>

                <Content>
                    {/* Informações Pessoais */}
                    <Section>
                        <SectionTitle>
                            <FiUser />
                            Informações Pessoais
                        </SectionTitle>
                        <InfoGrid>
                            <InfoItem color="#3182ce">
                                <div className="label">Nome Completo</div>
                                <div className="value">{cliente.nome || 'Não informado'}</div>
                            </InfoItem>
                            <InfoItem color="#38a169">
                                <div className="label">E-mail</div>
                                <div className="value">
                                    <FiMail />
                                    {cliente.email || 'Não informado'}
                                </div>
                            </InfoItem>
                            <InfoItem color="#d69e2e">
                                <div className="label">Telefone</div>
                                <div className="value">
                                    <FiPhone />
                                    {cliente.telefone || 'Não informado'}
                                </div>
                            </InfoItem>
                            <InfoItem color="#805ad5">
                                <div className="label">Endereço</div>
                                <div className="value">
                                    <FiMapPin />
                                    {cliente.endereco || 'Não informado'}
                                </div>
                            </InfoItem>
                            <InfoItem color="#e53e3e">
                                <div className="label">Data de Cadastro</div>
                                <div className="value">
                                    <FiCalendar />
                                    {formatDate(cliente.created_at)}
                                </div>
                            </InfoItem>
                            <InfoItem color="#00b4d8">
                                <div className="label">Último Acesso</div>
                                <div className="value">
                                    <FiClock />
                                    {formatDate(cliente.ultimo_login)}
                                </div>
                            </InfoItem>
                        </InfoGrid>
                    </Section>

                    {/* Estatísticas */}
                    <Section>
                        <SectionTitle>
                            <FiTrendingUp />
                            Estatísticas de Pontos
                        </SectionTitle>
                        <StatsGrid>
                            <StatCard color="#38a169" colorEnd="#2f855a">
                                <div className="value">{(cliente.saldo_pontos || 0).toLocaleString()}</div>
                                <div className="label">Pontos Atuais</div>
                            </StatCard>
                            <StatCard color="#3182ce" colorEnd="#2c5282">
                                <div className="value">{(cliente.total_pontos_ganhos || 0).toLocaleString()}</div>
                                <div className="label">Total Ganho</div>
                            </StatCard>
                            <StatCard color="#d69e2e" colorEnd="#b7791f">
                                <div className="value">{(cliente.total_pontos_gastos || 0).toLocaleString()}</div>
                                <div className="label">Total Gasto</div>
                            </StatCard>
                            <StatCard color="#805ad5" colorEnd="#6b46c1">
                                <div className="value">{pedidos.length}</div>
                                <div className="label">Notas Enviadas</div>
                            </StatCard>
                        </StatsGrid>
                    </Section>

                    {/* Histórico de Pontos */}
                    <Section>
                        <SectionTitle>
                            <FiActivity />
                            Histórico de Pontos (Últimos 10)
                        </SectionTitle>
                        {historicoPontos.length > 0 ? (
                            <HistoryTable>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Tipo</th>
                                        <th>Pontos</th>
                                        <th>Descrição</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historicoPontos.map((item, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(item.created_at)}</td>
                                            <td>
                                                <Badge type={item.tipo}>
                                                    {item.tipo}
                                                </Badge>
                                            </td>
                                            <td style={{ fontWeight: 'bold', color: item.tipo === 'ganho' ? '#38a169' : '#e53e3e' }}>
                                                {item.tipo === 'ganho' ? '+' : '-'}{item.pontos}
                                            </td>
                                            <td>{item.descricao}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </HistoryTable>
                        ) : (
                            <p style={{ color: '#718096', fontStyle: 'italic' }}>Nenhum histórico de pontos encontrado</p>
                        )}
                    </Section>

                    {/* Resgates */}
                    <Section>
                        <SectionTitle>
                            <FiGift />
                            Últimos Resgates
                        </SectionTitle>
                        {resgates.length > 0 ? (
                            <HistoryTable>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Prêmio</th>
                                        <th>Pontos</th>
                                        <th>Status</th>
                                        <th>Código</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resgates.map((resgate, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(resgate.created_at)}</td>
                                            <td>{resgate.premios?.nome || 'N/A'}</td>
                                            <td style={{ fontWeight: 'bold', color: '#e53e3e' }}>
                                                -{resgate.pontos_utilizados}
                                            </td>
                                            <td>
                                                <Badge type={resgate.status === 'confirmado' ? 'ganho' : 'gasto'}>
                                                    {resgate.status}
                                                </Badge>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                {resgate.codigo_resgate}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </HistoryTable>
                        ) : (
                            <p style={{ color: '#718096', fontStyle: 'italic' }}>Nenhum resgate realizado</p>
                        )}
                    </Section>
                </Content>
            </ModalContent>
        </Modal>
    );
}

export default ClienteDetalhes;
