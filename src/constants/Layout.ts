import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  // Screen dimensions
  window: {
    width,
    height,
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Button sizes
  button: {
    height: 56,
    borderRadius: 28,
  },

  // Card sizes
  card: {
    borderRadius: 16,
    padding: 16,
  },

  // Camera frame
  cameraFrame: {
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: 16,
  },

  // Result poster
  poster: {
    height: height * 0.4,
    borderRadius: 16,
  },
} as const;
