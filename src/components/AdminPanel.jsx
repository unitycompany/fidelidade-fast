import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiShield, FiGift, FiSettings, FiDollarSign, FiPackage, FiList, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import AdminResgates from './AdminResgates';
import AdminPremios from './AdminPremios';
import AdminPremiosCompleto from './AdminPremiosCompleto';
import AdminConfiguracoes from './AdminConfiguracoes';
import AdminConfiguracaoesNovo from './AdminConfiguracaoesNovo';
import AdminConfiguracoesProdutos from './AdminConfiguracoesProdutos';
import AdminProdutosCompleto from './AdminProdutosCompleto';
import AdminEstatisticas from './AdminEstatisticas';
import AdminEstatisticasNovo from './AdminEstatisticasNovo';

// Animações
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
  background: linear-gradient(135deg, #9c1220, #c82333);
  color: white;
  border-radius: 5px;
  padding: 2rem;
  margin-bottom: 1rem;
  box-shadow: ${props => props.theme.shadows.lg};
  animation: ${fadeInUp} 0.6s ease-out;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  p {
    font-size: 1.2rem;
    opacity: 0.9;
  }
`;

const TabNavigation = styled.div`
  background: white;
  border-radius: 5px;
  padding: .5rem;
  margin-bottom: 1rem;
  box-shadow: ${props => props.theme.shadows.md};
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;
`;

const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  background: ${props => props.$active ? props.theme.colors.gradientPrimary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.$active ? props.theme.colors.gradientPrimary : props.theme.colors.gray100};
    transform: translateY(-2px);
  }
`;

const TabContent = styled.div`
  animation: ${fadeInUp} 0.4s ease-out;
`;

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('produtos');

  const tabs = [
    {
      id: 'produtos',
      label: 'Produtos Elegíveis',
      icon: FiPackage,
      component: AdminProdutosCompleto
    },
    {
      id: 'resgates',
      label: 'Resgates',
      icon: FiGift,
      component: AdminResgates
    },
    {
      id: 'premios',
      label: 'Catálogo de Prêmios',
      icon: FiDollarSign,
      component: AdminPremiosCompleto
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: FiSettings,
      component: AdminConfiguracaoesNovo
    },
    {
      id: 'estatisticas',
      label: 'Estatísticas',
      icon: FiBarChart2,
      component: AdminEstatisticasNovo
    }
  ];

  const renderTabContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    if (activeTabData) {
      const Component = activeTabData.component;
      return <Component />;
    }
    return null;
  };

  return (
    <Container>
      <Header>
        <h1>
          <FiShield />
          Painel Administrativo
        </h1>
        <p>Gerencie resgates, prêmios e configurações do sistema</p>
      </Header>

      <TabNavigation>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon />
            {tab.label}
          </TabButton>
        ))}
      </TabNavigation>

      <TabContent>
        {renderTabContent()}
      </TabContent>
    </Container>
  );
}

export default AdminPanel;
