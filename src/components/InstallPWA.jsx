import React, { useState, useEffect } from 'react';
import { FiSmartphone } from 'react-icons/fi';
import { showInstallPrompt, isPWAInstalled } from '../pwa/registerSW.js';

const InstallPWA = () => {
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (isPWAInstalled()) {
      return;
    }

    // Escutar quando o prompt de instalação fica disponível
    const handleInstallAvailable = () => {
      setShowInstall(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    
    // Verificar após alguns segundos se pode mostrar o botão
    setTimeout(() => {
      if (!isPWAInstalled()) {
        setShowInstall(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    const result = await showInstallPrompt();
    if (result) {
      setShowInstall(false);
    }
  };

  // Não mostrar se já instalado
  if (isPWAInstalled() || !showInstall) {
    return null;
  }

  return (
    <>
      <button 
        onClick={handleInstall}
        className="pwa-install-button"
        title="Instalar aplicativo Fast Fidelidade"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#A91918',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          zIndex: 1000,
          animation: 'pulseInstall 3s infinite',
          transition: 'all 0.3s ease'
        }}
      >
        <FiSmartphone size={16} />
        Baixar APP
      </button>

      <style jsx>{`
        @keyframes pulseInstall {
          0%, 70%, 100% { 
            transform: scale(1); 
            opacity: 1;
          }
          35% { 
            transform: scale(1.05); 
            opacity: 0.9;
          }
        }
        
        .pwa-install-button:hover {
          transform: translateY(-2px) scale(1.02);
        }

        @media (max-width: 640px) {
          .pwa-install-button {
            bottom: 80px !important;
            right: 15px !important;
          }
        }
      `}</style>
    </>
  );
};

export default InstallPWA;
