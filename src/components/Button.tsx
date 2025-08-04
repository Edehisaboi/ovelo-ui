import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { ThemeColors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();
  const buttonStyle = [
    styles(colors).button,
    styles(colors)[variant],
    styles(colors)[size],
    disabled && styles(colors).disabled,
    style,
  ];

  const textStyleArray = [
    styles(colors).text,
    styles(colors)[`${variant}Text`],
    styles(colors)[`${size}Text`],
    disabled && styles(colors).disabledText,
    textStyle,
  ];

  const renderIcon = () => {
    if (!icon || loading) return null;

    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    const iconColor =
      variant === 'primary' ? colors.background : colors.primary;

    return (
      <Ionicons
        name={icon}
        size={iconSize}
        color={disabled ? colors.textMuted : iconColor}
        style={
          iconPosition === 'right'
            ? styles(colors).iconRight
            : styles(colors).iconLeft
        }
      />
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.background : colors.primary}
        />
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          <Text style={textStyleArray}>{title}</Text>
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Layout.borderRadius.lg,
    },
    // Variants
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    danger: {
      backgroundColor: colors.error,
    },
    // Sizes
    small: {
      paddingHorizontal: Layout.spacing.md,
      paddingVertical: Layout.spacing.sm,
      minHeight: 36,
    },
    medium: {
      paddingHorizontal: Layout.spacing.lg,
      paddingVertical: Layout.spacing.md,
      minHeight: 48,
    },
    large: {
      paddingHorizontal: Layout.spacing.xl,
      paddingVertical: Layout.spacing.lg,
      minHeight: 56,
    },
    // States
    disabled: {
      backgroundColor: colors.buttonDisabled,
      borderColor: colors.buttonDisabled,
    },
    // Text styles
    text: {
      fontWeight: '600',
      textAlign: 'center',
    },
    primaryText: {
      color: colors.background,
    },
    secondaryText: {
      color: colors.primary,
    },
    dangerText: {
      color: colors.background,
    },
    smallText: {
      fontSize: 14,
    },
    mediumText: {
      fontSize: 16,
    },
    largeText: {
      fontSize: 18,
    },
    disabledText: {
      color: colors.textMuted,
    },
    // Icon styles
    iconLeft: {
      marginRight: Layout.spacing.sm,
    },
    iconRight: {
      marginLeft: Layout.spacing.sm,
    },
  });
