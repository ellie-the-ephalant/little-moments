import { describe, expect, it } from "vitest";

import { applyFilterToPixels, filterOrder, filters } from "../lib/filters";

function pixel(values: [number, number, number, number]) {
  return new Uint8ClampedArray(values);
}

describe("filters", () => {
  it("defines all seven filters with 4x5 matrices", () => {
    expect(filterOrder).toEqual([
      "natural",
      "warm",
      "golden",
      "faded",
      "noir",
      "cool",
      "vivid",
    ]);
    for (const id of filterOrder) {
      expect(filters[id].matrix).toHaveLength(20);
      for (const value of filters[id].matrix) {
        expect(Number.isFinite(value)).toBe(true);
      }
    }
  });

  it("keeps natural pixels identical", () => {
    const data = pixel([12, 34, 56, 78]);
    applyFilterToPixels(data, "natural");
    expect(Array.from(data)).toEqual([12, 34, 56, 78]);
  });

  it("makes noir output grayscale", () => {
    const data = pixel([200, 50, 100, 123]);
    applyFilterToPixels(data, "noir");
    expect(data[0]).toBe(data[1]);
    expect(data[1]).toBe(data[2]);
  });

  it("clamps channel values to 0-255", () => {
    const bright = pixel([255, 255, 255, 255]);
    applyFilterToPixels(bright, "vivid");
    expect(Array.from(bright.slice(0, 3))).toEqual([255, 255, 255]);

    const dark = pixel([0, 0, 0, 255]);
    applyFilterToPixels(dark, "noir");
    expect(Array.from(dark.slice(0, 3))).toEqual([0, 0, 0]);
  });

  it("preserves alpha for every filter", () => {
    for (const id of filterOrder) {
      const data = pixel([120, 90, 60, 77]);
      applyFilterToPixels(data, id);
      expect(data[3]).toBe(77);
    }
  });
});
