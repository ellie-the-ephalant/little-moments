import { describe, expect, it } from "vitest";

import { computeCoverCrop, shouldMirrorCapture } from "../lib/crop";

describe("computeCoverCrop", () => {
  it("center-crops a wide source", () => {
    expect(computeCoverCrop(2000, 1000, 1080, 1350)).toEqual({
      sx: 600,
      sy: 0,
      sw: 800,
      sh: 1000,
    });
  });

  it("center-crops a tall source", () => {
    expect(computeCoverCrop(1000, 2000, 1080, 1350)).toEqual({
      sx: 0,
      sy: 375,
      sw: 1000,
      sh: 1250,
    });
  });

  it("keeps an exact-aspect source intact", () => {
    expect(computeCoverCrop(1080, 1350, 1080, 1350)).toEqual({
      sx: 0,
      sy: 0,
      sw: 1080,
      sh: 1350,
    });
    expect(computeCoverCrop(400, 500, 1080, 1350)).toEqual({
      sx: 0,
      sy: 0,
      sw: 400,
      sh: 500,
    });
  });

  it("rejects non-positive dimensions", () => {
    expect(() => computeCoverCrop(0, 100, 1080, 1350)).toThrow(RangeError);
  });
});

describe("shouldMirrorCapture", () => {
  it("mirrors only a front camera capture when enabled", () => {
    expect(shouldMirrorCapture(true, "camera", "user")).toBe(true);
    expect(shouldMirrorCapture(false, "camera", "user")).toBe(false);
    expect(shouldMirrorCapture(true, "camera", "environment")).toBe(false);
    expect(shouldMirrorCapture(true, "upload", "user")).toBe(false);
  });
});
