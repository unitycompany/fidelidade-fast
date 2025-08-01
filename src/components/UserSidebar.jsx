import React from 'react';
import styled from 'styled-components';
import { FiHome, FiUpload, FiGift, FiUser, FiStar, FiShoppingCart, FiRefreshCw } from 'react-icons/fi';

const SidebarContainer = styled.div`
  width: 240px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-right: 1px solid ${({ theme }) => theme.colors.gray200};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100vw;
    min-height: unset;
    height: auto;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray200};
    padding-top: 0;
    padding-bottom: 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }
`;

const SidebarLogo = styled.img`
  width: 110px;
  height: auto;
  margin-bottom: 1.2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
`;

const SidebarPoints = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.5rem;
`;

const SidebarPointsValue = styled.div`
  font-size: 2.1rem;
  font-weight: 700;
  color: #cc1515;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SidebarPointsLabel = styled.div`
  font-size: 1rem;
  color: #222;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const SidebarMenu = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SidebarMenuItem = styled.button`
  background: ${({ active, theme }) => active ? theme.colors.gradientPrimary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  border: none;
  padding: 1.1rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1rem;
  border-radius: 8px;
  margin: 0 0.5rem;
  transition: all 0.2s;
  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.gradientPrimary : theme.colors.background};
  }
`;

function getSidebarMenuItems(isAdmin) {
    if (isAdmin) {
        return [
            { key: 'admin', label: 'Configuração de Pontos', icon: FiStar },
            { key: 'admin-resgates', label: 'Resgates', icon: FiGift },
            { key: 'admin-catalogo', label: 'Catálogo de Prêmios', icon: FiShoppingCart },
            { key: 'admin-estatisticas', label: 'Estatísticas', icon: FiRefreshCw },
        ];
    }
    return [
        { key: 'dashboard', label: 'Dashboard', icon: FiHome },
        { key: 'upload', label: 'Enviar Nota', icon: FiUpload },
        { key: 'premios', label: 'Prêmios', icon: FiGift },
        { key: 'perfil', label: 'Perfil', icon: FiUser },
    ];
}

const UserSidebar = ({ currentPage, onPageChange, user }) => {
    const isAdmin = user?.isAdmin || user?.is_admin || user?.email === 'admin@fastsistemas.com.br';
    const menuItems = getSidebarMenuItems(isAdmin);
    return (
        <SidebarContainer>
            <SidebarLogo src="https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/336e2c64-e66b-487b-d0e5-40df2b33d100/public" alt="Logo Fast" />
            <SidebarPoints>
                <SidebarPointsValue>
                    <FiStar style={{ marginRight: 6 }} />
                    {user?.saldo_pontos || 0}
                </SidebarPointsValue>
                <SidebarPointsLabel>Pontos</SidebarPointsLabel>
            </SidebarPoints>
            <SidebarMenu>
                {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <SidebarMenuItem
                            key={item.key}
                            active={currentPage === item.key}
                            onClick={() => onPageChange(item.key)}
                        >
                            <Icon />
                            {item.label}
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarContainer>
    );
};

export default UserSidebar;
