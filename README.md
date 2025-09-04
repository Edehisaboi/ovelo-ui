# Ovelo-UI (React Native)

Ovelo-UI is a React Native application for identifying video clips in real time using your device camera and microphone. It features a modern UI with light/dark themes, a history of identifications, and smooth animations powered by Reanimated. The app integrates with a backend over HTTP and WebSocket for streaming frames and audio.

Last updated: 2025-09-04 18:37

## Table of Contents
- Overview
- Features
- Architecture
- Requirements
- Getting Started
  - Install dependencies
  - iOS setup (CocoaPods)
  - Running Metro
  - Run on Android
  - Run on iOS
- Configuration
- Available Scripts
- Testing
- Project Structure
- Troubleshooting
- License

## Overview
Ovelo-UI helps you identify movies and shows by analyzing short clips. Tap the main button to start the camera-based identification flow, view your recent identifications in History, and tweak preferences in Settings.

## Features
- Real-time video identification using react-native-vision-camera
- Optional audio streaming to improve identification
- Smooth animations and gestures (Reanimated, Gesture Handler)
- Theming with dark/light mode via context
- Search bar scaffold on Home
- Identification history and basic settings screens
- TypeScript-first codebase

## Architecture
- UI
  - Screens: Home, Camera, History, Settings, Processing, Results, Welcome
  - Components: Button, IconButton, Card, VideoResultCard
  - Navigation: @react-navigation/native and stack
  - Styling: ThemeContext with Colors and Layout constants
- Data & Services
  - HTTP client and service layer in src/api (search, streaming, user, analytics)
  - WebSocket client for live streaming
  - Centralized API config and endpoints in src/api/config.ts
- Hooks & Context
  - VideoContext manages identification lifecycle and history
  - Custom hooks: useFaceDetection, useFaceCropper, useLiveAudioStream, useDebounce, useIsForeground

## Requirements
- Node.js >= 18 (see package.json engines)
- Java/Kotlin Android toolchain and Xcode/iOS toolchain as per React Native 0.80.x
- Ruby/Bundler and CocoaPods for iOS builds
- Android Studio and an emulator, and/or Xcode with iOS Simulator

Follow the official React Native environment setup for your OS before proceeding.

## Getting Started
### 1) Install dependencies
Using npm:
- npm install

Using Yarn:
- yarn

### 2) iOS setup (first time or after native deps change)
- bundle install
- bundle exec pod install --project-directory=ios

### 3) Start Metro
- npm start
or
- yarn start

### 4) Run on Android
- npm run android
or
- yarn android

### 5) Run on iOS
- npm run ios
or
- yarn ios

If everything is set up correctly, the app will launch in the emulator/simulator or on your connected device.

## Configuration
Backend URLs are currently determined at build time in src/api/config.ts:
- HTTP baseURL
  - Development (__DEV__): http://localhost:3000/api
  - Production: https://api.moovy.app/api
- WebSocket baseURL
  - Development: ws://192.168.0.23:8000/v1/ws/identify
  - Production: wss://api.moovy.app

Notes:
- Update these endpoints to match your local/remote backend.
- On a real device, localhost points to the device; use your machine’s LAN IP (e.g., http://192.168.x.x:3000).
- For Android emulator, http://10.0.2.2 maps to host localhost.

Streaming options (fps, resolution, audio) are defined in streamingConfig in the same file.

## Available Scripts
Defined in package.json:
- start: Start Metro bundler
- android: Build and run on Android
- ios: Build and run on iOS
- test: Run Jest test suite
- lint: Run ESLint

Usage examples:
- npm run lint
- npm test

## Testing
This project uses Jest with react-test-renderer.
- Run tests: npm test or yarn test

Test files are under __tests__/.

## Project Structure
- App.tsx: App entry (navigation setup)
- src/
  - api/: HTTP/WebSocket clients, services, config, and types
  - assets/images/: App icons and images with TypeScript typings
  - components/: Reusable UI components
  - constants/: Theme colors and layout scales
  - context/: ThemeContext and VideoContext
  - hooks/: Custom hooks (debounce, face detection/cropping, live audio, etc.)
  - screens/: App screens (home, camera, results, history, settings, etc.)
  - types/: Navigation and shared types
- android/, ios/: Native projects and build config

## Troubleshooting
- iOS pods: If iOS build fails, run bundle exec pod install in the ios folder.
- Permissions: Ensure camera and microphone permissions are granted.
- Android localhost: Use 10.0.2.2 for emulator; use your machine IP for device.
- Build cache: If builds fail unexpectedly, try cleaning Gradle/Xcode derived data.
- Vision Camera: Make sure you’ve added necessary permissions to AndroidManifest.xml and Info.plist (camera, microphone).

## License
This repository does not declare an explicit license. If this is a public project, consider adding a LICENSE file. If private, keep it internal per your organization’s policy.
