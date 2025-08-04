import { ThemeColors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useTheme } from '../context/ThemeContext';
import { useVideo } from '../context/VideoContext';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Linking } from 'react-native';
import React, { useEffect } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { VideoResultCard } from '../components';
import { RootStackParamList } from '../types';

export default function ResultsScreen() {
  const { current } = useVideo();
  const result = current;
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const slideAnimation = useSharedValue(Layout.window.height);
  const fadeAnimation = useSharedValue(0);

  useEffect(() => {
    // Animate in
    slideAnimation.value = withSpring(0, {
      damping: 20,
      stiffness: 100,
    });
    fadeAnimation.value = withTiming(1, { duration: 500 });
  }, [slideAnimation, fadeAnimation]);

  const slideStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: slideAnimation.value }],
    };
  });

  const handleWatchTrailer = async () => {
    if (!result?.trailerUrl) {
      Alert.alert(
        'No trailer available',
        'Trailer link not found for this video.',
      );
      return;
    }

    if (await Linking.canOpenURL(result?.trailerUrl)) {
      // If the URL can be opened, proceed to open it
      await Linking.openURL(result.trailerUrl);
      return;
    }
  };

  const handleReadMore = () => {
    // In a real app, this would navigate to a detailed view
    Alert.alert(
      'Read More',
      'This would show detailed information about the video.',
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just identified "${result?.title}" using Moovy! 🎬`,
        url: 'https://moovy.app', // Replace with actual app URL
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDone = () => {
    navigation.goBack();
  };

  if (!result) {
    return (
      <View style={styles(colors).errorContainer}>
        <Text style={styles(colors).errorText}>No results found</Text>
        <TouchableOpacity style={styles(colors).button} onPress={handleDone}>
          <Text style={styles(colors).buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      style={styles(colors).container}
    >
      <Animated.View style={[styles(colors).content, slideStyle]}>
        <ScrollView
          style={styles(colors).scrollView}
          showsVerticalScrollIndicator={false}
        >
          <VideoResultCard
            video={result}
            onWatchTrailer={handleWatchTrailer}
            onReadMore={handleReadMore}
            onShare={handleShare}
          />
        </ScrollView>
      </Animated.View>
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
    },
    scrollView: {
      flex: 1,
    },
    posterContainer: {
      alignItems: 'center',
      paddingTop: Layout.spacing.xl,
      paddingBottom: Layout.spacing.lg,
    },
    poster: {
      width: Layout.window.width * 0.8,
      height: Layout.poster.height,
      borderRadius: Layout.poster.borderRadius,
      backgroundColor: colors.surface,
      overflow: 'hidden',
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    posterPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    posterText: {
      color: colors.textMuted,
      fontSize: 16,
      marginTop: Layout.spacing.sm,
    },
    detailsContainer: {
      paddingHorizontal: Layout.spacing.lg,
      paddingBottom: Layout.spacing.xl,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: Layout.spacing.sm,
    },
    year: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Layout.spacing.lg,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Layout.spacing.sm,
      paddingHorizontal: Layout.spacing.md,
    },
    detailText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: Layout.spacing.sm,
      flex: 1,
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      marginTop: Layout.spacing.lg,
      paddingHorizontal: Layout.spacing.md,
    },
    actionsContainer: {
      paddingHorizontal: Layout.spacing.lg,
      paddingBottom: Layout.spacing.xl,
      gap: Layout.spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Layout.spacing.md,
      paddingHorizontal: Layout.spacing.lg,
      borderRadius: Layout.borderRadius.lg,
      gap: Layout.spacing.sm,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: 'bold',
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      paddingHorizontal: Layout.spacing.lg,
      paddingBottom: Layout.spacing.xl,
    },
    doneButton: {
      backgroundColor: colors.surface,
      paddingVertical: Layout.spacing.md,
      borderRadius: Layout.borderRadius.lg,
      alignItems: 'center',
    },
    doneButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    errorText: {
      color: colors.error,
      fontSize: 18,
      marginBottom: Layout.spacing.lg,
    },
    button: {
      backgroundColor: colors.primary,
      paddingHorizontal: Layout.spacing.lg,
      paddingVertical: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
