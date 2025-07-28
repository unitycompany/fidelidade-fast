import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FiSettings,
  FiUser,
  FiDollarSign,
  FiSearch,
  FiEdit3,
  FiSave,
  FiX,
  FiTrendingUp,
  FiAward,
  FiClock,
  FiInfo,
  FiUsers,
  FiTarget,
  FiPercent
} from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

// Animações
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

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

const SectionsGrid = styled.div`
  display: grid;
  gap: 2rem;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Urbanist', sans-serif;
  font-weight: 700;
`;

// Seção de Configuração de Pontuação de Clientes
const ClientSearch = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .search-input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #A91918;
      box-shadow: 0 0 0 3px rgba(169, 25, 24, 0.1);
    }
  }
  
  .search-btn {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #A91918, #8B1510);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(169, 25, 24, 0.3);
    }
  }
`;

const ClientCard = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid #A91918;
`;

const ClientInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
  
  .info {
    .name {
      font-weight: bold;
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
    }
    .details {
      color: #718096;
      font-size: 0.9rem;
    }
  }
  
  .points {
    text-align: right;
    .current {
      font-size: 1.5rem;
      font-weight: bold;
      color: #38a169;
      margin-bottom: 0.25rem;
    }
    .label {
      color: #718096;
      font-size: 0.8rem;
    }
  }
`;

const PointsEditor = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
  margin-top: 1rem;
  
  .form-group {
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #4a5568;
    }
    
    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      
      &:focus {
        outline: none;
        border-color: #A91918;
      }
    }
    
    select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: white;
      
      &:focus {
        outline: none;
        border-color: #A91918;
      }
    }
  }
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
  ` : props.variant === 'secondary' ? `
    background: #e2e8f0;
    color: #4a5568;
    
    &:hover {
      background: #cbd5e0;
    }
  ` : props.variant === 'success' ? `
    background: linear-gradient(135deg, #38a169, #2f855a);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);
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

// Seção de Configurações Gerais
const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ConfigCard = styled.div`
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid ${props => props.color || '#A91918'};
  
  .title {
    font-weight: bold;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .description {
    color: #718096;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  
  .value {
    font-size: 1.2rem;
    font-weight: bold;
    color: ${props => props.color || '#A91918'};
    margin-bottom: 0.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #4a5568;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #A91918;
      box-shadow: 0 0 0 3px rgba(169, 25, 24, 0.1);
    }
  }
  
  textarea {
    min-height: 80px;
    resize: vertical;
  }
`;

function AdminConfiguracaoesNovo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [pointsChange, setPointsChange] = useState('');
  const [changeType, setChangeType] = useState('add'); // add, subtract, set
  const [changeReason, setChangeReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState({
    pontosValidadeDias: 365,
    prazoEnvioNotasDias: 10,
    pontosMinimosResgate: 100,
    multiplicadorPontos: 1
  });

  const searchClients = async () => {
    if (!searchTerm.trim()) {
      toast.error('Digite um termo para buscar');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes_fast')
        .select('*')
        .or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);
      if (data.length === 0) {
        toast.error('Nenhum cliente encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao buscar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handlePointsChange = async (clientId) => {
    if (!pointsChange || isNaN(pointsChange)) {
      toast.error('Digite um valor válido');
      return;
    }

    if (!changeReason.trim()) {
      toast.error('Digite o motivo da alteração');
      return;
    }

    try {
      setLoading(true);

      // Buscar dados atuais do cliente
      const { data: client, error: clientError } = await supabase
        .from('clientes_fast')
        .select('saldo_pontos, total_pontos_ganhos, total_pontos_gastos')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      let newBalance = client.saldo_pontos || 0;
      let newTotalGanhos = client.total_pontos_ganhos || 0;
      let newTotalGastos = client.total_pontos_gastos || 0;

      const points = parseInt(pointsChange);

      switch (changeType) {
        case 'add':
          newBalance += points;
          newTotalGanhos += points;
          break;
        case 'subtract':
          newBalance -= points;
          newTotalGastos += points;
          break;
        case 'set':
          newBalance = points;
          break;
      }

      // Não permitir saldo negativo
      if (newBalance < 0) {
        toast.error('Saldo não pode ficar negativo');
        return;
      }

      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('clientes_fast')
        .update({
          saldo_pontos: newBalance,
          total_pontos_ganhos: newTotalGanhos,
          total_pontos_gastos: newTotalGastos
        })
        .eq('id', clientId);

      if (updateError) throw updateError;

      // Registrar histórico
      const { error: historyError } = await supabase
        .from('historico_pontos')
        .insert({
          cliente_id: clientId,
          tipo: changeType === 'add' ? 'ganho' : 'gasto',
          pontos: Math.abs(points),
          descricao: `Ajuste manual: ${changeReason}`,
          referencia_tipo: 'ajuste_manual',
          referencia_id: null
        });

      if (historyError) throw historyError;

      toast.success('Pontos atualizados com sucesso!');

      // Atualizar resultados da busca
      setSearchResults(prev =>
        prev.map(client =>
          client.id === clientId
            ? { ...client, saldo_pontos: newBalance, total_pontos_ganhos: newTotalGanhos, total_pontos_gastos: newTotalGastos }
            : client
        )
      );

      // Limpar formulário
      setEditingClient(null);
      setPointsChange('');
      setChangeReason('');

    } catch (error) {
      console.error('Erro ao alterar pontos:', error);
      toast.error('Erro ao alterar pontos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <h1>
          <FiSettings />
          Configurações do Sistema
        </h1>
        <p>Gerencie configurações gerais e pontuação de clientes</p>
      </Header>

      <SectionsGrid>
        {/* Seção de Pontuação de Clientes */}
        <Section>
          <SectionTitle>
            <FiUsers />
            Gerenciar Pontuação de Clientes
          </SectionTitle>

          <ClientSearch>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchClients()}
            />
            <button
              className="search-btn"
              onClick={searchClients}
              disabled={loading}
            >
              <FiSearch />
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </ClientSearch>

          {searchResults.map(client => (
            <ClientCard key={client.id}>
              <ClientInfo>
                <div className="info">
                  <div className="name">{client.nome}</div>
                  <div className="details">
                    {client.email} • {client.telefone}
                  </div>
                </div>
                <div className="points">
                  <div className="current">{client.saldo_pontos || 0}</div>
                  <div className="label">pontos</div>
                </div>
              </ClientInfo>

              {editingClient === client.id ? (
                <PointsEditor>
                  <div className="form-group">
                    <label>Valor</label>
                    <input
                      type="number"
                      value={pointsChange}
                      onChange={(e) => setPointsChange(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ação</label>
                    <select
                      value={changeType}
                      onChange={(e) => setChangeType(e.target.value)}
                    >
                      <option value="add">Adicionar</option>
                      <option value="subtract">Subtrair</option>
                      <option value="set">Definir valor</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="success"
                      onClick={() => handlePointsChange(client.id)}
                      disabled={loading}
                    >
                      <FiSave />
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setEditingClient(null)}
                    >
                      <FiX />
                    </Button>
                  </div>
                </PointsEditor>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  <Button
                    onClick={() => setEditingClient(client.id)}
                  >
                    <FiEdit3 />
                    Alterar Pontos
                  </Button>
                </div>
              )}

              {editingClient === client.id && (
                <FormGroup style={{ marginTop: '1rem' }}>
                  <label>Motivo da alteração</label>
                  <input
                    type="text"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="Ex: Ajuste por erro no sistema, bônus especial..."
                  />
                </FormGroup>
              )}
            </ClientCard>
          ))}
        </Section>

        {/* Seção de Configurações Gerais */}
        <Section>
          <SectionTitle>
            <FiTarget />
            Configurações do Programa
          </SectionTitle>

          <ConfigGrid>
            <ConfigCard color="#38a169">
              <div className="title">
                <FiClock />
                Validade dos Pontos
              </div>
              <div className="description">
                Pontos expiram após este período
              </div>
              <div className="value">365 dias</div>
            </ConfigCard>

            <ConfigCard color="#3182ce">
              <div className="title">
                <FiCalendar />
                Prazo para Envio
              </div>
              <div className="description">
                Prazo máximo para envio de notas
              </div>
              <div className="value">10 dias</div>
            </ConfigCard>

            <ConfigCard color="#d69e2e">
              <div className="title">
                <FiAward />
                Pontos Mínimos
              </div>
              <div className="description">
                Mínimo para resgatar prêmios
              </div>
              <div className="value">100 pontos</div>
            </ConfigCard>

            <ConfigCard color="#805ad5">
              <div className="title">
                <FiPercent />
                Multiplicador
              </div>
              <div className="description">
                Multiplicador base de pontos
              </div>
              <div className="value">1x</div>
            </ConfigCard>
          </ConfigGrid>

          <div style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FiInfo style={{ color: '#1565c0', fontSize: '1.5rem' }} />
            <div style={{ color: '#1565c0' }}>
              <strong>Informação:</strong> As configurações acima são fixas no sistema atual.
              Em versões futuras será possível editá-las através desta interface.
            </div>
          </div>
        </Section>
      </SectionsGrid>
    </Container>
  );
}

export default AdminConfiguracaoesNovo;
