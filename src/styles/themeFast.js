

// Tema Fast Sistemas Construtivos - Profissional e Moderno
const themeFast = {
    colors: {
        // Cores principais da Fast Sistemas (baseado no site)
        primary: '#cc1515', // Laranja vibrante
        primaryLight: '#7c1414', // Laranja claro
        primaryDark: '#9d1b17', // Laranja escuro

        // Cores secundárias
        secondary: '#cc1515', // Azul profissional
        secondaryLight: '#7c1414',
        secondaryDark: '#9d1b17',

        // Cores de apoio
        accent: '#F7931E', // Amarelo-laranja
        accentLight: '#FFB74D',
        accentDark: '#F57C00',

        // Cores de status
        success: '#38A169',
        warning: '#F7931E',
        error: '#E53E3E',
        info: '#3182CE',
        disabled: '#CBD5E0',

        // Cores neutras
        white: '#FFFFFF',
        gray50: '#F7FAFC',
        gray100: '#EDF2F7',
        gray200: '#E2E8F0',
        gray300: '#CBD5E0',
        gray400: '#A0AEC0',
        gray500: '#718096',
        gray600: '#4A5568',
        gray700: '#2D3748',
        gray800: '#1A202C',
        gray900: '#171923',

        // Cores de fundo
        background: '#FFFFFF',
        backgroundSecondary: '#F8FAFC',
        backgroundDark: '#1A202C',
        cardBackground: '#FFFFFF',

        // Cores de texto
        text: '#2D3748',
        textSecondary: '#4A5568',
        textLight: '#718096',
        textWhite: '#FFFFFF',

        // Gradientes modernos
        gradientPrimary: 'linear-gradient(135deg, #cc1515 0%,rgb(170, 14, 14) 100%)',
        gradientSecondary: 'linear-gradient(135deg, #1A365D 0%, #2D4A6D 100%)',
        gradientAccent: 'linear-gradient(135deg, #cc1515 0%,rgb(235, 41, 41) 100%)',
        gradientSuccess: 'linear-gradient(135deg, #38A169 0%, #68D391 100%)',
        gradientSecondary: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
        gradientAccent: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
        gradientPoints: 'linear-gradient(135deg, #1a365d 0%, #38a169 100%)',

        // Cores específicas do sistema de fidelidade
        points: '#38a169',
        pointsBackground: '#f0fff4',
        level: '#d69e2e',
        levelBackground: '#fffbf0',
        reward: '#e53e3e',
        rewardBackground: '#fef5f5'
    },

    // Tipografia
    fonts: {
        primary: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
        secondary: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', monospace",
    },

    // Pesos de fonte
    fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
    },

    // Tamanhos de fonte
    fontSizes: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem',    // 48px
    },

    // Espaçamentos unificados
    spacing: {
        px: '1px',
        1: '0.25rem',     // 4px
        2: '0.5rem',      // 8px
        3: '0.75rem',     // 12px
        4: '1rem',        // 16px
        5: '1.25rem',     // 20px
        6: '1.5rem',      // 24px
        7: '1.75rem',     // 28px
        8: '2rem',        // 32px
        10: '2.5rem',     // 40px
        12: '3rem',       // 48px
        16: '4rem',       // 64px
        20: '5rem',       // 80px
        // Alias para compatibilidade
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        '4xl': '4rem',
        '5xl': '5rem'
    },

    // Raios de borda
    borderRadius: {
        none: '0',
        sm: '4px',
        base: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',   // Círculo
    },

    // Alias para borderRadius (compatibilidade)
    radii: {
        none: '0',
        sm: '0.25rem',    // 4px
        base: '0.5rem',   // 8px
        md: '0.75rem',    // 12px
        lg: '1rem',       // 16px
        xl: '1.5rem',     // 24px
        full: '9999px',   // Círculo
    },

    // Sombras
    shadows: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        outline: '0 0 0 3px rgba(26, 54, 93, 0.5)',
        none: 'none'
    },

    // Breakpoints para responsividade
    breakpoints: {
        sm: '480px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        '2xl': '1400px'
    },

    // Transições
    transitions: {
        fast: '150ms ease-in-out',
        normal: '300ms ease-in-out',
        slow: '500ms ease-in-out'
    },

    // Line Heights
    lineHeights: {
        none: '1',
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2'
    }
}

export default themeFast
