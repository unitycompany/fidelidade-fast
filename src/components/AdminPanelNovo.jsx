import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSettings, FiGift, FiBarChart2, FiDollarSign } from 'react-icons/fi';
import AdminResgates from './AdminResgates';
import AdminPremios from './AdminPremios';
import AdminEstatisticasNovo from './AdminEstatisticasNovo';
import { getPointsPerReal, setPointsPerReal } from '../utils/config';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 240px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-right: 1px solid ${props => props.theme.colors.gray200};
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
    display: flex;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid ${props => props.theme.colors.gray200};
  }
`;

const MenuItem = styled.button`
  width: 100%;
  background: ${props => props.active ? props.theme.colors.gradientPrimary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  padding: 1rem;
  border: none;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &:hover {
    background: ${props => props.active ? props.theme.colors.gradientPrimary : props.theme.colors.background};
  }
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex: 1;
    justify-content: center;
    text-align: center;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  background: ${props => props.theme.colors.background};
`;

const ConfigSection = styled.div`
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.base};
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  font-weight: 600;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

function AdminPanelNovo() {
    const [section, setSection] = useState('config');
    const [pointsPerRealState, setPointsPerRealState] = useState(1);

    useEffect(() => {
        const current = getPointsPerReal();
        setPointsPerRealState(current);
    }, []);

    const handleSaveConfig = () => {
        setPointsPerReal(pointsPerRealState);
        window.alert('Configuração salva!');
    };

    return (
        <Container>
            <Sidebar>
                <MenuItem active={section === 'config'} onClick={() => setSection('config')}>
                    <FiDollarSign /> Valor por R$
                </MenuItem>
                <MenuItem active={section === 'resgates'} onClick={() => setSection('resgates')}>
                    <FiSettings /> Resgates
                </MenuItem>
                <MenuItem active={section === 'catalogo'} onClick={() => setSection('catalogo')}>
                    <FiGift /> Catálogo de Prêmios
                </MenuItem>
                <MenuItem active={section === 'estatisticas'} onClick={() => setSection('estatisticas')}>
                    <FiBarChart2 /> Estatísticas
                </MenuItem>
            </Sidebar>
            <Content>
                {section === 'config' && (
                    <ConfigSection>
                        <h2>Configuração de Pontos</h2>
                        <label>Quantidade de pontos por R$1,00 gasto:</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={pointsPerRealState}
                            onChange={e => setPointsPerRealState(parseFloat(e.target.value) || 0)}
                        />
                        <Button onClick={handleSaveConfig}>Salvar</Button>
                    </ConfigSection>
                )}
                {section === 'resgates' && <AdminResgates />}
                {section === 'catalogo' && <AdminPremios />}
                {section === 'estatisticas' && <AdminEstatisticasNovo />}
            </Content>
        </Container>
    );
}

export default AdminPanelNovo;