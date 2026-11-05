import type { CameraFacing, PhotoSource } from "./types";

export type CoverCrop = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export function computeCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): CoverCrop {
  if (!(
    sourceWidth > 0 &&
    sourceHeight > 0 &&
    targetWidth > 0 &&
    targetHeight > 0
  )) {
    throw new RangeError("Crop dimensions must be positive");
  }

  const sourceAspect = sourceWidth / sourceHeight;
  const targetAspect = targetWidth / targetHeight;

  if (sourceAspect > targetAspect) {
    const width = sourceHeight * targetAspect;
    return {
      sx: (sourceWidth - width) / 2,
      sy: 0,
      sw: width,
      sh: sourceHeight,
    };
  }

  if (sourceAspect < targetAspect) {
    const height = sourceWidth / targetAspect;
    return {
      sx: 0,
      sy: (sourceHeight - height) / 2,
      sw: sourceWidth,
      sh: height,
    };
  }

  return { sx: 0, sy: 0, sw: sourceWidth, sh: sourceHeight };
}

export function shouldMirrorCapture(
  mirror: boolean,
  source: PhotoSource,
  facing: CameraFacing,
) {
  return mirror && source === "camera" && facing === "user";
}
