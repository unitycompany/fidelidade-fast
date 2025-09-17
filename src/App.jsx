import React, { useState, createContext, useContext, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import styled from 'styled-components'
import { Toaster, toast } from 'react-hot-toast'
import { GlobalStyle } from './styles/GlobalStyle'
import themeFast from './styles/themeFast'
import NavigationResponsivo from './components/NavigationResponsivo'
import DashboardFast from './components/DashboardFast'
import UploadPedidoNovo from './components/UploadPedidoNovo'
import TestConnection from './components/TestConnection'
import DebugUpload from './components/DebugUpload'
import AuthNovoClean from './components/AuthNovoClean'
import DatabaseDebugNovo from './components/DatabaseDebugNovo'
import PremiosNovo from './components/PremiosNovo'
import CriarTabelaPremios from './components/CriarTabelaPremios'
import AdminResgates from './components/AdminResgates'
import AdminPanelNovo from './components/AdminPanelNovo'
import AdminUsuarios from './components/AdminUsuarios'
import GerenteResgates from './components/GerenteResgates'
import MeusResgates from './components/MeusResgates'
import Perfil from './components/Perfil'
import { inicializarProdutosElegiveis } from './utils/inicializarProdutos'
import { inicializarPremios } from './utils/inicializarPremios'
import SidebarVertical from './components/SidebarVertical'
import { supabase } from './services/supabase'
import LoadingGif from './components/LoadingGif'
import { RegulamentoPage } from './components/Regulamento'

// Contexto para autenticação e estado global
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

function App() {
  const [currentPage, setCurrentPage] = useState('upload')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isAdminMode, setIsAdminMode] = useState(false)
  // Novo: mostrar campo 'meus resgates' se houver resgates
  const [temResgates, setTemResgates] = useState(false);
  // Modal bloqueante para gerente sem Cidade/UF
  const [showLojaModal, setShowLojaModal] = useState(false);
  const [lojaInput, setLojaInput] = useState('');
  const [savingLoja, setSavingLoja] = useState(false);
  const [lojaMsg, setLojaMsg] = useState('');

  // Função global para forçar refresh de dados
  const triggerGlobalRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Verificar se há sessão salva ao carregar a página
  useEffect(() => {
    const initializeApp = async () => {
      // Carregar usuário salvo
      const savedUserData = localStorage.getItem('clubeFastUser')
      if (savedUserData) {
        try {
          const storageData = JSON.parse(savedUserData)
          
          // Verificar se os dados são do formato antigo (migração)
          let userData, isExpired;
          
          if (storageData.user && storageData.expiry) {
            // Novo formato com expiração
            userData = storageData.user
            isExpired = Date.now() > storageData.expiry
          } else {
            // Formato antigo sem expiração - converter
            userData = storageData
            isExpired = false
            
            // Migrar para novo formato com expiração
            const newStorageData = {
              user: userData,
              expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
            }
            localStorage.setItem('clubeFastUser', JSON.stringify(newStorageData))
          }
          
          // Verificar se a sessão expirou
          if (isExpired) {
            console.log('Sessão expirada, realizando logout')
            localStorage.removeItem('clubeFastUser')
            return
          }
          
          // Verificar autenticidade do token (poderia incluir aqui validação com backend)
          setUser(userData)
          
          // Verificar role do usuário
          const userRole = userData.role || 'cliente'
          if (userRole === 'admin' || userRole === 'dev') {
            setIsAdminMode(true)
            setCurrentPage('admin')
          } else if (userRole === 'gerente') {
            setCurrentPage('gerente-resgates')
          }
        } catch (error) {
          console.error('Erro ao carregar usuário salvo:', error)
          localStorage.removeItem('clubeFastUser')
        }
      }

      // Inicializar produtos elegíveis automaticamente
      try {
        await inicializarProdutosElegiveis()
      } catch (error) {
        console.warn('⚠️ Não foi possível inicializar produtos automaticamente:', error)
      }

      // Inicializar catálogo de prêmios automaticamente
      try {
        await inicializarPremios()
      } catch (error) {
        console.warn('⚠️ Não foi possível inicializar prêmios automaticamente:', error)
      }

      setIsLoading(false)
      // Manter a tela de loading até o GIF terminar de rodar
      // setShowLoadingScreen será controlado pelo callback do LoadingGif
    }

    initializeApp()
  }, [])

  // Novo: verificar se há resgates na conta do usuário
  useEffect(() => {
    async function checarResgates() {
      if (user?.id) {
        const { data, error } = await supabase
          .from('resgates')
          .select('id')
          .eq('cliente_id', user.id)
          .limit(1);
        setTemResgates(data && data.length > 0);
      } else {
        setTemResgates(false);
      }
    }
    checarResgates();
  }, [user, refreshTrigger]); // Adicionado refreshTrigger para atualizar quando houver resgate

  const handleLogin = (userData) => {
    console.log('🔐 Login realizado:', userData.nome)
    
    // Remover dados sensíveis antes de armazenar
    const userToStore = {
      ...userData,
      // Remove dados sensíveis
      senha: undefined,
      token: userData.token // Manter apenas o token de autenticação
    }
    
    setUser(userToStore)
    
    // Armazenar com expiração (24 horas)
    const storageData = {
      user: userToStore,
      expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    }
    localStorage.setItem('clubeFastUser', JSON.stringify(storageData))

    // Determinar página inicial baseado no role
    const userRole = userData.role || 'cliente'
    if (userRole === 'admin' || userRole === 'dev') {
      setIsAdminMode(true)
      setCurrentPage('admin')
    } else if (userRole === 'gerente') {
      setIsAdminMode(false)
      setCurrentPage('gerente-resgates')
    } else {
      setIsAdminMode(false)
      setCurrentPage('upload')
    }
  }

  const handleUserUpdate = (updatedUserData) => {
    console.log('📊 Atualizando usuário no App:', updatedUserData)
    setUser(updatedUserData)
    localStorage.setItem('clubeFastUser', JSON.stringify(updatedUserData))
    triggerGlobalRefresh()
  }

  // Função global para atualizar usuário de qualquer lugar
  const updateGlobalUser = (newData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newData }
      localStorage.setItem('clubeFastUser', JSON.stringify(updatedUser))
      triggerGlobalRefresh()
      return updatedUser
    })
  }

  // Disponibilizar funções globalmente
  React.useEffect(() => {
    window.updateUserContext = updateGlobalUser
    window.triggerGlobalRefresh = triggerGlobalRefresh
  }, [])

  // ===== Validação Cidade/UF (mesmo padrão do Perfil) =====
  const validateLoja = (s) => {
    if (!s) return false;
    const parts = String(s).split('/');
    if (parts.length !== 2) return false;
    const cidade = parts[0].trim();
    const uf = parts[1].trim();
    if (!cidade || cidade.length < 2) return false;
    if (!/^[A-Za-zÀ-ÿ0-9' .-]{2,}$/.test(cidade)) return false;
    if (!/^[A-Za-z]{2}$/.test(uf)) return false;
    return true;
  };

  // Abrir modal se gerente sem Cidade/UF válida
  useEffect(() => {
    if (!user) return;
    if (user.role === 'gerente' && !validateLoja(user.loja_nome)) {
      setLojaInput(user.loja_nome || '');
      setShowLojaModal(true);
    } else {
      setShowLojaModal(false);
    }
  }, [user]);

  const handleSalvarLoja = async () => {
    const val = (lojaInput || '').trim();
    setLojaMsg('');
    if (!validateLoja(val)) {
      setLojaMsg('Informe no formato Cidade/UF. Exemplo: Campo Grande/RJ');
      return;
    }
    try {
      setSavingLoja(true);
      const { error } = await supabase
        .from('clientes_fast')
        .update({ loja_nome: val })
        .eq('id', user.id);
      if (error) throw error;
      // Atualizar contexto/localStorage
      updateGlobalUser({ loja_nome: val });
      toast.success('Unidade (Cidade/UF) salva com sucesso.');
      setShowLojaModal(false);
    } catch (e) {
      console.error('Erro ao salvar Cidade/UF do gerente:', e);
      setLojaMsg('Não foi possível salvar agora. Tente novamente.');
      toast.error('Erro ao salvar Cidade/UF');
    } finally {
      setSavingLoja(false);
    }
  };

  const handleLogout = () => {
    // Limpar estado
    setUser(null)
    setIsAdminMode(false)
    setCurrentPage('dashboard')
    
    // Limpar todos os dados de sessão
    localStorage.removeItem('clubeFastUser')
    sessionStorage.clear()
    
    // Limpar funções globais
    window.updateUserContext = null
    window.triggerGlobalRefresh = null
    
    // Limpar cookies relacionados à sessão (caso existam)
    document.cookie.split(';').forEach(cookie => {
      document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  }

  // Função para verificar permissões
  const temPermissao = (permissaoRequerida) => {
    const userRole = user?.role || 'cliente'

    switch (permissaoRequerida) {
      case 'cliente':
        // Páginas de cliente agora são apenas para 'cliente'
        return ['cliente'].includes(userRole)
      case 'gerente':
        return ['gerente', 'admin', 'dev'].includes(userRole)
      case 'admin':
        return ['admin', 'dev'].includes(userRole)
      default:
        return false
    }
  }

  const renderPage = () => {
    // Verificar permissões antes de renderizar páginas
    switch (currentPage) {
      case 'perfil':
        return temPermissao('cliente') ? <Perfil user={user} onUserUpdate={handleUserUpdate} /> : <div>Acesso negado</div>
      case 'upload':
        return temPermissao('cliente') ? <UploadPedidoNovo user={user} onUserUpdate={handleUserUpdate} /> : <div>Acesso negado</div>
      case 'premios':
        return temPermissao('cliente') ? <PremiosNovo user={user} onUserUpdate={handleUserUpdate} /> : <div>Acesso negado</div>
      case 'meus-resgates':
        return temPermissao('cliente') ? <MeusResgates usuario={user} onClose={() => setCurrentPage('upload')} /> : <div>Acesso negado</div>

      // Página informativa acessível a todos os perfis logados
      case 'como-ganhar-pontos':
        return <RegulamentoPage />

      // Páginas de Admin
      case 'admin':
        return temPermissao('admin') ? <AdminPanelNovo section="resgates" user={user} /> : <div>Acesso negado</div>
      case 'admin-resgates':
        return temPermissao('gerente') ? <AdminPanelNovo section="resgates" user={user} /> : <div>Acesso negado</div>
      case 'admin-catalogo':
        return temPermissao('admin') ? <AdminPanelNovo section="catalogo" /> : <div>Acesso negado</div>
      case 'admin-estatisticas':
        return temPermissao('admin') ? <AdminPanelNovo section="estatisticas" /> : <div>Acesso negado</div>
      case 'admin-usuarios':
        return temPermissao('admin') ? <AdminUsuarios user={user} /> : <div>Acesso negado</div>

      // Página específica para Gerentes
      case 'gerente-resgates':
        return temPermissao('gerente') ? <AdminPanelNovo section="resgates" user={user} /> : <div>Acesso negado</div>

      // Páginas de debug/desenvolvimento (apenas admin)
      case 'debug':
        return temPermissao('admin') ? <DatabaseDebugNovo /> : <div>Acesso negado</div>
      case 'test':
        return temPermissao('admin') ? <TestConnection /> : <div>Acesso negado</div>
      case 'debug-upload':
        return temPermissao('admin') ? <DebugUpload /> : <div>Acesso negado</div>
      case 'criar-premios':
        return temPermissao('admin') ? <CriarTabelaPremios /> : <div>Acesso negado</div>

      default:
        // Redirecionar baseado no role
        const userRole = user?.role || 'cliente'
        if (userRole === 'gerente') {
          return <GerenteResgates user={user} />
        } else if (userRole === 'admin' || userRole === 'dev') {
          return <AdminPanelNovo section="config" />
        } else {
          return <UploadPedidoNovo user={user} onUserUpdate={handleUserUpdate} />
        }
    }
  }

  // Callback para esconder a tela de loading quando o GIF terminar
  const handleLoadingComplete = () => {
    // Só esconder se os dados já estiverem carregados
    if (!isLoading) {
      setShowLoadingScreen(false)
    }
  }

  // Verificar se pode esconder o loading quando os dados terminarem de carregar
  useEffect(() => {
    if (!isLoading && !showLoadingScreen) {
      // Se os dados já carregaram e o GIF já terminou, tudo pronto
      return
    }

    if (!isLoading) {
      // Se os dados carregaram mas o GIF ainda está rodando, aguardar o GIF terminar
      return
    }
  }, [isLoading, showLoadingScreen])

  // Tela de loading enquanto verifica sessão ou enquanto o GIF está rodando
  if (showLoadingScreen) {
    return (
      <ThemeProvider theme={themeFast}>
        <GlobalStyle />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          background: '#fcfcff',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          transition: 'opacity 0.6s ease-in-out'
        }}>
          <LoadingGif
            text="Inicializando sistema..."
            size="450px"
            mobileSize="350px"
            minHeight="100vh"
            minDuration={3000}
            onComplete={handleLoadingComplete}
          />
        </div>
      </ThemeProvider>
    )
  }

  // Se não estiver logado, mostrar Auth
  if (!user) {
    return (
      <ThemeProvider theme={themeFast}>
        <GlobalStyle />
        <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
          <AuthNovoClean onLogin={handleLogin} />
          <Toaster position="top-right" />
        </AuthContext.Provider>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={themeFast}>
      <GlobalStyle />
      <AuthContext.Provider value={{ user, logout: handleLogout }}>
        {/* Layout responsivo com sidebar */}
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <SidebarVertical
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            user={user}
            onLogout={handleLogout}
            isAdminMode={isAdminMode}
            temResgates={temResgates}
          />
          <div style={{
            flex: 1,
            marginLeft: '250px',
            transition: 'margin-left 0.3s ease'
          }}
            className="main-content-area"
          >
            {renderPage()}
          </div>
        </div>
        {/* Modal bloqueante para gerente sem Cidade/UF */}
        {showLojaModal && (
          <ModalOverlay>
            <ModalCard>
              <ModalHeader>Defina sua unidade (Cidade/UF)</ModalHeader>
              <ModalBody>
                <p style={{ margin: '0 0 10px 0', color: '#555' }}>
                  Para continuar, informe a unidade responsável pelas coletas.
                </p>
                <InputWrap>
                  <ModalInput
                    type="text"
                    value={lojaInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parts = val.split('/');
                      if (parts.length === 2) {
                        setLojaInput(parts[0] + '/' + parts[1].toUpperCase());
                      } else {
                        setLojaInput(val);
                      }
                    }}
                    placeholder="Cidade/UF (ex: Campo Grande/RJ)"
                  />
                </InputWrap>
                {lojaMsg && <ModalError>{lojaMsg}</ModalError>}
              </ModalBody>
              <ModalFooter>
                <PrimaryButton onClick={handleSalvarLoja} disabled={savingLoja}>
                  {savingLoja ? 'Salvando...' : 'Salvar e continuar'}
                </PrimaryButton>
              </ModalFooter>
            </ModalCard>
          </ModalOverlay>
        )}
        <style jsx global>{`
          @media (max-width: 900px) {
            .main-content-area {
              margin-left: 0 !important;
              padding-top: 64px !important;
            }
          }
        `}</style>
      </AuthContext.Provider>
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}

export default App

// ===== Modal styles =====
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalCard = styled.div`
  width: 92%;
  max-width: 520px;
  background: #fff;
  border: 1px solid #e9ecef;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #A91918, #d32f2f);
  color: #fff;
  padding: 14px 16px;
  font-weight: 700;
`;

const ModalBody = styled.div`
  padding: 16px;
`;

const ModalFooter = styled.div`
  padding: 12px 16px 16px 16px;
  display: flex;
  justify-content: flex-end;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  font-size: 15px;
  outline: none;
  &:focus { border-color: #A91918; box-shadow: 0 0 0 3px rgba(169,25,24,0.1); }
`;

const ModalError = styled.div`
  margin-top: 8px;
  color: #b00020;
  background: #fff0f0;
  border: 1px solid #f5bfc0;
  padding: 8px 10px;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #A91918 0%, #8B1514 100%);
  color: #fff;
  border: none;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
`;

const InputWrap = styled.div`
  position: relative;
`;
