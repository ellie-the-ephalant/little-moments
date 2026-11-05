import { ensureFonts } from "./canvas-fonts";
import { computeCoverCrop } from "./crop";
import { getExportDimensions, type ExportScale } from "./export-scale";
import { applyFilterToPixels } from "./filters";
import { layouts } from "./layouts";
import { getStripGeometry } from "./strip-geometry";
import { themes, type ThemeTitle } from "./themes";
import type {
  FilterId,
  LayoutId,
  Photo,
  PersistedSettings,
  ThemeId,
} from "./types";
import { effectiveTitle, formatDateLabel } from "./utils";

export type StripRenderSettings = Pick<
  PersistedSettings,
  "layoutId" | "themeId" | "filterId"
> & {
  title: string;
  dateISO: string;
};

export type RenderStripOptions = {
  photos: Photo[];
  settings: StripRenderSettings;
  mode: "preview" | "export";
  scale: ExportScale;
};

export type ExportErrorCode =
  | "empty-slot"
  | "high-unavailable"
  | "canvas-allocation"
  | "image-decode"
  | "render-failed";

export class ExportError extends Error {
  constructor(
    readonly code: ExportErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ExportError";
  }
}

type ImageSource = CanvasImageSource;
type DecodedPhoto = {
  source: ImageSource;
  width: number;
  height: number;
};

const PREVIEW_CACHE_LIMIT = 6;
const previewCache = new Map<string, ImageSource>();
const grainTiles = new Map<boolean, HTMLCanvasElement>();
let cachedPhotoIds = "";

function closeImageSource(source: ImageSource) {
  const close = (source as ImageBitmap).close;
  if (typeof close === "function") close.call(source);
}

function clearPreviewCache() {
  for (const source of previewCache.values()) closeImageSource(source);
  previewCache.clear();
}

function syncPreviewCache(photos: Photo[]) {
  const photoIds = photos.map(({ id }) => id).join("\u0000");
  if (cachedPhotoIds !== photoIds) {
    clearPreviewCache();
    cachedPhotoIds = photoIds;
  }
}

function getCachedPreview(key: string) {
  const source = previewCache.get(key);
  if (!source) return undefined;
  previewCache.delete(key);
  previewCache.set(key, source);
  return source;
}

function cachePreview(key: string, source: ImageSource) {
  previewCache.set(key, source);
  if (previewCache.size <= PREVIEW_CACHE_LIMIT) return;
  const oldest = previewCache.keys().next().value;
  if (oldest === undefined) return;
  closeImageSource(previewCache.get(oldest)!);
  previewCache.delete(oldest);
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new ExportError("image-decode", "A photo could not be decoded."));
    image.src = dataUrl;
    if (image.complete && image.naturalWidth > 0) resolve(image);
  });
}

async function decodePhoto(photo: Photo): Promise<DecodedPhoto> {
  const image = await loadImage(photo.dataUrl);
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(image);
      return { source: bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Keep the already-decoded image as the Safari fallback.
    }
  }
  return {
    source: image,
    width: image.naturalWidth || photo.width,
    height: image.naturalHeight || photo.height,
  };
}

function createScratchCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new ExportError(
      "canvas-allocation",
      "The canvas could not be allocated.",
    );
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  return { canvas, context };
}

async function createFilteredSource(
  photo: Photo,
  filterId: FilterId,
  width: number,
  height: number,
  mode: RenderStripOptions["mode"],
): Promise<{ source: ImageSource; scratch: HTMLCanvasElement }> {
  const decoded = await decodePhoto(photo);
  const { canvas, context } = createScratchCanvas(width, height);
  try {
    try {
      const crop = computeCoverCrop(
        decoded.width,
        decoded.height,
        width,
        height,
      );
      context.drawImage(
        decoded.source,
        crop.sx,
        crop.sy,
        crop.sw,
        crop.sh,
        0,
        0,
        width,
        height,
      );
      const pixels = context.getImageData(0, 0, width, height);
      applyFilterToPixels(pixels.data, filterId);
      context.putImageData(pixels, 0, 0);
    } catch {
      throw new ExportError(
        "canvas-allocation",
        "The photo canvas could not be processed.",
      );
    }

    if (mode === "preview" && typeof createImageBitmap === "function") {
      try {
        return { source: await createImageBitmap(canvas), scratch: canvas };
      } catch {
        // Keep the filtered canvas when bitmap creation is unavailable.
      }
    }
    return { source: canvas, scratch: canvas };
  } finally {
    closeImageSource(decoded.source);
  }
}

function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawSpacedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: CanvasTextAlign = "left",
) {
  const characters = Array.from(text);
  const totalWidth =
    characters.reduce(
      (width, character) => width + context.measureText(character).width,
      0,
    ) +
    spacing * Math.max(0, characters.length - 1);
  let cursor =
    align === "center"
      ? x - totalWidth / 2
      : align === "right"
        ? x - totalWidth
        : x;
  for (const character of characters) {
    context.fillText(character, cursor, y);
    cursor += context.measureText(character).width + spacing;
  }
}

function ellipsize(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const characters = Array.from(text);
  while (
    characters.length &&
    context.measureText(`${characters.join("")}…`).width > maxWidth
  ) {
    characters.pop();
  }
  return `${characters.join("")}…`;
}

function titleLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const lines: string[] = [];
  let current = "";
  let truncated = false;
  const words = text.split(/\s+/);
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (!current) {
      if (context.measureText(word).width > maxWidth) {
        lines.push(ellipsize(context, word, maxWidth));
        break;
      }
      current = word;
    } else if (context.measureText(`${current} ${word}`).width <= maxWidth) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      if (lines.length === 2) {
        truncated = true;
        break;
      }
      current = word;
      if (context.measureText(current).width > maxWidth) {
        lines.push(ellipsize(context, current, maxWidth));
        current = "";
        truncated = index < words.length - 1;
        break;
      }
    }
  }
  if (current && lines.length < 2) lines.push(current);
  if (truncated && lines.length) {
    lines[lines.length - 1] = ellipsize(
      context,
      lines[lines.length - 1].replace(/…$/, ""),
      maxWidth,
    );
  }
  return lines.slice(0, 2);
}

function drawHeader(
  context: CanvasRenderingContext2D,
  layoutId: LayoutId,
  themeId: ThemeId,
  settings: StripRenderSettings,
) {
  const geometry = getStripGeometry(layoutId);
  const layout = layouts[layoutId];
  const theme = themes[themeId];
  const titleStyle: ThemeTitle = theme.title;
  const title = effectiveTitle(settings.title);
  const family =
    titleStyle.family === "fraunces"
      ? '"Fraunces Variable", Georgia, "Times New Roman", serif'
      : '"Manrope Variable", ui-sans-serif, system-ui, sans-serif';

  context.fillStyle = theme.ink;
  context.textAlign = "left";
  context.textBaseline = "top";
  context.font = `${titleStyle.italic ? "italic " : ""}${titleStyle.weight} ${layout.titleSize}px ${family}`;
  const titleText = titleStyle.uppercase ? title.toUpperCase() : title;
  titleLines(context, titleText, geometry.title.width).forEach(
    (line, index) => {
      context.fillText(
        line,
        geometry.title.x,
        geometry.title.y + index * layout.titleSize,
      );
    },
  );

  context.fillStyle = theme.accent;
  context.font =
    '600 12px "Manrope Variable", ui-sans-serif, system-ui, sans-serif';
  context.textBaseline = "middle";
  drawSpacedText(
    context,
    formatDateLabel(settings.dateISO),
    geometry.date.x + geometry.date.width,
    geometry.date.y + geometry.date.height / 2,
    1.6,
    "right",
  );
}

function drawFooter(
  context: CanvasRenderingContext2D,
  layoutId: LayoutId,
  themeId: ThemeId,
) {
  const geometry = getStripGeometry(layoutId);
  const theme = themes[themeId];
  context.fillStyle = theme.muted;
  context.font =
    '600 11px "Manrope Variable", ui-sans-serif, system-ui, sans-serif';
  context.textBaseline = "middle";
  const label =
    themeId === "mono" ? "MADE ON THIS DEVICE" : "made on this device";
  drawSpacedText(
    context,
    label,
    geometry.footerText.x + geometry.footerText.width / 2,
    geometry.footerText.y + geometry.footerText.height / 2,
    1.4,
    "center",
  );
}

function drawCornerTicks(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const inset = 20;
  const length = 10;
  context.beginPath();
  for (const x of [inset, width - inset]) {
    for (const y of [inset, height - inset]) {
      const horizontal = x === inset ? 1 : -1;
      const vertical = y === inset ? 1 : -1;
      context.moveTo(x + horizontal * length, y);
      context.lineTo(x, y);
      context.lineTo(x, y + vertical * length);
    }
  }
  context.stroke();
}

function drawHeart(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
) {
  context.beginPath();
  context.moveTo(x, y + 14);
  context.bezierCurveTo(x - 17, y + 3, x - 10, y - 8, x, y + 1);
  context.bezierCurveTo(x + 10, y - 8, x + 17, y + 3, x, y + 14);
  context.fillStyle = color;
  context.fill();
}

function nextRandom(seed: number) {
  let value = seed;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
}

function drawStar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
) {
  context.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + (point * Math.PI) / 5;
    const r = point % 2 === 0 ? radius : radius * 0.42;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (point === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
  context.fill();
}

function drawSprig(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: number,
  color: string,
) {
  context.save();
  context.translate(x, y);
  context.scale(direction, 1);
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(0, 18);
  context.quadraticCurveTo(4, 8, 18, -4);
  context.stroke();
  for (const [leafX, leafY, angle] of [
    [5, 11, -0.8],
    [9, 5, 0.8],
    [14, 0, -0.8],
  ] as const) {
    context.save();
    context.translate(leafX, leafY);
    context.rotate(angle);
    context.beginPath();
    context.ellipse(0, 0, 3, 6, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
  context.restore();
}

function drawBackgroundMotifs(
  context: CanvasRenderingContext2D,
  layoutId: LayoutId,
  themeId: ThemeId,
) {
  const geometry = getStripGeometry(layoutId);
  const layout = layouts[layoutId];
  const theme = themes[themeId];
  context.save();
  context.strokeStyle = theme.border;
  context.fillStyle = theme.border;
  context.lineWidth = 1;

  switch (theme.motif) {
    case "double-rule": {
      const y =
        geometry.header.y + geometry.header.height + layout.headerGap / 2;
      context.beginPath();
      context.moveTo(layout.pad, y - 2);
      context.lineTo(geometry.width - layout.pad, y - 2);
      context.moveTo(layout.pad, y + 2);
      context.lineTo(geometry.width - layout.pad, y + 2);
      context.stroke();
      drawCornerTicks(context, geometry.width, geometry.height);
      break;
    }
    case "heart":
      drawHeart(
        context,
        geometry.header.x + geometry.header.width - 16,
        geometry.header.y + 16,
        theme.accent,
      );
      break;
    case "keyline":
      context.strokeStyle = theme.border;
      context.strokeRect(14, 14, geometry.width - 28, geometry.height - 28);
      break;
    case "sprocket": {
      for (
        let y = layout.pad + layout.header + 8;
        y < geometry.height - layout.pad;
        y += 32
      ) {
        for (const x of [12, geometry.width - 20]) {
          roundedRectPath(context, x, y, 8, 12, 2);
          context.fill();
        }
      }
      break;
    }
    case "stars": {
      let seed = 0x1a2b3c4d;
      const rail = Math.max(8, layout.pad - 12);
      for (let index = 0; index < 18; index += 1) {
        seed = nextRandom(seed);
        const left = (seed & 1) === 0;
        const x = left ? 5 + (seed % rail) : geometry.width - 5 - (seed % rail);
        const y = 20 + (nextRandom(seed) % (geometry.height - 40));
        context.fillStyle = theme.accent;
        drawStar(context, x, y, 2 + (index % 3) * 0.55);
      }
      break;
    }
    case "sprig":
      break;
  }
  context.restore();
}

function drawFooterMotifs(
  context: CanvasRenderingContext2D,
  layoutId: LayoutId,
  themeId: ThemeId,
) {
  if (themes[themeId].motif !== "sprig") return;
  const geometry = getStripGeometry(layoutId);
  const y = geometry.footer.y + geometry.footer.height / 2;
  drawSprig(context, geometry.footer.x + 18, y, 1, themes[themeId].accent);
  drawSprig(
    context,
    geometry.footer.x + geometry.footer.width - 18,
    y,
    -1,
    themes[themeId].accent,
  );
}

function grainTile(dark: boolean) {
  const cached = grainTiles.get(dark);
  if (cached) return cached;

  const tile = document.createElement("canvas");
  tile.width = 96;
  tile.height = 96;
  const context = tile.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const image = context.createImageData(96, 96);
  const color = dark ? [255, 248, 236] : [33, 26, 22];
  let seed = 0x1a2b3c4d;
  for (let index = 0; index < image.data.length; index += 4) {
    seed = nextRandom(seed);
    image.data[index] = color[0];
    image.data[index + 1] = color[1];
    image.data[index + 2] = color[2];
    image.data[index + 3] = seed & 255;
  }
  context.putImageData(image, 0, 0);
  grainTiles.set(dark, tile);
  return tile;
}

function drawGrain(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  themeId: ThemeId,
) {
  const pattern = grainTile(themeId === "mono" || themeId === "midnight");
  if (!pattern) return;
  const fill = context.createPattern(pattern, "repeat");
  if (!fill) return;
  context.save();
  context.globalAlpha = 0.04;
  context.fillStyle = fill;
  context.fillRect(0, 0, width, height);
  context.restore();
}

function probeCanvas(canvas: HTMLCanvasElement) {
  try {
    const context = canvas.getContext("2d");
    if (!context || !canvas.width || !canvas.height) return false;
    const x = canvas.width - 1;
    const y = canvas.height - 1;
    const original = context.getImageData(x, y, 1, 1);
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = "#a33b2b";
    context.fillRect(x, y, 1, 1);
    context.restore();
    const pixel = context.getImageData(x, y, 1, 1).data;
    context.putImageData(original, x, y);
    return (
      pixel[0] === 163 && pixel[1] === 59 && pixel[2] === 43 && pixel[3] === 255
    );
  } catch {
    return false;
  }
}

async function renderAtScale(
  photos: Photo[],
  settings: StripRenderSettings,
  mode: RenderStripOptions["mode"],
  scale: number,
) {
  const geometry = getStripGeometry(settings.layoutId);
  const theme = themes[settings.themeId];
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(geometry.width * scale);
  canvas.height = Math.round(geometry.height * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new ExportError(
      "canvas-allocation",
      "The canvas could not be allocated.",
    );
  }
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.fillStyle = theme.bg;
  context.fillRect(0, 0, geometry.width, geometry.height);
  drawBackgroundMotifs(context, settings.layoutId, settings.themeId);
  drawHeader(context, settings.layoutId, settings.themeId, settings);

  for (const [index, slot] of geometry.slots.entries()) {
    const photo = photos[index];
    const targetWidth = Math.round(slot.width * scale);
    const targetHeight = Math.round(slot.height * scale);
    const key = `${photo.id}\u0000${settings.filterId}\u0000${targetWidth}x${targetHeight}`;
    let source = mode === "preview" ? getCachedPreview(key) : undefined;
    let scratch: HTMLCanvasElement | undefined;
    if (!source) {
      const filtered = await createFilteredSource(
        photo,
        settings.filterId,
        targetWidth,
        targetHeight,
        mode,
      );
      source = filtered.source;
      scratch = filtered.scratch;
      if (mode === "preview") cachePreview(key, source);
    }

    context.save();
    roundedRectPath(
      context,
      slot.x,
      slot.y,
      slot.width,
      slot.height,
      theme.radius,
    );
    context.fillStyle = theme.paper;
    context.fill();
    context.clip();
    context.drawImage(source, slot.x, slot.y, slot.width, slot.height);
    context.restore();
    context.save();
    roundedRectPath(
      context,
      slot.x + 0.5,
      slot.y + 0.5,
      slot.width - 1,
      slot.height - 1,
      theme.radius,
    );
    context.strokeStyle = theme.border;
    context.lineWidth = 1;
    context.stroke();
    context.restore();

    if (scratch && (mode === "export" || scratch !== source)) {
      scratch.width = 0;
      scratch.height = 0;
    }
  }

  drawFooterMotifs(context, settings.layoutId, settings.themeId);
  drawFooter(context, settings.layoutId, settings.themeId);
  drawGrain(context, geometry.width, geometry.height, settings.themeId);
  return canvas;
}

export async function renderStrip({
  photos,
  settings,
  mode,
  scale,
}: RenderStripOptions): Promise<HTMLCanvasElement> {
  const geometry = getStripGeometry(settings.layoutId);
  if (photos.length < geometry.slotCount) {
    throw new ExportError("empty-slot", "Every visible frame needs a photo.");
  }
  if (mode === "preview") syncPreviewCache(photos);

  await ensureFonts();
  const requestedScale = mode === "preview" ? 1 : scale;
  const effectiveScale = getExportDimensions(geometry, requestedScale).scale;
  if (mode === "export" && scale === 2 && effectiveScale < 1.25) {
    throw new ExportError(
      "high-unavailable",
      "High resolution is unavailable on this device.",
    );
  }

  try {
    let canvas: HTMLCanvasElement;
    try {
      canvas = await renderAtScale(photos, settings, mode, effectiveScale);
    } catch (error) {
      if (
        mode !== "export" ||
        effectiveScale <= 1 ||
        !(error instanceof ExportError) ||
        error.code !== "canvas-allocation"
      ) {
        throw error;
      }
      canvas = await renderAtScale(photos, settings, mode, 1);
      if (probeCanvas(canvas)) return canvas;
      throw new ExportError(
        "canvas-allocation",
        "The strip couldn't be exported at this size. Try Standard.",
      );
    }

    if (mode === "preview" || probeCanvas(canvas)) return canvas;
    if (effectiveScale > 1) {
      canvas = await renderAtScale(photos, settings, mode, 1);
      if (probeCanvas(canvas)) return canvas;
    }
    throw new ExportError(
      "canvas-allocation",
      "The strip couldn't be exported at this size. Try Standard.",
    );
  } catch (error) {
    if (error instanceof ExportError) throw error;
    throw new ExportError("render-failed", "The strip could not be rendered.");
  }
}
