import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { runOnJS } from 'react-native-worklets';

// Vision Camera
import {
  Camera,
  CameraRuntimeError,
  runAtTargetFps,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useMicrophonePermission,
  useFrameProcessor,
} from 'react-native-vision-camera';

// Reanimated
import Animated, {
  useSharedValue,
  useAnimatedProps,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  Extrapolation,
} from 'react-native-reanimated';

// Gesture Handler
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// Icons & Haptics
import Ionicons from '@react-native-vector-icons/ionicons';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Navigation
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/core';

// Contexts & Hooks
import { useTheme } from '../context/ThemeContext';
import { useVideo } from '../context/VideoContext';
import { useIsForeground } from '../hooks/useIsForeground';
import { useFaceDetectionPlugin } from '../hooks/useFaceDetection';
import { useFaceCropperPlugin } from '../hooks/useFaceCropper';

// API & Config
import { streamingConfig } from '../api/config';

// Constants & Types
import { ThemeColors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { RootStackParamList } from '../types';

const MAX_ZOOM_FACTOR = 6;
const SCALE_FULL_ZOOM = 3;

const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

export default function CameraScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const {
    isStreaming,
    connectionStatus,
    startStreamingIdentification,
    stopStreamingIdentification,
  } = useVideo();

  // State and refs
  const cameraRef = useRef<Camera>(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );
  const [targetFps, setTargetFps] = useState(30);
  const [statusMessage, setStatusMessage] = useState('');

  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [frameProcessorCallback, setFrameProcessorCallback] = useState<
    ((base64: string) => void) | null
  >(null);

  // Camera activity
  const isFocussed = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocussed && isForeground;

  // Permissions
  const { hasPermission: camOK, requestPermission: reqCam } =
    useCameraPermission();
  const { hasPermission: micOK, requestPermission: reqMic } =
    useMicrophonePermission();

  // Camera device & format
  const device = useCameraDevice(cameraPosition);
  const screenAspectRatio = Layout.window.height / Layout.window.width;
  const format = useCameraFormat(device, [
    { fps: targetFps },
    { videoAspectRatio: screenAspectRatio },
    { videoResolution: 'max' },
    { photoAspectRatio: screenAspectRatio },
    { photoResolution: 'max' },
  ]);
  const fps = Math.min(format?.maxFps ?? 30, targetFps);

  // Camera features
  const supportsFlash = device?.hasFlash ?? false;
  const supports60Fps = useMemo(
    () => device?.formats?.some(f => f.maxFps >= 60),
    [device?.formats],
  );
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);
  const zoom = useSharedValue(1);
  const savedZoom = useSharedValue(1);
  const frameAnimation = useSharedValue(0);
  const cameraAnimatedProps = useAnimatedProps(
    () => ({
      zoom: Math.max(Math.min(zoom.value, maxZoom), minZoom),
    }),
    [maxZoom, minZoom, zoom],
  );

  // Frame processors
  const detectFacesInFrame = useFaceDetectionPlugin();
  const cropFaceInFrame = useFaceCropperPlugin();
  const shouldProcessFrames = useSharedValue(isStreaming);

  useEffect(() => {
    shouldProcessFrames.value = isStreaming;
  }, [isStreaming, shouldProcessFrames]);

  // Send processed frame to streaming service
  const onProcessedFrame = (base64: string) => {
    if (frameProcessorCallback) {
      frameProcessorCallback(base64);
    }
  };

  // Frame processor (1fps, largest face)
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (!shouldProcessFrames.value) return;
      runAtTargetFps(streamingConfig.videoConfig.fps, () => {
        'worklet';
        const faces = detectFacesInFrame(frame);
        if (faces.length > 0) {
          const base64 = cropFaceInFrame(frame, faces);
          if (base64) {
            runOnJS(onProcessedFrame)(base64);
          }
        }
      });
    },
    [detectFacesInFrame, cropFaceInFrame],
  );

  // Camera lifecycle
  const onInitialized = useCallback(() => setIsCameraInitialized(true), []);
  const onError = useCallback((error: CameraRuntimeError) => {
    console.error(error);
    Alert.alert('Camera error', error.message || String(error));
  }, []);

  // Controls
  const startStreaming = useCallback(async () => {
    if (!camOK) {
      const ok = await reqCam();
      if (!ok)
        return Alert.alert('Permission Required', 'Camera permission needed.');
    }
    if (!micOK) {
      const ok = await reqMic();
      if (!ok)
        return Alert.alert(
          'Permission Required',
          'Microphone permission needed.',
        );
    }
    setStatusMessage('Connecting...');
    try {
      ReactNativeHapticFeedback.trigger('impactHeavy', {
        enableVibrateFallback: true,
      });
    } catch {}
    try {
      await startStreamingIdentification(
        {
          onSessionStart: () => setStatusMessage('Analyzing video...'),
          onFrameProcessorReady: callback => {
            setFrameProcessorCallback(() => callback);
          },
          onResult: (result: any) => {
            if (result.success) {
              setStatusMessage('Video identified successfully!');
              setTimeout(() => {
                navigation.navigate('Results', {
                  videoResult: result.result,
                });
              }, 1000);
            } else {
              setStatusMessage(`Identification failed: ${result.error}`);
            }
          },
          onError: error => {
            setStatusMessage(`Error: ${error}`);
            Alert.alert('Streaming Error', error);
          },
          onSessionEnd: () => setStatusMessage('Streaming ended'),
        },
        cameraRef.current,
        null, // No audio recording needed for frame processing
      );
    } catch (error) {
      setStatusMessage(`Error: ${error}`);
      Alert.alert('Error', `Failed to start streaming: ${error}`);
    }
  }, [camOK, micOK, reqCam, reqMic, startStreamingIdentification, navigation]);

  const stopStreaming = useCallback(() => {
    if (isStreaming) stopStreamingIdentification();
  }, [isStreaming, stopStreamingIdentification]);

  // UI Handlers
  const handleFlip = useCallback(
    () => setCameraPosition(p => (p === 'back' ? 'front' : 'back')),
    [],
  );
  const handleFlash = useCallback(
    () => setFlash(f => (f === 'off' ? 'on' : 'off')),
    [],
  );
  const handleFps = useCallback(
    () => setTargetFps(f => (f === 30 ? 60 : 30)),
    [],
  );
  const handleClose = useCallback(() => {
    if (isStreaming) stopStreaming();
    navigation.goBack();
  }, [isStreaming, stopStreaming, navigation]);

  // Gestures
  const pinch = Gesture.Pinch()
    .onBegin(() => {
      savedZoom.value = zoom.value;
    })
    .onUpdate(e => {
      const scale = interpolate(
        e.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolation.CLAMP,
      );
      zoom.value = interpolate(
        scale,
        [-1, 0, 1],
        [minZoom, savedZoom.value, maxZoom],
        Extrapolation.CLAMP,
      );
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      handleFlip();
    });

  const composedGestures = Gesture.Simultaneous(pinch, doubleTap);

  // Animation
  const frameStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      frameAnimation.value,
      [0, 1],
      [colors.cardBorder, colors.primary],
    ),
  }));

  if (!camOK || !micOK) {
    return (
      <View style={styles(colors).container}>
        <Text style={styles(colors).permissionText}>
          Please enable camera & microphone access.
        </Text>
        <TouchableOpacity
          style={styles(colors).permissionButton}
          onPress={async () => {
            await reqCam();
            await reqMic();
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
      {device ? (
        <GestureDetector gesture={composedGestures}>
          <Animated.View style={StyleSheet.absoluteFill}>
            <ReanimatedCamera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isActive}
              animatedProps={cameraAnimatedProps}
              format={format}
              fps={fps}
              audio={micOK}
              torch={supportsFlash ? flash : 'off'}
              onInitialized={onInitialized}
              onError={onError}
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

      {/* Overlay Controls */}
      <View style={styles(colors).overlay}>
        {/* Top row */}
        <View style={styles(colors).headerRow}>
          <TouchableOpacity
            style={styles(colors).headerButton}
            onPress={handleClose}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles(colors).headerStatusContainer}>
            <Text
              style={styles(colors).headerStatusText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {statusMessage || connectionStatus}
            </Text>
          </View>
          <TouchableOpacity
            style={styles(colors).headerButton}
            onPress={handleFlip}
          >
            <Ionicons name="camera-reverse" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Focus Frame and instructions */}
        <View style={styles(colors).frameContainer}>
          <Animated.View style={[styles(colors).cameraFrame, frameStyle]} />
          <Text style={styles(colors).instructionText}>
            {isStreaming
              ? statusMessage || 'Streaming... Hold steady'
              : 'Point your camera at the video and hold steady'}
          </Text>
        </View>

        {/* Bottom Controls Row */}
        <View style={styles(colors).rightButtonRow}>
          {supportsFlash && (
            <TouchableOpacity
              style={styles(colors).button}
              onPress={handleFlash}
            >
              <Ionicons
                name={flash === 'on' ? 'flash' : 'flash-off'}
                color="white"
                size={24}
              />
            </TouchableOpacity>
          )}
          {supports60Fps && (
            <TouchableOpacity style={styles(colors).button} onPress={handleFps}>
              <Text style={styles(colors).fpsText}>{`${targetFps}\nFPS`}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Capture/Streaming Button */}
        <View style={styles(colors).controls}>
          {!isStreaming ? (
            <TouchableOpacity
              style={styles(colors).recordButton}
              onPress={startStreaming}
              activeOpacity={0.7}
              disabled={!isActive || !isCameraInitialized}
            >
              <View style={styles(colors).recordButtonInner} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles(colors).stopButton}
              onPress={stopStreaming}
              disabled={!isActive || !isCameraInitialized}
            >
              <Ionicons name="stop" size={32} color={colors.background} />
            </TouchableOpacity>
          )}
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
    camera: {
      flex: 1,
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
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      width: '100%',
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerStatusContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
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
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 60,
    },
    recordButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: colors.background,
    },
    recordButtonInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.background,
    },
    stopButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: colors.background,
    },
    button: {
      marginBottom: 18,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(140, 140, 140, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    rightButtonRow: {
      position: 'absolute',
      right: 30,
      top: 100,
    },
    fpsText: {
      color: 'white',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
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
