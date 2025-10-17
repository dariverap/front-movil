// lib/theme.ts
// Theme roles and spacing for the Parking app
export const COLORS = {
  // Primary colors
  primary: '#667eea',
  primaryStart: '#667eea',
  primaryEnd: '#764ba2',
  secondary: '#f093fb',
  
  // Status colors
  success: '#4fd1c7',
  successLight: 'rgba(79, 209, 199, 0.1)',
  warning: '#f6ad55',
  warningLight: 'rgba(246, 173, 85, 0.1)',
  error: '#fc8181',
  errorLight: 'rgba(252, 129, 129, 0.1)',
  info: '#63b3ed',
  infoLight: 'rgba(99, 179, 237, 0.1)',
  
  // Background colors
  background: '#f7fafc',
  backgroundSoft: '#edf2f7',
  surface: '#ffffff',
  
  // Text colors
  text: '#2d3748',
  textDark: '#2d3748',
  textMid: '#4a5568',
  textSecondary: '#718096',
  
  // UI elements
  border: '#e2e8f0',
  white: '#ffffff',
  glass: 'rgba(255,255,255,0.6)',
  shadow: 'rgba(39, 41, 61, 0.08)',
};

export const SPACING = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
};

export const RADIUS = {
  small: 8,
  regular: 12,
  large: 16,
  pill: 999,
};

export const TYPE = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 22,
    fontWeight: '600' as const,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
};

export default { COLORS, SPACING, RADIUS, TYPE };