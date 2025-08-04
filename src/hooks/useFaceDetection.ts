import { useMemo } from 'react';
import type { Frame } from 'react-native-vision-camera';
import {
  useFaceDetector,
  FaceDetectionOptions,
} from 'react-native-vision-camera-face-detector';
import { Layout } from '../constants/Layout';

const faceDetectionOptions: FaceDetectionOptions = {
  performanceMode: 'fast',
  trackingEnabled: true,
  autoMode: true,
  windowWidth: Layout.window.width,
  windowHeight: Layout.window.height,
};

export function useFaceDetectionPlugin() {
  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  return useMemo(
    () => (frame: Frame) => {
      'worklet';
      return detectFaces(frame);
    },
    [detectFaces],
  );
}
