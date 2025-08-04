import { ThemeColors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useTheme } from '../context/ThemeContext';
import { useVideo } from '../context/VideoContext';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, RouteProp } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LoadingSpinner } from '../components';
import { RootStackParamList } from '../types';

export default function ProcessingScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Processing'>>();
  const { source } = route.params;
  const { colors } = useTheme();
  const { progress } = useVideo();

  // Progress is managed by the VideoContext when streaming is active
  // No need to trigger identification here as it's handled by the camera screen

  const spinAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);

  useEffect(() => {
    // Start spinning animation
    spinAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      false,
    );

    // Start pulsing animation
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true,
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => {
    const rotate = interpolate(spinAnimation.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.1]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.7, 1]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    const progressWidth = interpolate(
      progress,
      [0, 100],
      [0, Layout.window.width * 0.8],
    );
    return {
      width: progressWidth,
    };
  });

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      style={styles(colors).container}
    >
      {/* Main Content */}
      <View style={styles(colors).content}>
        {/* Film Reel Icon */}
        <LoadingSpinner
          variant="film-reel"
          size="large"
          text="Identifying video..."
          color={colors.primary}
        />

        {/* Processing Text */}
        <View style={styles(colors).textContainer}>
          <Text style={styles(colors).subtitle}>
            Analyzing your{' '}
            {source === 'screen' ? 'screen recording' : 'video clip'}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles(colors).progressContainer}>
          <View style={styles(colors).progressBar}>
            <Animated.View
              style={[styles(colors).progressFill, progressStyle]}
            />
          </View>
          <Text style={styles(colors).progressText}>
            {Math.round(progress)}%
          </Text>
        </View>

        {/* Loading Dots */}
        <LoadingSpinner variant="dots" size="small" color={colors.primary} />
      </View>

      {/* Footer */}
      <View style={styles(colors).footer}>
        <Text style={styles(colors).footerText}>
          This may take a few seconds
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Layout.spacing.lg,
    },
    iconContainer: {
      marginBottom: Layout.spacing.xxl,
    },
    filmReel: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.overlayLight,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    textContainer: {
      alignItems: 'center',
      marginBottom: Layout.spacing.xxl,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: Layout.spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    progressContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: Layout.spacing.xl,
    },
    progressBar: {
      width: Layout.window.width * 0.8,
      height: 4,
      backgroundColor: colors.overlayLight,
      borderRadius: 2,
      marginBottom: Layout.spacing.md,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    loadingDots: {
      marginTop: Layout.spacing.lg,
    },
    dots: {
      fontSize: 24,
      color: colors.primary,
      letterSpacing: 4,
    },
    footer: {
      paddingHorizontal: Layout.spacing.lg,
      paddingBottom: Layout.spacing.xl,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
