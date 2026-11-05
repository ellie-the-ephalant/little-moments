import { STRIP_WIDTH } from "./constants";
import { saveStrip } from "./gallery-store";
import {
  ExportError,
  renderStrip,
  type StripRenderSettings,
} from "./render-strip";
import { getStripGeometry } from "./strip-geometry";
import type { Photo, StripRecord } from "./types";
import { effectiveTitle, filenameForStrip, uid } from "./utils";

const pendingGallerySaves = new Map<string, Promise<StripRecord>>();

export type PreparedPng = {
  blob: Blob;
  file: File;
  filename: string;
  width: number;
  height: number;
  scale: number;
};

export function getStripRevision(
  photos: readonly Photo[],
  settings: StripRenderSettings,
) {
  return JSON.stringify([
    photos.map(({ id }) => id),
    settings.layoutId,
    settings.themeId,
    settings.filterId,
    settings.title,
    settings.dateISO,
  ]);
}

export function getPreparedExportRevision(
  stripRevision: string,
  scale: 1 | 2,
  fontRevision: number,
) {
  return JSON.stringify([stripRevision, scale, fontRevision]);
}

export function coalesceInFlight<T>(
  pending: Map<string, Promise<T>>,
  key: string,
  operation: () => Promise<T>,
) {
  const existing = pending.get(key);
  if (existing) return existing;

  const request = operation();
  pending.set(key, request);
  const clear = () => {
    if (pending.get(key) === request) pending.delete(key);
  };
  void request.then(clear, clear);
  return request;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg",
  quality?: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    const fallback = () => {
      try {
        const base64 = canvas.toDataURL(type, quality).split(",")[1];
        const bytes = Uint8Array.from(atob(base64), (character) =>
          character.charCodeAt(0),
        );
        resolve(new Blob([bytes], { type }));
      } catch (error) {
        reject(error);
      }
    };

    if (typeof canvas.toBlob !== "function") {
      fallback();
      return;
    }

    try {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : fallback()),
        type,
        quality,
      );
    } catch {
      fallback();
    }
  });
}

export async function preparePngExport(
  photos: Photo[],
  settings: StripRenderSettings,
  scale: 1 | 2,
): Promise<PreparedPng> {
  let canvas: HTMLCanvasElement | undefined;
  try {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
    canvas = await renderStrip({ photos, settings, mode: "export", scale });
    const blob = await canvasToBlob(canvas, "image/png");
    const filename = filenameForStrip(settings.title, settings.dateISO);
    return {
      blob,
      file: new File([blob], filename, { type: "image/png" }),
      filename,
      width: canvas.width,
      height: canvas.height,
      scale: canvas.width / getStripGeometry(settings.layoutId).width,
    };
  } catch (error) {
    if (error instanceof ExportError) throw error;
    throw new ExportError(
      "render-failed",
      "The strip couldn't be exported at this size. Try Standard.",
    );
  } finally {
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}

async function renderAndSaveGalleryStrip(
  photos: Photo[],
  settings: StripRenderSettings,
): Promise<StripRecord> {
  let canvas: HTMLCanvasElement | undefined;
  let thumbnail: HTMLCanvasElement | undefined;
  try {
    canvas = await renderStrip({ photos, settings, mode: "export", scale: 1 });
    const image = await canvasToBlob(canvas, "image/jpeg", 0.9);
    thumbnail = document.createElement("canvas");
    thumbnail.width = 320;
    thumbnail.height = 400;
    const context = thumbnail.getContext("2d");
    if (!context) {
      throw new ExportError(
        "canvas-allocation",
        "Thumbnail canvas is unavailable.",
      );
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      canvas,
      0,
      0,
      STRIP_WIDTH,
      Math.min(canvas.height, STRIP_WIDTH * 1.25),
      0,
      0,
      320,
      400,
    );
    const thumb = await canvasToBlob(thumbnail, "image/jpeg", 0.8);
    const record: StripRecord = {
      schemaVersion: 1,
      id: uid(),
      createdAt: Date.now(),
      title: effectiveTitle(settings.title),
      layoutId: settings.layoutId,
      themeId: settings.themeId,
      filterId: settings.filterId,
      width: canvas.width,
      height: canvas.height,
      mimeType: "image/jpeg",
      image,
      thumb,
    };
    await saveStrip(record);
    return record;
  } finally {
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
    if (thumbnail) {
      thumbnail.width = 0;
      thumbnail.height = 0;
    }
  }
}

export function saveGalleryStrip(
  photos: Photo[],
  settings: StripRenderSettings,
) {
  return coalesceInFlight(
    pendingGallerySaves,
    getStripRevision(photos, settings),
    () => renderAndSaveGalleryStrip(photos, settings),
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
