// Sistema de Notificações Inteligentes
import { supabase } from '../services/supabase.js';

class NotificationManager {
    constructor() {
        this.isEnabled = false;
        this.init();
    }

    async init() {
        // Verificar se notificações são suportadas
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.log('Notificações não suportadas neste navegador');
            return;
        }

        // Pedir permissão após o usuário usar o app por um tempo
        setTimeout(() => {
            this.requestPermissionGently();
        }, 60000); // 1 minuto após carregar

        this.isEnabled = Notification.permission === 'granted';

        if (this.isEnabled) {
            this.scheduleNotifications();
        }
    }

    async requestPermissionGently() {
        if (Notification.permission === 'default') {
            // Mostrar uma mensagem explicativa antes de pedir permissão
            const shouldAsk = confirm(
                '🔔 Quer receber notificações sobre seus pontos e prêmios?\n\n' +
                '• Lembretes semanais para acumular pontos\n' +
                '• Confirmação quando resgatar prêmios\n' +
                '• Ofertas especiais da Fast\n\n' +
                'Clique OK para ativar ou Cancelar para não receber.'
            );

            if (shouldAsk) {
                const permission = await Notification.requestPermission();
                this.isEnabled = permission === 'granted';

                if (this.isEnabled) {
                    this.sendWelcomeNotification();
                    this.scheduleNotifications();
                }
            }
        }
    }

    sendWelcomeNotification() {
        this.sendNotification(
            'Fast Fidelidade ativado! 🎉',
            'Notificações ativadas com sucesso! Agora você receberá lembretes para acumular pontos.',
            '/dashboard'
        );
    }

    async scheduleNotifications() {
        if (!this.isEnabled) return;

        // Verificar última atividade do usuário
        this.checkUserActivity();

        // Agendar verificações regulares
        setInterval(() => {
            this.checkUserActivity();
        }, 24 * 60 * 60 * 1000); // Verificar diariamente
    }

    async checkUserActivity() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user?.id) return;

            // Verificar último upload de nota
            const { data: uploads, error } = await supabase
                .from('pedidos')
                .select('created_at')
                .eq('usuario_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                console.error('Erro ao verificar atividade:', error);
                return;
            }

            const lastUpload = uploads?.[0]?.created_at;
            const daysSinceLastUpload = this.getDaysSince(lastUpload);

            // Enviar notificação semanal se não cadastrou nota
            if (daysSinceLastUpload >= 7) {
                this.sendInactivityNotification(daysSinceLastUpload);
            }

        } catch (error) {
            console.error('Erro ao verificar atividade do usuário:', error);
        }
    }

    getDaysSince(dateString) {
        if (!dateString) return 999; // Muito tempo atrás

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    sendInactivityNotification(daysSinceLastUpload) {
        const messages = [
            {
                title: 'Ei! Compre na Fast e ganhe pontos! 🛒',
                body: 'Já faz uma semana que você não cadastra uma nota. Que tal fazer umas compras e acumular pontos?'
            },
            {
                title: 'Seus pontos estão esperando! ⭐',
                body: 'Faça suas compras na Fast e transforme cada real em pontos para trocar por prêmios incríveis!'
            },
            {
                title: 'Fast Fidelidade: Hora de acumular! 🎯',
                body: 'Não deixe de ganhar pontos! Cadastre suas notas fiscais e troque por prêmios exclusivos.'
            },
            {
                title: 'Que tal uma nova compra? 🏪',
                body: 'A Fast tem ofertas especiais te esperando. Compre, cadastre a nota e ganhe pontos!'
            }
        ];

        // Escolher mensagem baseada em quantos dias se passaram
        let messageIndex = 0;
        if (daysSinceLastUpload >= 14) messageIndex = 1;
        if (daysSinceLastUpload >= 21) messageIndex = 2;
        if (daysSinceLastUpload >= 30) messageIndex = 3;

        const message = messages[messageIndex];

        this.sendNotification(
            message.title,
            message.body,
            '/upload',
            'inactivity'
        );
    }

    async sendPrizeRedemptionNotification(prizeName) {
        if (!this.isEnabled) return;

        this.sendNotification(
            'Parabéns! Prêmio resgatado! 🎉',
            `Você resgatou: ${prizeName}. Agora dirija-se até uma loja Fast para retirar seu prêmio!`,
            '/meus-resgates',
            'prize-redeemed'
        );
    }

    async sendPointsEarnedNotification(points) {
        if (!this.isEnabled) return;

        this.sendNotification(
            'Pontos creditados! ⭐',
            `Você ganhou ${points} pontos! Continue comprando e acumule ainda mais.`,
            '/dashboard',
            'points-earned'
        );
    }

    sendNotification(title, body, url = '/', tag = 'general') {
        if (!this.isEnabled) return;

        // Verificar se a mesma notificação foi enviada recentemente
        const lastNotificationKey = `last-notification-${tag}`;
        const lastNotification = localStorage.getItem(lastNotificationKey);
        const now = Date.now();

        // Não enviar a mesma notificação se foi enviada nas últimas 24 horas
        if (lastNotification && (now - parseInt(lastNotification)) < 24 * 60 * 60 * 1000) {
            return;
        }

        // Salvar timestamp da notificação
        localStorage.setItem(lastNotificationKey, now.toString());

        const options = {
            body,
            icon: '/src/assets/icon.png',
            badge: '/src/assets/icon.png',
            vibrate: [200, 100, 200],
            data: {
                url,
                timestamp: now
            },
            tag,
            requireInteraction: false,
            silent: false
        };

        // Verificar se o usuário está ativo na aba
        if (document.hidden || !document.hasFocus()) {
            new Notification(title, options);
        }
    }

    // Método para ser chamado quando o usuário resgata um prêmio
    async onPrizeRedeemed(prizeName) {
        await this.sendPrizeRedemptionNotification(prizeName);
    }

    // Método para ser chamado quando pontos são creditados
    async onPointsEarned(points) {
        await this.sendPointsEarnedNotification(points);
    }

    // Desativar notificações
    disable() {
        this.isEnabled = false;
        localStorage.setItem('notifications-disabled', 'true');
    }

    // Reativar notificações
    async enable() {
        const permission = await Notification.requestPermission();
        this.isEnabled = permission === 'granted';
        localStorage.removeItem('notifications-disabled');

        if (this.isEnabled) {
            this.scheduleNotifications();
        }

        return this.isEnabled;
    }
}

// Instância global do gerenciador de notificações
export const notificationManager = new NotificationManager();

// Funções utilitárias para usar nos componentes
export const notifyPrizeRedeemed = (prizeName) => {
    notificationManager.onPrizeRedeemed(prizeName);
};

export const notifyPointsEarned = (points) => {
    notificationManager.onPointsEarned(points);
};

export default notificationManager;
