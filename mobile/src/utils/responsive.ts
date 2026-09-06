import { Dimensions, PixelRatio } from "react-native";

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const getDimensions = () => Dimensions.get("window");

export const scale = (size: number): number => {
  const { width } = getDimensions();
  const scaleFactor = Math.min(width / BASE_WIDTH, 1.4);
  return PixelRatio.roundToNearestPixel(size * scaleFactor);
};

export const verticalScale = (size: number): number => {
  const { height } = getDimensions();
  const scaleFactor = Math.min(height / BASE_HEIGHT, 1.3);
  return PixelRatio.roundToNearestPixel(size * scaleFactor);
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  const { width } = getDimensions();
  const scaleVal = (width / BASE_WIDTH) * size;
  return PixelRatio.roundToNearestPixel(size + (scaleVal - size) * factor);
};

export const scaledFont = (size: number): number => {
  const { width } = getDimensions();
  const scaleFactor = (width / BASE_WIDTH - 1) * 0.3 + 1;
  const clampedFactor = Math.min(Math.max(scaleFactor, 0.85), 1.3);
  return Math.round(PixelRatio.roundToNearestPixel(size * clampedFactor));
};
