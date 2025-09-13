import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { VideoResultCard } from '../components';
import { ThemeColors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';


export default function ResultsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Results'>>();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Use the videoResult from navigation params
  const result = route.params?.videoResult;

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

    // TODO: implement some kind of check on this
    await Linking.openURL(result.trailerUrl);
    return;
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
        url: 'https://moovy.app', // Replace it with actual app URL
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
