import type { CountdownSeconds, PersistedSettings } from "./types";

export const STRIP_WIDTH = 800;
export const MAX_PHOTOS = 6;
export const CAPTURE_WIDTH = 1080;
export const CAPTURE_HEIGHT = 1350;
export const CAPTURE_QUALITY = 0.88;
export const TITLE_MAX_LENGTH = 40;
export const DEFAULT_TITLE = "little moments";
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const GALLERY_LIMIT = 30;
export const GALLERY_KEY_PREFIX = "strip:";
export const GALLERY_DB_NAME = "little-moments";
export const GALLERY_STORE_NAME = "gallery";
export const GALLERY_IMAGE_QUALITY = 0.9;
export const GALLERY_THUMB_QUALITY = 0.8;
export const SETTINGS_STORAGE_KEY = "little-moments.settings.v1";

export const LAYOUT_IDS = ["classic", "duo", "grid", "six", "single"] as const;
export const THEME_IDS = [
  "classic",
  "blush",
  "mono",
  "film",
  "sage",
  "midnight",
] as const;
export const FILTER_IDS = [
  "natural",
  "warm",
  "golden",
  "faded",
  "noir",
  "cool",
  "vivid",
] as const;
export const COUNTDOWN_VALUES: readonly CountdownSeconds[] = [0, 3, 5, 10];

export const DEFAULT_SETTINGS: PersistedSettings = {
  layoutId: "classic",
  themeId: "classic",
  filterId: "natural",
  countdownSeconds: 3,
  mirror: true,
  flash: false,
};
