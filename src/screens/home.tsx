import type { ThemeColors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useTheme } from '../context/ThemeContext';
import { useVideo } from '../context/VideoContext';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  StatusBar,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Card from '../components/Card';
import IconButton from '../components/IconButton';
import { RootStackParamList } from '../types';

import ICON_SOURCE from '../assets/images/icon.png';
import ICON_DARK_SOURCE from '../assets/images/icon-dark.png';

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const { colors, isDarkMode } = useTheme();
  const { identificationHistory } = useVideo();

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Animation for pulsing (breathing) effect on the circle
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    // Infinite repeat, reversing back and forth
    pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.12]);
    const opacity = interpolate(pulse.value, [0, 1], [0.85, 1]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const handleIdentifyVideo = () => navigation.navigate('Camera');
  const handleHistory = () => navigation.navigate('History');
  const handleSettings = () => navigation.navigate('Settings');

  const handleCancelSearch = () => {
    setSearch('');
    setIsFocused(false);
    Keyboard.dismiss();
  };

  const handleBlur = () => setIsFocused(false);
  const handleFocus = () => setIsFocused(true);
  const handleSearch = () => {
    console.log('Search submitted:', search);
    // Add your search logic here
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles(colors).container}
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        {/* Header with search bar and icons */}
        <View style={styles(colors).headerContainer}>
          <Card style={styles(colors).searchBarCard} padding="small">
            <View style={styles(colors).searchBarRow}>
              <Ionicons
                name="search"
                size={20}
                color={colors.textSecondary}
                style={styles(colors).searchIcon}
              />
              <TextInput
                ref={inputRef}
                style={styles(colors).searchInput}
                placeholder="Search movies..."
                placeholderTextColor={colors.textSecondary}
                value={search}
                onChangeText={setSearch}
                onFocus={handleFocus}
                onBlur={handleBlur}
                returnKeyType="search"
                underlineColorAndroid="transparent"
                onSubmitEditing={handleSearch}
              />
              {(isFocused || search.length > 0) && (
                <TouchableOpacity
                  onPress={handleCancelSearch}
                  style={styles(colors).cancelButton}
                >
                  <Text style={styles(colors).cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
          <View style={styles(colors).headerIcons}>
            <IconButton icon="settings-outline" onPress={handleSettings} />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles(colors).content}>
          <View style={styles(colors).buttonContainer}>
            <TouchableOpacity onPress={handleIdentifyVideo} activeOpacity={0.8}>
              <Animated.View style={[styles(colors).logoWrapper, pulseStyle]}>
                <Image
                  source={isDarkMode ? ICON_DARK_SOURCE : ICON_SOURCE}
                  style={styles(colors).logoImage}
                  resizeMode="cover"
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
          <Text style={styles(colors).tagline}>
            Tap to identify video clips
          </Text>
        </View>

        {/* Bottom Dock */}
        <View style={styles(colors).dockContainer}>
          <Card style={styles(colors).dockCard} padding="small">
            <View style={styles(colors).dockRow}>
              <View style={styles(colors).dockLeft}>
                <Text style={styles(colors).dockTitle}>My Videos</Text>
                <Text style={styles(colors).dockSubtitle}>
                  {identificationHistory.length} videos
                </Text>
              </View>
              <IconButton icon="time-outline" onPress={handleHistory} />
            </View>
          </Card>
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Layout.spacing.lg,
      paddingTop: Layout.spacing.xxl,
      marginBottom: Layout.spacing.lg,
    },
    searchBarCard: {
      flex: 1,
      backgroundColor: colors.surfaceLight,
      marginRight: Layout.spacing.md,
      minHeight: 44,
      justifyContent: 'center',
    },
    searchBarRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 4,
      backgroundColor: 'transparent',
      minHeight: 36,
    },
    cancelButton: {
      marginLeft: Layout.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    cancelButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    headerIcons: { flexDirection: 'row', alignItems: 'center' },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Layout.spacing.lg,
    },
    buttonContainer: { marginBottom: Layout.spacing.xxl },
    logoWrapper: {
      width: 180,
      height: 180,
      borderRadius: 90,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoImage: { width: '140%', height: '140%' },
    tagline: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: Layout.spacing.lg,
    },
    dockContainer: {
      paddingHorizontal: Layout.spacing.lg,
      paddingBottom: Layout.spacing.xl,
    },
    dockCard: {
      backgroundColor: colors.surface,
      borderRadius: Layout.borderRadius.lg,
    },
    dockRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Layout.spacing.md,
      paddingHorizontal: Layout.spacing.lg,
    },
    dockLeft: { flexDirection: 'column' },
    dockTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
    dockSubtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
    searchIcon: { marginRight: 8 },
  });
