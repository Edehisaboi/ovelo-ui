import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Layout } from '../constants/Layout';
import { useTheme } from '../context/ThemeContext';

const features = [
  {
    icon: 'videocam',
    title: 'Camera Identification',
    description:
      'Record video clips with your camera to identify movies and TV shows',
  },
  {
    icon: 'phone-portrait',
    title: 'Screen Recording',
    description:
      'Capture your screen to identify videos playing on your device',
  },
  {
    icon: 'star',
    title: 'Instant Results',
    description: 'Get detailed information about identified videos in seconds',
  },
  {
    icon: 'time',
    title: 'History',
    description: 'Keep track of all your identified videos for easy access',
  },
];

export default function WelcomeScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const { colors } = useTheme();

  const slideAnimation = useSharedValue(0);
  const fadeAnimation = useSharedValue(0);

  React.useEffect(() => {
    slideAnimation.value = withTiming(1, { duration: 800 });
    fadeAnimation.value = withTiming(1, { duration: 600 });
  }, [slideAnimation, fadeAnimation]);

  const slideStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      slideAnimation.value,
      [0, 1],
      [Layout.window.width, 0],
    );
    return {
      transform: [{ translateX }],
    };
  });

  const fadeStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnimation.value,
    };
  });

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    // In a real app, you'd save that the user has seen the welcome screen
    //router.replace("/");
  };

  const currentFeature = features[currentStep];

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      style={styles(colors).container}
    >
      {/* Skip Button */}
      <TouchableOpacity style={styles(colors).skipButton} onPress={handleSkip}>
        <Text style={styles(colors).skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles(colors).content}>
        {/* Feature Icon */}
        <Animated.View style={[styles(colors).iconContainer, slideStyle]}>
          <View style={styles(colors).iconBackground}>
            <Ionicons
              name={currentFeature.icon as any}
              size={80}
              color={colors.primary}
            />
          </View>
        </Animated.View>

        {/* Feature Text */}
        <Animated.View style={[styles(colors).textContainer, fadeStyle]}>
          <Text style={styles(colors).title}>{currentFeature.title}</Text>
          <Text style={styles(colors).description}>
            {currentFeature.description}
          </Text>
        </Animated.View>

        {/* Progress Dots */}
        <View style={styles(colors).progressContainer}>
          {features.map((_, index) => (
            <View
              key={index}
              style={[
                styles(colors).progressDot,
                index === currentStep && styles(colors).progressDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles(colors).bottomSection}>
        {/* Action Button */}
        <TouchableOpacity
          style={styles(colors).actionButton}
          onPress={handleNext}
        >
          <Text style={styles(colors).actionButtonText}>
            {currentStep === features.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={
              currentStep === features.length - 1
                ? 'checkmark'
                : 'arrow-forward'
            }
            size={20}
            color={colors.background}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    skipButton: {
      position: 'absolute',
      top: Layout.spacing.xl,
      right: Layout.spacing.lg,
      zIndex: 1,
    },
    skipText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
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
    iconBackground: {
      width: 160,
      height: 160,
      borderRadius: 80,
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
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: Layout.spacing.lg,
    },
    description: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 28,
      maxWidth: Layout.window.width * 0.8,
    },
    progressContainer: {
      flexDirection: 'row',
      gap: Layout.spacing.sm,
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.overlayLight,
    },
    progressDotActive: {
      backgroundColor: colors.primary,
      width: 24,
    },
    bottomSection: {
      paddingHorizontal: Layout.spacing.lg,
      paddingBottom: Layout.spacing.xl,
    },
    actionButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Layout.spacing.lg,
      borderRadius: Layout.borderRadius.lg,
      gap: Layout.spacing.sm,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    actionButtonText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
