import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';

import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { VideoIdentificationProvider } from '../context/VideoContext';

import { RootStackParamList } from '../types';
import CameraScreen from './camera';
import HistoryScreen from './history';

import HomeScreen from './home';
import ResultsScreen from './results';
import SettingsScreen from './settings';
import WelcomeScreen from './welcome';

const Stack = createStackNavigator<RootStackParamList>();

function RootLayoutInner() {
  // If you use a custom theme, get colors and theme here
  const { colors, theme } = useTheme();

  useEffect(() => {
    // App initialization logic can go here
    // Splash screen is handled by the native layer
  }, []);

  return (
    <>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: 'bold' },
            cardStyle: { backgroundColor: colors.background },
            ...TransitionPresets.SlideFromRightIOS, // similar to "slide_from_right"
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              title: 'Record Video',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Results"
            component={ResultsScreen}
            options={{
              title: 'Video Found',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: 'History',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{
              title: 'Welcome to Moovy',
              headerShown: false,
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <VideoIdentificationProvider>
        <RootLayoutInner />
      </VideoIdentificationProvider>
    </ThemeProvider>
  );
}
