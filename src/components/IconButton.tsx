import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemeColors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

interface IconButtonProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

export default function IconButton({
  icon,
  onPress,
  size = 'medium',
  variant = 'default',
  disabled = false,
  style,
}: IconButtonProps) {
  const { colors } = useTheme();
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 56;
      default:
        return 44;
    }
  };

  const getIconColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.textSecondary;
      case 'danger':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.buttonDisabled;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surface;
      case 'danger':
        return colors.error;
      default:
        return colors.overlayLight;
    }
  };

  const buttonStyle = [
    styles(colors).button,
    {
      width: getButtonSize(),
      height: getButtonSize(),
      borderRadius: getButtonSize() / 2,
      backgroundColor: getBackgroundColor(),
    },
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={getIconSize()} color={getIconColor()} />
    </TouchableOpacity>
  );
}

const styles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
