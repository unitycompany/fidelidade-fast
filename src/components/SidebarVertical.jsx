import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  FiHome,
  FiUpload,
  FiGift,
  FiUser,
  FiLogOut,
  FiStar,
  FiSettings,
  FiList,
  FiDatabase,
  FiBarChart2,
  FiDollarSign,
  FiMenu
} from 'react-icons/fi';
import { supabase } from '../services/supabase';

const MobileSidebarToggle = styled.button`
  display: none;
  position: relative;
  background: none;
  border: none;
  line-height: 70%;
  font-size: 2rem;
  color: #1e1e1e;
  z-index: 300;
  @media (max-width: 900px) {
    display: block;
  }
`;

const MobileSidebarOverlay = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: ${props => props.open ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.3);
    z-index: 199;
  }
`;

const SidebarContainer = styled.aside`
  width: 250px;
  background: #fff;
  height: 100vh;
  position: fixed;
  border-right: 1px solid #1e1e1e10;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: transform 0.3s;
  @media (max-width: 900px) {
    transform: translateX(${props => props.open ? '0' : '-100%'});
    top: 64px;
    left: 0;
    height: calc(100vh - 64px);
    position: fixed;
    border-top: 1px solid #1e1e1e30;
  }
`;

const LogoSection = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  @media (max-width: 900px) {
    display: none;
  }
`;

const LogoImg = styled.img`
  width: 150px;
  margin-bottom: 1.5rem;
`;

const Points = styled.div`
  color: #1e1e1e;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.2rem;
  line-height: 100%;
  font-size: 1.3rem;

  & span {
    font-size: 1rem;
    font-weight: 400;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const NavItem = styled.li`
  margin: 0.5rem 0;
`;

const NavButton = styled.button`
  width: 100%;
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text};
  border: none;
  padding: .8rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border-radius: 0;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${props => props.$active ? props.theme.colors.primaryDark : '#f5f5f5'};
  }
`;

const UserSection = styled.div`
  padding: 1rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.colors.gradientPrimary};
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const LogoutButton = styled.button`
  margin-top: 1rem;
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &:hover {
    background: #c82333;
  }
`;

const navigationItems = [
  { key: 'upload', label: 'Enviar Nota', icon: FiUpload },
  { key: 'premios', label: 'Prêmios', icon: FiGift }
];

// Todas as opções do painel admin, apenas as que funcionam corretamente
const adminItems = [
  { key: 'admin-config', label: 'Configuração de Pontos', icon: FiDollarSign },
  { key: 'admin-resgates', label: 'Resgates Admin', icon: FiSettings },
  { key: 'admin-catalogo', label: 'Catálogo de Prêmios', icon: FiGift },
  { key: 'admin-estatisticas', label: 'Estatísticas', icon: FiBarChart2 }
];

const MobileHeader = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100vw;
    height: 64px;
    padding: 1rem 1.2rem;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 301;
  }
`;

const MobileLogo = styled.img`
  height: 36px;
`;

const MobilePoints = styled.div`
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 1rem;
`;

function SidebarVertical({ currentPage, onPageChange, user, onLogout, isAdminMode, temResgates }) {
  const [userAtualizado, setUserAtualizado] = useState(user);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Verifica admin igual NavigationResponsivo
  const isAdmin = user?.cpf_cnpj === '000.000.000-00' ||
    user?.email === 'admin@fastsistemas.com.br' ||
    user?.is_admin === true ||
    user?.isAdmin === true ||
    false;

  // Busca pontos atualizados do usuário igual NavigationResponsivo
  const buscarDadosUsuario = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('clientes_fast')
        .select('saldo_pontos, total_pontos_ganhos, total_pontos_gastos')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setUserAtualizado({ ...user, ...data });
    } catch (error) {
      setUserAtualizado(user);
    }
  }, [user]);

  useEffect(() => { buscarDadosUsuario(); }, [user?.id]);
  useEffect(() => {
    const handler = () => buscarDadosUsuario();
    window.addEventListener('userUpdated', handler);
    return () => window.removeEventListener('userUpdated', handler);
  }, [user?.id]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  // Corrige o espaçamento do conteúdo principal para não ficar atrás do header mobile
  useEffect(() => {
    if (window.innerWidth <= 900) {
      document.body.style.paddingTop = mobileOpen ? '0' : '64px';
    } else {
      document.body.style.paddingTop = '0';
    }
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader>
        <MobileLogo src="https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/336e2c64-e66b-487b-d0e5-40df2b33d100/public" alt="Logo" />
        <MobilePoints>
          {userAtualizado?.saldo_pontos?.toLocaleString() || '0'} pts
        </MobilePoints>
        <MobileSidebarToggle onClick={() => setMobileOpen(true)}>
          <FiMenu />
        </MobileSidebarToggle>
      </MobileHeader>
      <MobileSidebarOverlay open={mobileOpen} onClick={() => setMobileOpen(false)} />
      <SidebarContainer open={mobileOpen}>
        <LogoSection>
          <LogoImg src="https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/336e2c64-e66b-487b-d0e5-40df2b33d100/public" alt="Logo" />
          <Points>
            {userAtualizado?.saldo_pontos?.toLocaleString() || '0'} pts
          </Points>
        </LogoSection>
        <NavList>
          <NavItem>
            <NavButton $active={currentPage === 'upload'} onClick={() => { onPageChange('upload'); setMobileOpen(false); }}>
              <FiUpload /> Enviar Nota
            </NavButton>
          </NavItem>
          <NavItem>
            <NavButton $active={currentPage === 'premios'} onClick={() => { onPageChange('premios'); setMobileOpen(false); }}>
              <FiGift /> Prêmios
            </NavButton>
          </NavItem>
          {temResgates && (
            <NavItem>
              <NavButton $active={currentPage === 'meus-resgates'} onClick={() => { onPageChange('meus-resgates'); setMobileOpen(false); }}>
                <FiList /> Meus Resgates
              </NavButton>
            </NavItem>
          )}
          {isAdmin && adminItems.map(item => (
            <NavItem key={item.key}>
              <NavButton $active={currentPage === item.key} onClick={() => { onPageChange(item.key); setMobileOpen(false); }}>
                <item.icon />
                {item.label}
              </NavButton>
            </NavItem>
          ))}
        </NavList>
        <UserSection>
          <UserAvatar>{getInitials(user?.nome)}</UserAvatar>
          <UserName>{user?.nome?.split(' ')[0] || 'Usuário'}</UserName>
          <LogoutButton onClick={() => { onLogout(); setMobileOpen(false); }}><FiLogOut /> Sair</LogoutButton>
        </UserSection>
      </SidebarContainer>
    </>
  );
}

export default SidebarVertical;
