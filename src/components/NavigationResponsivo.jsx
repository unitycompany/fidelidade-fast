import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FiHome,
  FiUpload,
  FiGift,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiStar,
  FiSettings,
  FiShield
} from 'react-icons/fi';
import { supabase } from '../services/supabase';

// Animações
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled Components
const NavContainer = styled.nav`
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 3px solid ${props => props.theme.colors.primary};
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 0 0.5rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  width: 200px;
  
  svg {
    width: max-content;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLink = styled.button`
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text};
  border: none;
  border-radius: 0px!important;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  
  &:hover {
    background: ${props => props.$active ? props.theme.colors.primaryDark : '#f8f9fa'};
    transform: translateY(-2px);
  }
  
  &::before {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.theme.colors.primary};
    transform: scaleX(${props => props.$active ? 1 : 0});
    transition: transform 0.3s ease;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    gap: 0.5rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 0.9rem;
`;

const UserPoints = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.gradientPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #c82333;
    transform: translateY(-2px);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: 0.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled.div`
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    animation: ${slideDown} 0.3s ease-out;
    border-top: 1px solid #e9ecef;
  }
`;

const MobileMenuContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MobileNavLink = styled.button`
  background: ${props => props.$active ? props.theme.colors.gradientPrimary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text};
  border: none;
  padding: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  text-align: left;
  
  &:hover {
    background: ${props => props.$active ? props.theme.colors.gradientPrimary : '#f8f9fa'};
  }
`;

const MobileUserInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  text-align: center;
`;

const Overlay = styled.div`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 90;
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const navigationItems = [
  { key: 'dashboard', label: 'Dashboard', icon: FiHome },
  { key: 'upload', label: 'Enviar Nota', icon: FiUpload },
  { key: 'premios', label: 'Prêmios', icon: FiGift }
];

// Itens administrativos (apenas para admins)
const adminItems = [
  { key: 'admin', label: 'Painel Admin', icon: FiShield }
];

function NavigationResponsivo({ currentPage, onPageChange, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userAtualizado, setUserAtualizado] = useState(user);

  // Função para buscar dados atualizados do usuário
  const buscarDadosUsuario = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('clientes_fast')
        .select('saldo_pontos, total_pontos_ganhos, total_pontos_gastos')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const dadosAtualizados = {
        ...user,
        saldo_pontos: data.saldo_pontos,
        total_pontos_ganhos: data.total_pontos_ganhos,
        total_pontos_gastos: data.total_pontos_gastos
      };

      setUserAtualizado(dadosAtualizados);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setUserAtualizado(user);
    }
  }, [user?.id, user?.nome, user?.email]); // Dependências específicas para evitar loops

  // Buscar dados atualizados quando o user.id mudar
  useEffect(() => {
    if (user?.id) {
      buscarDadosUsuario();
    }
  }, [user?.id]); // Remover buscarDadosUsuario da dependência

  // Escutar mudanças globais e atualizar
  useEffect(() => {
    const handleGlobalRefresh = () => {
      if (user?.id) {
        buscarDadosUsuario();
      }
    };

    window.addEventListener('userUpdated', handleGlobalRefresh);

    return () => {
      window.removeEventListener('userUpdated', handleGlobalRefresh);
    };
  }, [user?.id]); // Apenas user.id como dependência

  // Verificar se usuário é admin (agora usando CPF)
  const isAdmin = user?.cpf_cnpj === '000.000.000-00' ||
    user?.email === 'admin@fastsistemas.com.br' ||
    user?.is_admin === true ||
    false;

  // Combinar itens normais com admin se necessário
  const allNavigationItems = isAdmin ? [...navigationItems, ...adminItems] : navigationItems;

  const handlePageChange = (page) => {
    onPageChange(page);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    onLogout();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <NavContainer>
        <NavContent>
          <Logo>
            <img src="https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/336e2c64-e66b-487b-d0e5-40df2b33d100/public" alt="" />
          </Logo>

          <NavLinks>
            {allNavigationItems.map(item => (
              <NavLink
                key={item.key}
                $active={currentPage === item.key}
                onClick={() => handlePageChange(item.key)}
              >
                <item.icon />
                {item.label}
              </NavLink>
            ))}
          </NavLinks>

          <UserSection>
            <UserInfo>
              <UserName>
                {user?.nome?.split(' ')[0] || 'Usuário'}
              </UserName>
              <UserPoints>
                <FiStar />
                {userAtualizado?.saldo_pontos?.toLocaleString() || '0'} pts
              </UserPoints>
            </UserInfo>

            <UserAvatar onClick={() => handlePageChange('perfil')}>
              {getInitials(user?.nome)}
            </UserAvatar>

            <LogoutButton onClick={handleLogout} title="Sair">
              <FiLogOut />
            </LogoutButton>

            <MobileMenuButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </MobileMenuButton>
          </UserSection>
        </NavContent>

        <MobileMenu $isOpen={mobileMenuOpen}>
          <MobileMenuContent>
            <MobileUserInfo>
              <UserAvatar style={{ margin: '0 auto 0.5rem' }}>
                {getInitials(user?.nome)}
              </UserAvatar>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                {user?.nome || 'Usuário'}
              </div>
              <UserPoints style={{ justifyContent: 'center' }}>
                <FiStar />
                {userAtualizado?.saldo_pontos?.toLocaleString() || '0'} pontos
              </UserPoints>
            </MobileUserInfo>

            {allNavigationItems.map(item => (
              <MobileNavLink
                key={item.key}
                $active={currentPage === item.key}
                onClick={() => handlePageChange(item.key)}
              >
                <item.icon />
                {item.label}
              </MobileNavLink>
            ))}

            <MobileNavLink onClick={handleLogout}>
              <FiLogOut />
              Sair
            </MobileNavLink>
          </MobileMenuContent>
        </MobileMenu>
      </NavContainer>

      <Overlay $isOpen={mobileMenuOpen} onClick={closeMobileMenu} />
    </>
  );
}

export default NavigationResponsivo;
