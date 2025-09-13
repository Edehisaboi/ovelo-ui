import type { Frame } from 'react-native-vision-camera';
import {
  FaceDetectionOptions,
  useFaceDetector,
} from 'react-native-vision-camera-face-detector';
import { Layout } from '../constants/Layout';


const faceDetectionOptions: FaceDetectionOptions = {
  performanceMode: 'fast',
  trackingEnabled: true,
  autoMode: true,
  windowWidth: Layout.window.width,
  windowHeight: Layout.window.height,
  cameraFacing: 'back', // TODO: Make this dynamic based on camera selection
};

export function useFaceDetectionPlugin() {
  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  return (frame: Frame) => {
    'worklet';
    return detectFaces(frame);
  };
}
