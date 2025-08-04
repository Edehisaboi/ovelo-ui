import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ThemeColors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useTheme } from '../context/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'film-reel';
  text?: string;
  color?: string;
}

export default function LoadingSpinner({
  size = 'medium',
  variant = 'spinner',
  text,
  color,
}: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const spinAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (variant === 'film-reel') {
      spinAnimation.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        false,
      );
    }

    if (variant === 'dots') {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  const spinStyle = useAnimatedStyle(() => {
    const rotate = interpolate(spinAnimation.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.2]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.5, 1]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 40;
      default:
        return 30;
    }
  };

  const getContainerSize = () => {
    switch (size) {
      case 'small':
        return 60;
      case 'large':
        return 120;
      default:
        return 80;
    }
  };

  const spinnerColor = color || colors.primary;

  const renderSpinner = () => (
    <ActivityIndicator size={getSpinnerSize()} color={spinnerColor} />
  );

  const renderDots = () => (
    <Animated.View style={[styles(colors).dotsContainer, pulseStyle]}>
      <Text style={[styles(colors).dots, { color: spinnerColor }]}>•••</Text>
    </Animated.View>
  );

  const renderFilmReel = () => (
    <Animated.View style={[styles(colors).filmReelContainer, spinStyle]}>
      <View
        style={[
          styles(colors).filmReel,
          { width: getContainerSize(), height: getContainerSize() },
        ]}
      >
        <Ionicons
          name="film"
          size={getContainerSize() * 0.6}
          color={spinnerColor}
        />
      </View>
    </Animated.View>
  );

  const renderContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'film-reel':
        return renderFilmReel();
      default:
        return renderSpinner();
    }
  };

  return (
    <View style={styles(colors).container}>
      {renderContent()}
      {text && (
        <Text style={[styles(colors).text, { color: spinnerColor }]}>
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotsContainer: {
      alignItems: 'center',
    },
    dots: {
      fontSize: 24,
      letterSpacing: 4,
    },
    filmReelContainer: {
      alignItems: 'center',
    },
    filmReel: {
      borderRadius: 999,
      backgroundColor: colors.overlayLight,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    text: {
      fontSize: 16,
      marginTop: Layout.spacing.md,
      textAlign: 'center',
    },
  });
