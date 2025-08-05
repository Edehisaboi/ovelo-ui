import { useMemo } from 'react';
import { crop, CropRegion } from 'vision-camera-cropper';
import type { Frame } from 'react-native-vision-camera';
import type { Face } from 'react-native-vision-camera-face-detector';

function getCropRegionAroundFace(
  faceBox: { x: number; y: number; width: number; height: number },
  frame: Frame,
  paddingRatio: number = 0.5,
): CropRegion {
  'worklet';
  // Add padding to all sides
  const padX = faceBox.width * paddingRatio;
  const padY = faceBox.height * paddingRatio;

  // Calculate new region (clamped to frame)
  const left = Math.max(faceBox.x - padX, 0);
  const top = Math.max(faceBox.y - padY, 0);
  const right = Math.min(faceBox.x + faceBox.width + padX, frame.width);
  const bottom = Math.min(faceBox.y + faceBox.height + padY, frame.height);

  return {
    left: (left / frame.width) * 100,
    top: (top / frame.height) * 100,
    width: ((right - left) / frame.width) * 100,
    height: ((bottom - top) / frame.height) * 100,
  };
}

function getLargestFace(faces: Face[]) {
  'worklet';
  if (!faces?.length) return null;
  return faces.reduce((largest, face) => {
    const box = face.bounds;
    const area = box.width * box.height;
    const largestBox = largest.bounds;
    const largestArea = largestBox.width * largestBox.height;
    return area > largestArea ? face : largest;
  }, faces[0]);
}

export function useFaceCropperPlugin() {
  return useMemo(() => {
    return (frame: Frame, faces: Face[]) => {
      'worklet';
      if (!faces?.length) return null;
      const largestFace = getLargestFace(faces);
      if (!largestFace) return null;
      const box = largestFace.bounds;
      const cropRegion = getCropRegionAroundFace(box, frame, 0.5);
      const result = crop(frame, {
        cropRegion,
        includeImageBase64: true,
        saveAsFile: false,
      });
      return result.base64 ?? null;
    };
  }, []);
}
