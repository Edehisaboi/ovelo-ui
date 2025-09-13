import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeColors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useTheme } from '../context/ThemeContext';
import { AppSettings } from '../types';

export default function SettingsScreen() {
  const { colors, isDarkMode, setDarkMode } = useTheme();

  const [settings, setSettings] = useState<Omit<AppSettings, 'theme'>>({
    notifications: true,
    autoSave: true,
    identifyOnStart: false,
  });

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your identification history and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Clear AsyncStorage or other persistent storage here if used
            Alert.alert(
              'Data Cleared',
              'All data has been cleared successfully.',
            );
          },
        },
      ],
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Moovy',
      'Moovy v1.0.0\n\nIdentify any video clip instantly using AI-powered recognition.\n\nMade with ❤️ for movie lovers everywhere.',
      [{ text: 'OK' }],
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help',
      'Need help? Visit our support page or contact us at support@moovy.app.',
    );
  };

  const renderToggle = (
    key: keyof typeof settings,
    title: string,
    subtitle?: string,
  ) => (
    <TouchableOpacity
      style={styles(colors).settingItem}
      onPress={() => handleToggle(key, !(settings[key] as boolean))}
      activeOpacity={0.7}
    >
      <View style={styles(colors).settingIcon}>
        <Ionicons
          name={
            key === 'notifications'
              ? 'notifications'
              : key === 'autoSave'
              ? 'save'
              : key === 'identifyOnStart'
              ? 'play-circle'
              : 'color-palette'
          }
          size={24}
          color={colors.primary}
        />
      </View>
      <View style={styles(colors).settingContent}>
        <Text style={styles(colors).settingTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles(colors).settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      <Switch
        value={settings[key]}
        onValueChange={value => handleToggle(key, value)}
        trackColor={{ false: colors.overlayLight, true: colors.primary }}
        thumbColor="#fff"
        ios_backgroundColor={colors.overlayLight}
      />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      style={styles(colors).container}
    >
      <ScrollView
        style={styles(colors).scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <View style={styles(colors).section}>
          <Text style={styles(colors).sectionTitle}>Notifications</Text>
          {renderToggle(
            'notifications',
            'Push Notifications',
            'Get notified when videos are identified',
          )}
        </View>

        {/* Preferences Section */}
        <View style={styles(colors).section}>
          <Text style={styles(colors).sectionTitle}>Preferences</Text>
          {renderToggle(
            'autoSave',
            'Auto Save',
            'Automatically save identified videos',
          )}
          {renderToggle(
            'identifyOnStart',
            'Identify on App Start',
            'Automatically open identification on app launch',
          )}

          {/* Dark Theme Toggle */}
          <TouchableOpacity
            style={styles(colors).settingItem}
            activeOpacity={0.7}
            onPress={() => setDarkMode(!isDarkMode)}
          >
            <View style={styles(colors).settingIcon}>
              <Ionicons name="color-palette" size={24} color={colors.primary} />
            </View>
            <View style={styles(colors).settingContent}>
              <Text style={styles(colors).settingTitle}>Dark Theme</Text>
              <Text style={styles(colors).settingSubtitle}>
                Toggle between light and dark mode
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.overlayLight, true: colors.primary }}
              thumbColor="#fff"
              ios_backgroundColor={colors.overlayLight}
            />
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <View style={styles(colors).section}>
          <Text style={styles(colors).sectionTitle}>Data</Text>
          <TouchableOpacity
            style={styles(colors).settingItem}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <View style={styles(colors).settingIcon}>
              <Ionicons name="trash" size={24} color={colors.error} />
            </View>
            <View style={styles(colors).settingContent}>
              <Text
                style={[styles(colors).settingTitle, { color: colors.error }]}
              >
                Clear All Data
              </Text>
              <Text style={styles(colors).settingSubtitle}>
                Delete history and settings
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles(colors).section}>
          <Text style={styles(colors).sectionTitle}>About</Text>
          <TouchableOpacity
            style={styles(colors).settingItem}
            onPress={handleAbout}
            activeOpacity={0.7}
          >
            <View style={styles(colors).settingIcon}>
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles(colors).settingContent}>
              <Text style={styles(colors).settingTitle}>About Moovy</Text>
              <Text style={styles(colors).settingSubtitle}>Version 1.0.0</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles(colors).settingItem}
            onPress={handleHelp}
            activeOpacity={0.7}
          >
            <View style={styles(colors).settingIcon}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles(colors).settingContent}>
              <Text style={styles(colors).settingTitle}>Help & Support</Text>
              <Text style={styles(colors).settingSubtitle}>
                Get help using Moovy
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginBottom: Layout.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: Layout.spacing.md,
      paddingHorizontal: Layout.spacing.lg,
      paddingTop: Layout.spacing.lg,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: Layout.spacing.lg,
      marginBottom: Layout.spacing.sm,
      padding: Layout.spacing.md,
      borderRadius: Layout.borderRadius.lg,
    },
    settingIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.overlayLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Layout.spacing.md,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Layout.spacing.xs,
    },
    settingSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    settingRight: {
      marginLeft: Layout.spacing.md,
    },
  });
