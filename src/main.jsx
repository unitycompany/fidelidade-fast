import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initPWA } from './pwa/registerSW.js'
import './services/notificationManager.js'

// Inicializar PWA (Service Worker + Install Prompt)
initPWA()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
