// =====================================================
// DESIGN SYSTEM - CAFETEC
// =====================================================
// Sistema de design voltado para produtores rurais de café

export const colors = {
  // Cores Primárias - Tons de Café
  primary: {
    dark: '#3E2723', // Café torrado escuro
    main: '#5D4037', // Café torrado médio
    medium: '#6D4C41', // Café torrado claro
    light: '#8D6E63', // Café com leite
    lightest: '#A1887F', // Bege café
  },

  // Cores Secundárias - Plantação
  secondary: {
    dark: '#2E7D32', // Verde escuro (plantação madura)
    main: '#43A047', // Verde médio (folhas)
    light: '#66BB6A', // Verde claro (brotos)
    lightest: '#A5D6A7', // Verde muito claro
  },

  // Cores de Destaque - Produção/Qualidade
  accent: {
    gold: '#F9A825', // Dourado (qualidade premium)
    amber: '#FFA726', // Âmbar (produção)
    yellow: '#FFEB3B', // Amarelo (colheita)
  },

  // Cores de Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Cores Neutras
  neutral: {
    white: '#FFFFFF',
    lightest: '#FAFAFA',
    lighter: '#F5F5F5',
    light: '#EEEEEE',
    medium: '#E0E0E0',
    dark: '#BDBDBD',
    darker: '#757575',
    darkest: '#424242',
    black: '#212121',
  },

  // Cores de Texto
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
    hint: '#9E9E9E',
  },

  // Backgrounds
  background: {
    primary: '#FAFAFA',
    secondary: '#FFFFFF',
    tertiary: '#F5F5F5',
    dark: '#3E2723',
  },

  // Gradientes
  gradients: {
    coffee: ['#5D4037', '#3E2723'],
    sunrise: ['#FF9800', '#F9A825'],
    plantation: ['#43A047', '#2E7D32'],
    earth: ['#8D6E63', '#5D4037'],
  },
}

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    '4xl': 40,
  },
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
}

export const borderRadius = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
}

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
}

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
}

export type Theme = typeof theme
