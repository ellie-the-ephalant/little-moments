import {
  CAPTURE_HEIGHT,
  CAPTURE_QUALITY,
  CAPTURE_WIDTH,
  MAX_PHOTOS,
  MAX_UPLOAD_BYTES,
} from "./constants";
import { computeCoverCrop, shouldMirrorCapture } from "./crop";
import type { CameraFacing, Photo, PhotoSource } from "./types";
import { uid } from "./utils";

export { shouldMirrorCapture } from "./crop";

export type CaptureErrorCode =
  "video-not-ready" | "canvas-unavailable" | "encode-failed";

export class CaptureError extends Error {
  constructor(
    readonly code: CaptureErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CaptureError";
  }
}

export type UploadFileError = "too-large" | "not-image";
export type UploadBatchResult = {
  photos: Photo[];
  rejectedTooLarge: number;
  rejectedUnreadable: number;
  ignored: number;
};

export function validateUploadFile(
  file: Pick<File, "size" | "type">,
): UploadFileError | null {
  if (file.size > MAX_UPLOAD_BYTES) return "too-large";
  return file.type.startsWith("image/") ? null : "not-image";
}

function isVideoReady(video: HTMLVideoElement) {
  return video.readyState >= 2 && video.videoWidth > 0;
}

function waitForVideo(video: HTMLVideoElement) {
  if (isVideoReady(video)) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const finish = (ready: boolean) => {
      if (timer !== null) clearTimeout(timer);
      video.removeEventListener("loadeddata", onLoadedData);
      if (ready) resolve();
      else
        reject(
          new CaptureError("video-not-ready", "The camera is not ready yet."),
        );
    };
    const onLoadedData = () => finish(isVideoReady(video));
    video.addEventListener("loadeddata", onLoadedData, { once: true });
    timer = setTimeout(() => finish(isVideoReady(video)), 2000);
    if (isVideoReady(video)) onLoadedData();
  });
}

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = CAPTURE_WIDTH;
  canvas.height = CAPTURE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new CaptureError(
      "canvas-unavailable",
      "A capture canvas could not be created.",
    );
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  return { canvas, context };
}

function encodeJpeg(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  sourceKind: PhotoSource,
  facing: CameraFacing,
  mirror: boolean,
) {
  const { canvas, context } = makeCanvas();
  let crop: ReturnType<typeof computeCoverCrop>;
  try {
    crop = computeCoverCrop(
      sourceWidth,
      sourceHeight,
      CAPTURE_WIDTH,
      CAPTURE_HEIGHT,
    );
  } catch {
    throw new CaptureError(
      "video-not-ready",
      "The image has no usable dimensions.",
    );
  }
  context.save();
  try {
    if (shouldMirrorCapture(mirror, sourceKind, facing)) {
      context.translate(CAPTURE_WIDTH, 0);
      context.scale(-1, 1);
    }
    context.drawImage(
      source,
      crop.sx,
      crop.sy,
      crop.sw,
      crop.sh,
      0,
      0,
      CAPTURE_WIDTH,
      CAPTURE_HEIGHT,
    );
  } catch {
    throw new CaptureError(
      "canvas-unavailable",
      "The camera frame could not be drawn.",
    );
  } finally {
    context.restore();
  }
  try {
    return canvas.toDataURL("image/jpeg", CAPTURE_QUALITY);
  } catch {
    throw new CaptureError(
      "encode-failed",
      "The camera frame could not be saved.",
    );
  }
}

function yieldToBrowser() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

export type CapturePhotoOptions = {
  video: HTMLVideoElement;
  mirror: boolean;
  facing: CameraFacing;
};

export async function capturePhoto({
  video,
  mirror,
  facing,
}: CapturePhotoOptions) {
  await waitForVideo(video);
  const dataUrl = encodeJpeg(
    video,
    video.videoWidth,
    video.videoHeight,
    "camera",
    facing,
    mirror,
  );
  await yieldToBrowser();
  return {
    id: uid(),
    dataUrl,
    width: CAPTURE_WIDTH,
    height: CAPTURE_HEIGHT,
    source: "camera" as const,
    createdAt: Date.now(),
  } satisfies Photo;
}

type DecodedUpload = {
  source: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
};

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image decode failed"));
    image.src = url;
    if (image.complete && image.naturalWidth > 0) resolve(image);
  });
}

async function decodeUpload(file: File): Promise<DecodedUpload> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        dispose: () => bitmap.close(),
      };
    } catch {
      // Fall back to <img>, which applies EXIF orientation in supported browsers.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      dispose: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

async function normalizeUpload(file: File): Promise<Photo> {
  const decoded = await decodeUpload(file);
  try {
    return {
      id: uid(),
      dataUrl: encodeJpeg(
        decoded.source,
        decoded.width,
        decoded.height,
        "upload",
        "user",
        false,
      ),
      width: CAPTURE_WIDTH,
      height: CAPTURE_HEIGHT,
      source: "upload",
      createdAt: Date.now(),
    };
  } finally {
    decoded.dispose();
  }
}

export async function processUploads(
  files: FileList | readonly File[],
  availableSlots: number,
): Promise<UploadBatchResult> {
  const list = Array.from(files);
  const limit = Number.isFinite(availableSlots)
    ? Math.min(MAX_PHOTOS, Math.max(0, Math.floor(availableSlots)))
    : 0;
  const result: UploadBatchResult = {
    photos: [],
    rejectedTooLarge: 0,
    rejectedUnreadable: 0,
    ignored: 0,
  };

  for (let index = 0; index < list.length; index += 1) {
    if (result.photos.length >= limit) {
      result.ignored = list.length - index;
      break;
    }
    const file = list[index];
    const validation = validateUploadFile(file);
    if (validation === "too-large") {
      result.rejectedTooLarge += 1;
      continue;
    }
    if (validation === "not-image") {
      result.rejectedUnreadable += 1;
      continue;
    }
    try {
      result.photos.push(await normalizeUpload(file));
    } catch {
      result.rejectedUnreadable += 1;
    }
  }
  return result;
}
