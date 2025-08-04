// Service Worker Registration para PWA
export function registerSW() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });

                console.log('✅ Service Worker registrado com sucesso:', registration.scope);

                // Atualizar automaticamente quando há uma nova versão
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nova versão disponível, pode mostrar notificação para o usuário
                            console.log('🔄 Nova versão do app disponível!');
                            showUpdateAvailable();
                        }
                    });
                });

            } catch (error) {
                console.error('❌ Falha ao registrar Service Worker:', error);
            }
        });
    } else {
        console.log('Service Worker não é suportado neste navegador');
    }
}

// Install prompt para PWA
let deferredPrompt;

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💾 Prompt de instalação disponível (desktop/Android)');
    // Previne o Chrome de mostrar o prompt automaticamente
    e.preventDefault();
    // Salva o evento para usar depois
    deferredPrompt = e;
    
    // Dispara evento customizado para componentes React
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });

  // Quando o app é instalado
  window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA instalado com sucesso!');
    localStorage.setItem('pwa-installed', 'true');
    deferredPrompt = null;
    showInstallSuccess();
  });

  // Escutar evento customizado de instalação
  window.addEventListener('pwa-installed', () => {
    localStorage.setItem('pwa-installed', 'true');
  });

  // Log inicial para debug
  setTimeout(() => {
    console.log('🔍 Debug PWA:', {
      isInstalled: isPWAInstalled(),
      hasPrompt: !!deferredPrompt,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      userAgent: navigator.userAgent.substring(0, 50)
    });
  }, 2000);
}// Função para mostrar o prompt de instalação
export async function showInstallPrompt() {
    if (!deferredPrompt) {
        console.log('Prompt de instalação não disponível');

        // Detectar se é mobile para dar instruções específicas
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        if (isIOS) {
            // Instruções para iOS/Safari
            alert(
                '📱 Para instalar o Fast Fidelidade no iPhone/iPad:\n\n' +
                '1. Toque no botão de compartilhar (📤) na barra inferior\n' +
                '2. Role para baixo e toque em "Adicionar à Tela de Início"\n' +
                '3. Toque em "Adicionar" no canto superior direito\n\n' +
                'O app aparecerá na sua tela inicial! 🎉'
            );
        } else if (isAndroid) {
            // Instruções para Android
            alert(
                '📱 Para instalar o Fast Fidelidade no Android:\n\n' +
                '1. Toque no menu (⋮) do navegador\n' +
                '2. Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"\n' +
                '3. Confirme a instalação\n\n' +
                'O app aparecerá na sua tela inicial! 🎉'
            );
        } else if (isMobile) {
            // Outros dispositivos móveis
            alert(
                '📱 Para instalar o Fast Fidelidade:\n\n' +
                'Use o menu do seu navegador e procure por:\n' +
                '• "Instalar aplicativo"\n' +
                '• "Adicionar à tela inicial"\n' +
                '• "Instalar app"\n\n' +
                'O app ficará disponível na sua tela inicial! 🎉'
            );
        }

        return false;
    }

    try {
        // Mostra o prompt
        deferredPrompt.prompt();

        // Aguarda a escolha do usuário
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Resultado da instalação:', outcome);

        // Limpa o prompt
        deferredPrompt = null;

        if (outcome === 'accepted') {
            // Dispara evento de sucesso
            window.dispatchEvent(new CustomEvent('pwa-installed'));
        }

        return outcome === 'accepted';
    } catch (error) {
        console.error('Erro ao mostrar prompt de instalação:', error);
        deferredPrompt = null;
        return false;
    }
}

// Verificar se já está instalado
export function isPWAInstalled() {
    // Verificar display mode (funciona na maioria dos navegadores)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Verificar se é Safari standalone (iOS)
    const isIOSStandalone = window.navigator.standalone === true;
    
    // No desktop, ser mais conservador na detecção
    const isDesktop = !/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isDesktop) {
        // No desktop, só considerar instalado se realmente estiver em modo standalone
        return isStandalone;
    }
    
    // No mobile, verificar também localStorage para casos especiais
    const wasInstalledViaPrompt = localStorage.getItem('pwa-installed') === 'true';
    
    return isStandalone || isIOSStandalone || wasInstalledViaPrompt;
}// Mostrar notificação de atualização disponível
function showUpdateAvailable() {
    // Pode implementar um toast ou modal aqui
    if (confirm('Nova versão disponível! Deseja atualizar?')) {
        window.location.reload();
    }
}

// Mostrar sucesso da instalação
function showInstallSuccess() {
    // Pode mostrar um toast de sucesso
    console.log('App instalado na tela inicial! 🚀');
}

// Push Notifications
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Este navegador não suporta notificações');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

// Enviar notificação local
export function sendTestNotification() {
    if (Notification.permission === 'granted') {
        new Notification('Fast Fidelidade 🎯', {
            body: 'Parabéns! As notificações estão funcionando!',
            icon: '/src/assets/icon.png',
            badge: '/src/assets/icon.png',
            tag: 'test-notification'
        });
    }
}

// Inicializar PWA (chamar no main.jsx)
export function initPWA() {
    registerSW();
    setupInstallPrompt();

    // Escutar mensagens do Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.action === 'navigate') {
                // Navegar para URL específica quando notificação é clicada
                window.history.pushState({}, '', event.data.url);
                window.dispatchEvent(new PopStateEvent('popstate'));
            }
        });
    }
}
