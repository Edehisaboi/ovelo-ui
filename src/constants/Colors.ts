export type ThemeType = 'light' | 'dark';

export type ThemeColors = {
  // Gradients
  backgroundGradient: [string, string];
  background: string;
  surface: string;
  surfaceLight: string;
  // Accents
  primary: string;
  primaryLight: string;
  primaryDark: string;
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  // Status
  success: string;
  error: string;
  warning: string;
  // Overlay
  overlay: string;
  overlayLight: string;
  // Button
  buttonPrimary: string;
  buttonSecondary: string;
  buttonDisabled: string;
  // Card
  card: string;
  cardBorder: string;
  // Animation
  pulse: string;
};

export const ColorPalettes: Record<ThemeType, ThemeColors> = {
  dark: {
    backgroundGradient: ['#09121a', '#000000'],
    background: '#09121a',
    surface: '#09121a',
    surfaceLight: '#0c1924',
    primary: '#B8B8B8',
    primaryLight: '#FFFFFF',
    primaryDark: '#636363',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#808080',
    success: '#00FF88',
    error: '#FF4444',
    warning: '#FFA502',
    overlay: 'rgba(9, 18, 26, 0.7)',
    overlayLight: 'rgba(30, 37, 46, 0.3)',
    buttonPrimary: '#09121a',
    buttonSecondary: '#1e252e',
    buttonDisabled: '#404040',
    card: '#1e252e',
    cardBorder: '#232b36',
    pulse: 'rgba(0, 212, 255, 0.3)',
  },
  light: {
    backgroundGradient: ['#FFFFFF', '#DBDBDB'],
    background: '#f9f9fb',
    surface: '#FFFFFF',
    surfaceLight: '#F0F1F6',
    primary: '#09121a',
    primaryLight: '#0c1924',
    primaryDark: '#0051A8',
    text: '#1A1A1A',
    textSecondary: '#5A5A5A',
    textMuted: '#A0A0A0',
    success: '#00C851',
    error: '#FF4444',
    warning: '#FFBB33',
    overlay: 'rgba(245, 246, 250, 0.7)',
    overlayLight: 'rgba(245, 246, 250, 0.3)',
    buttonPrimary: '#007AFF',
    buttonSecondary: '#F5F6FA',
    buttonDisabled: '#E0E0E0',
    card: '#FFFFFF',
    cardBorder: '#E0E0E0',
    pulse: 'rgba(0, 122, 255, 0.15)',
  },
};

export function getColors(theme: ThemeType): ThemeColors {
  return ColorPalettes[theme];
}
