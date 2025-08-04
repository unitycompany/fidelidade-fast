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
    console.log('💾 Prompt de instalação disponível');
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
    deferredPrompt = null;
    // Pode mostrar uma mensagem de sucesso
    showInstallSuccess();
  });
}

// Função para mostrar o prompt de instalação
export async function showInstallPrompt() {
  if (!deferredPrompt) {
    console.log('Prompt de instalação não disponível');
    return false;
  }

  // Mostra o prompt
  deferredPrompt.prompt();
  
  // Aguarda a escolha do usuário
  const { outcome } = await deferredPrompt.userChoice;
  console.log('Resultado da instalação:', outcome);
  
  // Limpa o prompt
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

// Verificar se já está instalado
export function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

// Mostrar notificação de atualização disponível
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
}
