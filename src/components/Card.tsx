import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ThemeColors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function Card({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
}: CardProps) {
  const { colors } = useTheme();
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return styles(colors).paddingNone;
      case 'small':
        return styles(colors).paddingSmall;
      case 'large':
        return styles(colors).paddingLarge;
      default:
        return styles(colors).paddingMedium;
    }
  };

  const cardStyle = [
    styles(colors).card,
    styles(colors)[variant],
    getPaddingStyle(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: Layout.borderRadius.lg,
    },
    // Variants
    default: {
      backgroundColor: colors.surface,
    },
    elevated: {
      backgroundColor: colors.surface,
    },
    outlined: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    // Padding variants
    paddingNone: {},
    paddingSmall: {
      padding: Layout.spacing.sm,
    },
    paddingMedium: {
      padding: Layout.spacing.md,
    },
    paddingLarge: {
      padding: Layout.spacing.lg,
    },
  });
