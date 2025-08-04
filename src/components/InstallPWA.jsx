import React, { useState, useEffect } from 'react';
import { FiSmartphone, FiDownload } from 'react-icons/fi';
import { showInstallPrompt, isPWAInstalled } from '../pwa/registerSW.js';

const InstallPWA = () => {
    const [showInstall, setShowInstall] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Verificar se é mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

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
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const handleInstall = async () => {
        try {
            // Para desktop, sempre tentar o prompt nativo primeiro
            if (!isMobile) {
                const result = await showInstallPrompt();
                if (result) {
                    setShowInstall(false);
                }
                return;
            }

            // Para mobile, verificar se é iOS/Safari
            if (isMobile && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
                // No iOS/Safari, guiar para instalação manual
                alert(
                    '📱 Para instalar o app:\n\n' +
                    '1. Toque no botão de compartilhar (📤)\n' +
                    '2. Selecione "Adicionar à Tela de Início"\n' +
                    '3. Confirme "Adicionar"\n\n' +
                    'O app ficará na sua tela inicial!'
                );
                return;
            }

            // Para Android mobile, tentar prompt nativo
            const result = await showInstallPrompt();
            if (result) {
                setShowInstall(false);
            }
        } catch (error) {
            console.log('Erro na instalação:', error);
            // Fallback para instalação manual
            if (isMobile) {
                alert('📱 Use o menu do seu navegador para "Adicionar à tela inicial"');
            } else {
                alert('💻 Use o ícone de instalação na barra de endereços ou menu do navegador');
            }
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
                    padding: isMobile ? '10px 16px' : '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(169, 25, 24, 0.3)',
                    animation: 'pulseInstall 3s infinite',
                    transition: 'all 0.3s ease',
                    minWidth: isMobile ? '100px' : 'auto',
                    maxWidth: isMobile ? '120px' : 'none',
                    whiteSpace: 'nowrap'
                }}
            >
                {isMobile ? <FiDownload size={16} /> : <FiSmartphone size={16} />}
                {isMobile ? 'Instalar' : 'Instalar App'}
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
          box-shadow: 0 6px 16px rgba(169, 25, 24, 0.4);
        }

        .pwa-install-button:active {
          transform: translateY(0) scale(0.98);
        }

        /* Garantir posicionamento fixo em todas as telas */
        .pwa-install-button {
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          z-index: 1000 !important;
        }
      `}</style>
        </>
    );
};

export default InstallPWA;
