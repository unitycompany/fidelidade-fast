import React, { useState, createContext, useContext, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { Toaster } from 'react-hot-toast'
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
import { inicializarProdutosElegiveis } from './utils/inicializarProdutos'
import { inicializarPremios } from './utils/inicializarPremios'
import SidebarVertical from './components/SidebarVertical'
import { supabase } from './services/supabase'

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
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isAdminMode, setIsAdminMode] = useState(false)
  // Novo: mostrar campo 'meus resgates' se houver resgates
  const [temResgates, setTemResgates] = useState(false);

  // Função global para forçar refresh de dados
  const triggerGlobalRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Verificar se há sessão salva ao carregar a página
  useEffect(() => {
    const initializeApp = async () => {
      // Verificar URL especial para acesso admin (manter compatibilidade)
      const urlParams = new URLSearchParams(window.location.search)
      const adminAccess = urlParams.get('admin')

      if (adminAccess === 'fastsistemas2024') {
        setIsAdminMode(true)
        // Criar usuário admin temporário
        const adminUser = {
          id: 'admin',
          nome: 'Administrador Fast',
          email: 'admin@fastsistemas.com.br',
          role: 'admin',
          saldo_pontos: 0
        }
        setUser(adminUser)
        setCurrentPage('admin')
        localStorage.setItem('clubeFastUser', JSON.stringify(adminUser))
        // Limpar URL para segurança
        window.history.replaceState({}, document.title, window.location.pathname)
      } else {
        // Carregar usuário salvo normal
        const savedUser = localStorage.getItem('clubeFastUser')
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser)
            setUser(userData)
            // Verificar role do usuário
            const userRole = userData.role || 'cliente'
            if (userRole === 'admin') {
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
    setUser(userData)
    localStorage.setItem('clubeFastUser', JSON.stringify(userData))

    // Determinar página inicial baseado no role
    const userRole = userData.role || 'cliente'
    if (userRole === 'admin') {
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

  const handleLogout = () => {
    setUser(null)
    setIsAdminMode(false)
    localStorage.removeItem('clubeFastUser')
    setCurrentPage('dashboard')

    // Limpar funções globais
    window.updateUserContext = null
    window.triggerGlobalRefresh = null
  }

  // Função para verificar permissões
  const temPermissao = (permissaoRequerida) => {
    const userRole = user?.role || 'cliente'

    switch (permissaoRequerida) {
      case 'cliente':
        return ['cliente', 'gerente', 'admin'].includes(userRole)
      case 'gerente':
        return ['gerente', 'admin'].includes(userRole)
      case 'admin':
        return userRole === 'admin'
      default:
        return false
    }
  }

  const renderPage = () => {
    // Verificar permissões antes de renderizar páginas
    switch (currentPage) {
      case 'upload':
        return temPermissao('cliente') ? <UploadPedidoNovo user={user} onUserUpdate={handleUserUpdate} /> : <div>Acesso negado</div>
      case 'premios':
        return temPermissao('cliente') ? <PremiosNovo user={user} onUserUpdate={handleUserUpdate} /> : <div>Acesso negado</div>
      case 'meus-resgates':
        return temPermissao('cliente') ? <MeusResgates usuario={user} onClose={() => setCurrentPage('upload')} /> : <div>Acesso negado</div>

      // Páginas de Admin
      case 'admin':
      case 'admin-config':
        return temPermissao('admin') ? <AdminPanelNovo section="config" /> : <div>Acesso negado</div>
      case 'admin-resgates':
        return temPermissao('gerente') ? <AdminPanelNovo section="resgates" /> : <div>Acesso negado</div>
      case 'admin-catalogo':
        return temPermissao('admin') ? <AdminPanelNovo section="catalogo" /> : <div>Acesso negado</div>
      case 'admin-estatisticas':
        return temPermissao('admin') ? <AdminPanelNovo section="estatisticas" /> : <div>Acesso negado</div>
      case 'admin-usuarios':
        return temPermissao('admin') ? <AdminUsuarios user={user} /> : <div>Acesso negado</div>

      // Página específica para Gerentes
      case 'gerente-resgates':
        return temPermissao('gerente') ? <GerenteResgates user={user} /> : <div>Acesso negado</div>

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
        } else if (userRole === 'admin') {
          return <AdminPanelNovo section="config" />
        } else {
          return <UploadPedidoNovo user={user} onUserUpdate={handleUserUpdate} />
        }
    }
  }

  // Tela de loading enquanto verifica sessão
  if (isLoading) {
    return (
      <ThemeProvider theme={themeFast}>
        <GlobalStyle />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: themeFast.colors.gradientPrimary,
          color: 'white',
          fontSize: '1.5rem'
        }}>
          Carregando...
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
