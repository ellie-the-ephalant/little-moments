import { describe, expect, it } from "vitest";

import { layoutOrder } from "../lib/layouts";
import { getStripGeometry } from "../lib/strip-geometry";
import {
  getExportDimensions,
  isHighResolutionAvailable,
  MAX_AREA,
  MAX_DIMENSION,
} from "../lib/export-scale";

describe("getExportDimensions", () => {
  it.each(layoutOrder)("returns 1× and 2× sizes for %s", (layoutId) => {
    const geometry = getStripGeometry(layoutId);

    expect(getExportDimensions(geometry, 1)).toEqual({
      scale: 1,
      width: geometry.width,
      height: geometry.height,
    });
    expect(getExportDimensions(geometry, 2)).toEqual({
      scale: 2,
      width: geometry.width * 2,
      height: geometry.height * 2,
    });
  });

  it("clamps and rounds to the modern dimension and area caps", () => {
    expect(MAX_DIMENSION).toBe(8192);
    expect(MAX_AREA).toBe(16_000_000);
    expect(getExportDimensions({ width: 6000, height: 1000 }, 2)).toEqual({
      scale: 1.36,
      width: 8160,
      height: 1360,
    });
    expect(getExportDimensions({ width: 3000, height: 2000 }, 2)).toEqual({
      scale: 1.63,
      width: 4890,
      height: 3260,
    });
  });

  it("uses the 4096px limit on iOS before 18", () => {
    const classic = getStripGeometry("classic");
    const ios17 = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X)";
    const ios18 = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)";

    expect(getExportDimensions(classic, 2, ios17)).toEqual({
      scale: 1.04,
      width: 832,
      height: 4093,
    });
    expect(getExportDimensions(classic, 2, ios18)).toEqual({
      scale: 2,
      width: 1600,
      height: 7872,
    });
  });

  it("never returns a scale below 1 and disables High below 1.25", () => {
    const classic = getStripGeometry("classic");
    const ios17 = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X)";

    expect(getExportDimensions(classic, 1, ios17).scale).toBeGreaterThanOrEqual(
      1,
    );
    expect(isHighResolutionAvailable(classic, ios17)).toBe(false);
    expect(isHighResolutionAvailable(getStripGeometry("duo"), ios17)).toBe(
      true,
    );
    expect(isHighResolutionAvailable(classic)).toBe(true);
  });
});
