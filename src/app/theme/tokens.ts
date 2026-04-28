// Design System Tokens - AGENTS.md Design System
// Royal Purple + Warm Gold palette

export const colors = {
  // Primary palette (Royal Purple)
  primary: '#6B21A8',
  primaryLight: '#8B5CF6',
  primaryDark: '#4C1D95',
  
  // Secondary palette (Warm Gold)
  secondary: '#D97706',
  secondaryLight: '#F59E0B',
  secondaryDark: '#B45309',
  
  // Chat bubbles (AGENTS.md)
  userBubble: '#6B21A8', // Royal Purple for user
  slawsBubble: '#FFF8E1', // Warm Cream for Slaws
  
  // Subscription badge gradient
  subscriptionGradient: ['#6B21A8', '#D97706'],
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Semantic colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Background
  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: '#FFFFFF',
};

export const typography = {
  // Font families (AGENTS.md: Roboto for UI, Poppins for brand)
  fontFamily: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    brand: 'Poppins-SemiBold', // Brand moments
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  px: 1,
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
  '24': 96,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};
