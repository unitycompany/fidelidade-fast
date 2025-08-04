import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSettings, FiGift, FiBarChart2, FiDollarSign } from 'react-icons/fi';
import AdminResgates from './AdminResgates';
import AdminPremios from './AdminPremios';
import AdminEstatisticasNovo from './AdminEstatisticasNovo';
import { getPointsPerReal, setPointsPerReal } from '../utils/config';

const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 1rem;
  
  @media (max-width: 900px) {
    padding: 0.5rem;
    min-height: calc(100vh - 64px);
  }
`;

const ConfigSection = styled.div`
  max-width: 800px;
  background: #fff;
  padding: 2rem;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 900px) {
    padding: 1rem;
    max-width: calc(100vw - 1rem);
    border-radius: 4px;
  }
  
  h2 {
    color: #2D3748;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  label {
    color: #4A5568;
    font-weight: 500;
    font-size: 1rem;
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: 4px;
  font-size: ${props => props.theme.fontSizes.base};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(204, 21, 21, 0.1);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  font-size: 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

function AdminPanelNovo({ section = 'config', user }) {
  const [pointsPerRealState, setPointsPerRealState] = useState(1);

  useEffect(() => {
    const current = getPointsPerReal();
    setPointsPerRealState(current);
  }, []);

  const handleSaveConfig = () => {
    setPointsPerReal(pointsPerRealState);
    window.alert('Configuração salva com sucesso!');
  };

  return (
    <Container>
      {section === 'config' && (
        <ConfigSection>
          <h2><FiDollarSign /> Configuração de Pontos</h2>
          <label>Quantidade de pontos por R$1,00 gasto:</label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={pointsPerRealState}
            onChange={e => setPointsPerRealState(parseFloat(e.target.value) || 0)}
            placeholder="Ex: 1.5"
          />
          <Button onClick={handleSaveConfig}>Salvar Configuração</Button>
        </ConfigSection>
      )}
      {section === 'resgates' && <AdminResgates user={user} />}
      {section === 'catalogo' && <AdminPremios />}
      {section === 'estatisticas' && <AdminEstatisticasNovo />}
    </Container>
  );
}

export default AdminPanelNovo;