import styled, { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.primary};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: ${({ theme }) => theme.lineHeights.normal};
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.gray100};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray300};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.gray400};
  }

  /* Botões e inputs base */
  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* Links */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Foco acessível */
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible,
  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* Transições suaves */
  * {
    transition: background-color ${({ theme }) => theme.transitions.fast},
                border-color ${({ theme }) => theme.transitions.fast},
                color ${({ theme }) => theme.transitions.fast},
                box-shadow ${({ theme }) => theme.transitions.fast},
                transform ${({ theme }) => theme.transitions.fast};
  }

  /* Loading animation */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes slideIn {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`

// Container principal
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[4]};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 ${({ theme }) => theme.spacing[6]};
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 0 ${({ theme }) => theme.spacing[8]};
  }
`

// Layout de página
export const PageLayout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

export const PageHeader = styled.header`
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing[4]} 0;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

export const PageContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[6]} 0;
`

export const PageFooter = styled.footer`
  background: ${({ theme }) => theme.colors.gray600};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[8]} 0;
  margin-top: auto;
`

// Cards
export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  
  ${({ hover, theme }) => hover && `
    cursor: pointer;
    transition: all ${theme.transitions.base};
    
    &:hover {
      box-shadow: ${theme.shadows.md};
      transform: translateY(-2px);
    }
  `}
`

export const CardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.gray50};
`

export const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
`

export const CardFooter = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.gray50};
`

// Grid system
export const Grid = styled.div`
  display: grid;
  gap: ${({ gap = 4, theme }) => theme.spacing[gap]};
  
  ${({ cols }) => cols && `
    grid-template-columns: repeat(${cols}, 1fr);
  `}
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`

// Flex utilities
export const Flex = styled.div`
  display: flex;
  align-items: ${({ align = 'center' }) => align};
  justify-content: ${({ justify = 'flex-start' }) => justify};
  gap: ${({ gap = 2, theme }) => theme.spacing[gap]};
  flex-direction: ${({ direction = 'row' }) => direction};
  flex-wrap: ${({ wrap = 'nowrap' }) => wrap};
`

// Typography
export const Heading = styled.h1`
  font-size: ${({ size = '2xl', theme }) => theme.fontSizes[size]};
  font-weight: ${({ weight = 'bold', theme }) => theme.fontWeights[weight]};
  line-height: ${({ theme }) => theme.lineHeights.tight};
  color: ${({ color = 'text', theme }) => theme.colors[color]};
  margin-bottom: ${({ mb = 0, theme }) => theme.spacing[mb]};
`

export const Text = styled.p`
  font-size: ${({ size = 'base', theme }) => theme.fontSizes[size]};
  font-weight: ${({ weight = 'normal', theme }) => theme.fontWeights[weight]};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  color: ${({ color = 'text', theme }) => theme.colors[color]};
  margin-bottom: ${({ mb = 0, theme }) => theme.spacing[mb]};
`

// Loading
export const LoadingSpinner = styled.div`
  width: ${({ size = 6, theme }) => theme.spacing[size]};
  height: ${({ size = 6, theme }) => theme.spacing[size]};
  border: 2px solid ${({ theme }) => theme.colors.gray200};
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
`

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`
