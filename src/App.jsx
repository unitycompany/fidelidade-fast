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
import MeusResgates from './components/MeusResgates'
import { inicializarProdutosElegiveis } from './utils/inicializarProdutos'
import { inicializarPremios } from './utils/inicializarPremios'

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
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isAdminMode, setIsAdminMode] = useState(false)

  // Função global para forçar refresh de dados
  const triggerGlobalRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Verificar se há sessão salva ao carregar a página
  useEffect(() => {
    const initializeApp = async () => {
      // Verificar URL especial para acesso admin
      const urlParams = new URLSearchParams(window.location.search)
      const adminAccess = urlParams.get('admin')

      if (adminAccess === 'fastsistemas2024') {
        setIsAdminMode(true)
        // Criar usuário admin temporário
        const adminUser = {
          id: 'admin',
          nome: 'Administrador Fast',
          email: 'admin@fastsistemas.com.br',
          isAdmin: true,
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
            // Verificar se é admin salvo
            if (userData.isAdmin) {
              setIsAdminMode(true)
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

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('clubeFastUser', JSON.stringify(userData))
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

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardFast user={user} setCurrentView={setCurrentPage} refreshTrigger={refreshTrigger} />
      case 'upload':
        return <UploadPedidoNovo user={user} onUserUpdate={handleUserUpdate} />
      case 'premios':
        return <PremiosNovo user={user} onUserUpdate={handleUserUpdate} />
      case 'resgates':
        return <MeusResgates usuario={user} onClose={() => setCurrentPage('dashboard')} />
      case 'admin-resgates':
        return <AdminResgates />
      case 'admin': // Painel administrativo completo
        return <AdminPanelNovo />
      case 'criar-tabelas':
        return <CriarTabelaPremios />
      case 'test':
        return <TestConnection />
      case 'debug':
        return <DebugUpload />
      case 'db-debug':
        return <DatabaseDebugNovo />
      default:
        return <DashboardFast user={user} setCurrentView={setCurrentPage} refreshTrigger={refreshTrigger} />
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
        <NavigationResponsivo
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          user={user}
          onLogout={handleLogout}
          isAdminMode={isAdminMode}
        />
        {renderPage()}
      </AuthContext.Provider>
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}

export default App
