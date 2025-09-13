// Icons & Haptics
import Ionicons from '@react-native-vector-icons/ionicons';
import {useIsFocused} from '@react-navigation/core';

// Navigation
import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

// Gesture Handler
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Reanimated
import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

// Vision Camera
import {
    Camera,
    CameraRuntimeError,
    runAsync,
    runAtTargetFps,
    useCameraDevice,
    useCameraFormat,
    useCameraPermission,
    useFrameProcessor,
    useMicrophonePermission,
} from 'react-native-vision-camera';
import {useRunOnJS} from 'react-native-worklets-core';

// API & Config
import {streamingConfig} from '../api/config';
import {StreamResponse} from '../api/types';

// Constants & Types
import {ThemeColors} from '../constants/Colors';
import {Layout} from '../constants/Layout';

// Contexts & Hooks
import {useTheme} from '../context/ThemeContext';
import {useVideo} from '../context/VideoContext';
import {useFaceCropperPlugin} from '../hooks/useFaceCropper';
import {useFaceDetectionPlugin} from '../hooks/useFaceDetection';
import {useIsForeground} from '../hooks/useIsForeground';
import {useLiveAudioStream} from '../hooks/useLiveAudioStream';
import {RootStackParamList, VideoResult} from '../types';


const MAX_ZOOM_FACTOR = 6;
const SCALE_FULL_ZOOM = 3;

const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

export default function CameraScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const {
    isIdentificationActive,
    connectionStatus,
    startVideoIdentification,
    stopVideoIdentification,
  } = useVideo();

  // Camera state and refs
  const cameraRef = useRef<Camera>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );

  const [statusMessage, setStatusMessage] = useState('');
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');

  // Camera activity tracking
  const isScreenFocused = useIsFocused();
  const isAppForeground = useIsForeground();
  const isCameraActive = isScreenFocused && isAppForeground;

  // Permissions
  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicrophonePermission,
    requestPermission: requestMicrophonePermission,
  } = useMicrophonePermission();

  // Camera device & format configuration
  const cameraDevice = useCameraDevice(cameraPosition);
  const screenAspectRatio = Layout.window.height / Layout.window.width;
  const cameraFormat = useCameraFormat(cameraDevice, [
    { fps: 30 },
    { videoAspectRatio: screenAspectRatio },
    { videoResolution: 'max' },
    { photoAspectRatio: screenAspectRatio },
    { photoResolution: 'max' },
  ]);
  const actualFps = Math.min(cameraFormat?.maxFps ?? 30, 30);

  // Camera capabilities
  const supportsFlash = cameraDevice?.hasFlash ?? false;
  const minZoomLevel = cameraDevice?.minZoom ?? 1;
  const maxZoomLevel = Math.min(cameraDevice?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

  // Zoom animation values
  const zoomLevel = useSharedValue(1);
  const savedZoomLevel = useSharedValue(1);
  const frameBorderAnimation = useSharedValue(0);

  const cameraAnimatedProps = useAnimatedProps(
    () => ({
      zoom: Math.max(Math.min(zoomLevel.value, maxZoomLevel), minZoomLevel),
    }),
    [maxZoomLevel, minZoomLevel, zoomLevel],
  );

  // Frame processing setup
  const detectFacesInFrame = useFaceDetectionPlugin();
  const cropFaceInFrame = useFaceCropperPlugin();

  // Audio streaming setup
  const {
    start: startAudioStream,
    stop: stopAudioStream,
    setAudioCallback,
  } = useLiveAudioStream();

  // Frame processing callback - using refs to allow reassignment
  const frameProcessingCallbackRef = useRef<
    ((frameData: string) => void) | null
  >(null);

  const handleProcessedFrame = (frameData: string) => {
    if (frameProcessingCallbackRef.current) {
      frameProcessingCallbackRef.current(frameData);
    }
  };
  const handleProcessedFrameOnJS = useRunOnJS(handleProcessedFrame, []);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (!isIdentificationActive) return;

      runAsync(frame, () => {
        'worklet';
        runAtTargetFps(streamingConfig.videoConfig.fps, () => {
          'worklet';
          const detectedFaces = detectFacesInFrame(frame);
          if (detectedFaces.length > 0) {
            const croppedFrameData = cropFaceInFrame(frame, detectedFaces);
            if (croppedFrameData) {
              void handleProcessedFrameOnJS(croppedFrameData);
            }
          }
        });
      });
    },
    [
      isIdentificationActive,
      detectFacesInFrame,
      cropFaceInFrame,
      handleProcessedFrameOnJS,
    ],
  );

  // Camera lifecycle handlers
  const handleCameraInitialized = useCallback(() => setIsCameraReady(true), []);
  const handleCameraError = useCallback((error: CameraRuntimeError) => {
    console.error(error);
    Alert.alert('Camera Error', error.message || String(error));
  }, []);

  // Streaming control handlers
  const handleStartStreaming = useCallback(async () => {
    // Check camera permission
    if (!hasCameraPermission) {
      const permissionGranted = await requestCameraPermission();
      if (!permissionGranted) {
        return Alert.alert(
          'Permission Required',
          'Camera permission is needed to identify videos.',
        );
      }
    }

    // Check microphone permission
    if (!hasMicrophonePermission) {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) {
        return Alert.alert(
          'Permission Required',
          'Microphone permission is needed for audio analysis.',
        );
      }
    }

    setStatusMessage('Connecting...');

    // Provide haptic feedback
    try {
      ReactNativeHapticFeedback.trigger('impactHeavy', {
        enableVibrateFallback: true,
      });
    } catch {}

    try {
      await startVideoIdentification({
        onSessionStart: () => setStatusMessage('Analyzing video content...'),
        onFrameProcessorReady: frameCallback => {
          // Set frame processing callback using ref
          frameProcessingCallbackRef.current = frameCallback;
        },
        onAudioProcessorReady: async audioCallback => {
          // Set audio processing callback using ref
          setAudioCallback(audioCallback);
          // Start audio streaming with await
          await startAudioStream();
        },
        onResult: (result: StreamResponse) => {
          if (result.success) {
            setStatusMessage('Video identified successfully!');
            setTimeout(() => {
              navigation.navigate('Results', {
                videoResult: result.result as VideoResult,
              });
            }, 1000);
          } else {
            setStatusMessage(`Identification failed: ${result.error}`);
          }
          stopVideoIdentification(); //todo: implement this correctly
        },
        onError: error => {
          setStatusMessage(`Connection error: ${error}`);
          Alert.alert('Streaming Error', error);
        },
        onSessionEnd: async () => {
          setStatusMessage('Streaming session ended');
          await stopAudioStream();
        },
      });
    } catch (error) {
      setStatusMessage(`Failed to start streaming: ${error}`);
      Alert.alert('Error', `Failed to start streaming: ${error}`);
    }
  }, [
    hasCameraPermission,
    hasMicrophonePermission,
    requestCameraPermission,
    requestMicrophonePermission,
    startVideoIdentification,
    navigation,
    startAudioStream,
    stopAudioStream,
    setAudioCallback,
  ]);

  const handleStopStreaming = useCallback(async () => {
    if (isIdentificationActive) {
      setStatusMessage('');
      stopVideoIdentification();
      await stopAudioStream();
    }
  }, [isIdentificationActive, stopVideoIdentification, stopAudioStream]);

  // Camera control handlers
  const handleFlipCamera = useCallback(
    () =>
      setCameraPosition(currentPosition =>
        currentPosition === 'back' ? 'front' : 'back',
      ),
    [],
  );

  const handleToggleFlash = useCallback(
    () => setFlashMode(currentMode => (currentMode === 'off' ? 'on' : 'off')),
    [],
  );

  const handleCloseCamera = useCallback(async () => {
    if (isIdentificationActive) await handleStopStreaming();
    navigation.goBack();
  }, [isIdentificationActive, handleStopStreaming, navigation]);

  // Gesture handlers
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      savedZoomLevel.value = zoomLevel.value;
    })
    .onUpdate(event => {
      const scale = interpolate(
        event.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolation.CLAMP,
      );
      zoomLevel.value = interpolate(
        scale,
        [-1, 0, 1],
        [minZoomLevel, savedZoomLevel.value, maxZoomLevel],
        Extrapolation.CLAMP,
      );
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      handleFlipCamera();
    });

  const combinedGestures = Gesture.Simultaneous(pinchGesture, doubleTapGesture);

  // Frame border animation
  const frameBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      frameBorderAnimation.value,
      [0, 1],
      [colors.cardBorder, colors.primary],
    ),
  }));

  // Permission request screen
  if (!hasCameraPermission || !hasMicrophonePermission) {
    return (
      <View style={styles(colors).container}>
        <Text style={styles(colors).permissionText}>
          Please enable camera & microphone access to identify videos.
        </Text>
        <TouchableOpacity
          style={styles(colors).permissionButton}
          onPress={async () => {
            await requestCameraPermission();
            await requestMicrophonePermission();
          }}
        >
          <Text style={styles(colors).permissionButtonText}>
            Enable Permissions
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles(colors).container}>
      {cameraDevice ? (
        <GestureDetector gesture={combinedGestures}>
          <Animated.View style={StyleSheet.absoluteFill}>
            <ReanimatedCamera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={cameraDevice}
              isActive={isCameraActive}
              animatedProps={cameraAnimatedProps}
              format={cameraFormat}
              fps={actualFps}
              audio={hasMicrophonePermission}
              torch={supportsFlash ? flashMode : 'off'}
              onInitialized={handleCameraInitialized}
              onError={handleCameraError}
              frameProcessor={frameProcessor}
              enableZoomGesture={false}
            />
          </Animated.View>
        </GestureDetector>
      ) : (
        <View style={styles(colors).emptyContainer}>
          <Text style={styles(colors).permissionText}>
            No camera found on this device.
          </Text>
        </View>
      )}

      {/* Camera overlay controls */}
      <View style={styles(colors).overlay}>
        {/* Header controls */}
        <View style={styles(colors).headerRow}>
          {/* Flash at top-left */}
          {supportsFlash && (
            <TouchableOpacity
              style={styles(colors).headerButton}
              onPress={handleToggleFlash}
            >
              <Ionicons
                name={flashMode === 'on' ? 'flash' : 'flash-off'}
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
          {/* Status message centered */}
          <View style={styles(colors).headerStatusContainer}>
            <Text
              style={styles(colors).headerStatusText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {statusMessage || connectionStatus}
            </Text>
          </View>
        </View>

        {/* Focus frame and instructions */}
        <View style={styles(colors).frameContainer}>
          <Animated.View
            style={[styles(colors).cameraFrame, frameBorderStyle]}
          />
          <Text style={styles(colors).instructionText}>
            {isIdentificationActive
              ? 'Streaming... Hold steady'
              : 'Point your camera at the video and hold steady'}
          </Text>
        </View>

        {/* Recording controls */}
        <View style={styles(colors).recordingControls}>
          {/* Left side - Cancel button */}
          <TouchableOpacity
            style={styles(colors).cancelButton}
            onPress={handleCloseCamera}
          >
            <Text style={styles(colors).cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          {/* Center - Record/Stop button */}
          <View style={styles(colors).centerControls}>
            {!isIdentificationActive ? (
              <TouchableOpacity
                style={styles(colors).recordButton}
                onPress={handleStartStreaming}
                activeOpacity={0.7}
                disabled={!isCameraActive || !isCameraReady}
              >
                <View style={styles(colors).recordButtonInner} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles(colors).stopButton}
                onPress={handleStopStreaming}
                disabled={!isCameraActive || !isCameraReady}
              >
                <Ionicons name="stop" size={32} color={colors.background} />
              </TouchableOpacity>
            )}
          </View>

          {/* Right side - Flip camera button */}
          <TouchableOpacity
            style={styles(colors).flipButton}
            onPress={handleFlipCamera}
          >
            <Ionicons name="camera-reverse" size={24} color={'white'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'space-between',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingBottom: 10,
      paddingTop: 40,
      width: '100%',
    },
    headerButton: {
      position: 'absolute',
      left: 20,
      top: 40,
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerStatusContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerStatusText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    frameContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    cameraFrame: {
      width: Layout.window.width - 80,
      height: Layout.window.width * 0.75,
      borderWidth: 2,
      borderColor: colors.cardBorder,
      borderRadius: 12,
      marginBottom: 20,
    },
    instructionText: {
      color: colors.text,
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '500',
    },
    recordingControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 50,
      paddingHorizontal: 30,
      backgroundColor: 'black',
      paddingTop: 20,
    },
    centerControls: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      paddingHorizontal: 6,
      paddingVertical: 6,
      borderRadius: 20,
    },
    cancelButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    flipButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    recordButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.background,
    },
    recordButtonInner: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.background,
    },
    stopButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.background,
    },

    permissionText: {
      color: colors.text,
      fontSize: 16,
      textAlign: 'center',
      marginHorizontal: 40,
      marginTop: 100,
    },
    permissionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 20,
      alignSelf: 'center',
    },
    permissionButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
