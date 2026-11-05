import { describe, expect, it } from "vitest";

import { getStripRevision } from "../lib/export-actions";
import type { Photo } from "../lib/types";
import type { StripRenderSettings } from "../lib/render-strip";

const makePhoto = (id: string): Photo => ({
  id,
  dataUrl: "data:image/jpeg;base64,AA==",
  width: 1080,
  height: 1350,
  source: "upload",
  createdAt: 0,
});

const settings: StripRenderSettings = {
  layoutId: "classic",
  themeId: "classic",
  filterId: "natural",
  title: "A slow afternoon",
  dateISO: "2026-11-05",
};

describe("getStripRevision", () => {
  it("tracks photo ids and rendered settings, independent of object identity", () => {
    const original = getStripRevision([makePhoto("photo-1")], settings);

    expect(getStripRevision([makePhoto("photo-1")], settings)).toBe(original);
    expect(getStripRevision([makePhoto("photo-2")], settings)).not.toBe(
      original,
    );
    expect(
      getStripRevision([makePhoto("photo-1")], {
        ...settings,
        themeId: "blush",
      }),
    ).not.toBe(original);
    expect(
      getStripRevision([makePhoto("photo-1")], {
        ...settings,
        title: "A different afternoon",
      }),
    ).not.toBe(original);
  });
});
