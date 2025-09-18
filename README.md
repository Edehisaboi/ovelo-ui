# Ovelo-UI (React Native)

Ovelo-UI is the mobile client for Ovelo, an AI-powered app that identifies movies and TV shows from short real-time clips.
It uses your device’s camera and microphone to capture frames and audio, streams them to the Ovelo backend, and returns matched titles with metadata.

---

## Features

- Real-time identification with react-native-vision-camera
- Optional audio streaming for improved accuracy
- History of identifications
- Light/Dark theme toggle
- Smooth animations and gestures (Reanimated, Gesture Handler)
- Settings screen for preferences

---

## Requirements

- Node.js ≥ 18
- Android toolchain (Java/Kotlin + Android Studio)
- iOS toolchain (Xcode, Ruby/Bundler, CocoaPods)
- React Native 0.80.x environment set up

Follow the React Native official setup guide: https://reactnative.dev/docs/environment-setup

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. iOS setup

```bash
bundle install
bundle exec pod install --project-directory=ios
```

### 3. Start Metro

```bash
npx react-native start
```

### 4. Run on Android

```bash
npx react-native run-android
```

### 5. Run on iOS

```bash
npx react-native run-ios
```

---

## Configuration

Backend URLs are set in `src/api/config.ts`.

Current defaults:

- Development

  - HTTP: `http://172.16.0.91:8000/v1/api`
  - WS: `ws://172.16.0.91:8000/v1/ws/identify`

- Production
  - HTTP: `https://api.ovelo.app/v1/api`
  - WS: `wss://api.ovelo.app`

Notes:

- If you run the backend locally, update these to your machine’s IP/host.
- On real devices, do not use `localhost`; use your machine’s LAN IP (e.g., `http://192.168.x.x:8000`).
- Android emulator maps host `localhost` to `http://10.0.2.2:<port>`.
- iOS Simulator can reach your host via `http://localhost:<port>`.

Streaming options (FPS, resolution, audio) are defined in `streamingConfig` in the same file.

Streaming defaults:

- Video: `fps=1`, `quality=80`, resolution uses device window size
- Audio: `sampleRate=16000`, `channels=1`, `bitsPerSample=16`, `bufferSize≈800`

---

## Permissions

- iOS: Ensure Info.plist includes camera and microphone usage descriptions.
- Android: Ensure camera and record-audio permissions are declared.

Grant permissions at first launch when prompted.

---

## Project Structure

- App.tsx — App entry (navigation setup)
- src/
  - api/ — HTTP/WebSocket clients, services, config, and types
  - assets/images/ — App icons and images with TypeScript typings
  - components/ — Reusable UI components
  - constants/ — Theme colors and layout scales
  - context/ — ThemeContext and VideoContext
  - hooks/ — Custom hooks (debounce, face detection/cropping, live audio, etc.)
  - screens/ — Home, Camera, Results, History, Settings, Processing, Welcome
  - types/ — Navigation and shared types
- android/, ios/ — Native projects and build config
