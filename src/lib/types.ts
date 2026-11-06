export type LayoutId = "classic" | "duo" | "grid" | "six" | "single";
export type ThemeId =
  "classic" | "blush" | "mono" | "film" | "sage" | "midnight";
export type FilterId =
  "natural" | "warm" | "golden" | "faded" | "noir" | "cool" | "vivid";
export type PhotoSource = "camera" | "upload";
export type CountdownSeconds = 0 | 3 | 5 | 10;
export type StudioStep = "setup" | "booth" | "finish";
export type CameraFacing = "user" | "environment";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Photo = {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  source: PhotoSource;
  createdAt: number;
};

export type PersistedSettings = {
  layoutId: LayoutId;
  themeId: ThemeId;
  filterId: FilterId;
  countdownSeconds: CountdownSeconds;
  mirror: boolean;
  flash: boolean;
};

export type StudioState = PersistedSettings & {
  step: StudioStep;
  title: string;
  dateISO: string;
  photos: Photo[];
  hydrated: boolean;
};

export type StripRecord = {
  schemaVersion: 1;
  id: string;
  createdAt: number;
  title: string;
  layoutId: LayoutId;
  themeId: ThemeId;
  filterId: FilterId;
  width: number;
  height: number;
  mimeType: "image/jpeg";
  image: Blob;
  thumb: Blob;
};
