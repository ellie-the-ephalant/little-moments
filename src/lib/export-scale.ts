export const MAX_DIMENSION = 8192;
export const MAX_AREA = 16_000_000;

export type ExportScale = 1 | 2;
export type StripDimensions = { width: number; height: number };
export type ExportDimensions = StripDimensions & { scale: number };

function currentUserAgent() {
  return typeof navigator === "undefined" ? "" : navigator.userAgent;
}

function isLegacyIOS(userAgent: string) {
  const version = /\bOS (\d+)[._]/i.exec(userAgent);
  return (
    /iPhone|iPad|iPod/i.test(userAgent) &&
    version !== null &&
    Number(version[1]) < 18
  );
}

export function getExportDimensions(
  dimensions: StripDimensions,
  requested: ExportScale,
  userAgent = currentUserAgent(),
): ExportDimensions {
  const { width, height } = dimensions;
  if (![width, height].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError("Strip dimensions must be positive");
  }

  const maxDimension = isLegacyIOS(userAgent) ? 4096 : MAX_DIMENSION;
  const scale = Math.max(
    1,
    Math.floor(
      Math.min(
        requested,
        maxDimension / Math.max(width, height),
        Math.sqrt(MAX_AREA / (width * height)),
      ) * 100,
    ) / 100,
  );

  return {
    scale,
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export function isHighResolutionAvailable(
  dimensions: StripDimensions,
  userAgent = currentUserAgent(),
) {
  return getExportDimensions(dimensions, 2, userAgent).scale >= 1.25;
}
