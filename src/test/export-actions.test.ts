import { describe, expect, it } from "vitest";

import {
  coalesceInFlight,
  getPreparedExportRevision,
  getStripRevision,
} from "../lib/export-actions";
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

describe("getPreparedExportRevision", () => {
  it("changes when resolution or document fonts change", () => {
    const standard = getPreparedExportRevision("strip-revision", 1, 0);

    expect(getPreparedExportRevision("strip-revision", 1, 0)).toBe(standard);
    expect(getPreparedExportRevision("strip-revision", 2, 0)).not.toBe(
      standard,
    );
    expect(getPreparedExportRevision("strip-revision", 1, 1)).not.toBe(
      standard,
    );
  });
});

describe("coalesceInFlight", () => {
  it("shares one pending save per strip revision", async () => {
    const pending = new Map<string, Promise<number>>();
    let resolveSave: (value: number) => void = () => undefined;
    let saveCount = 0;
    const operation = new Promise<number>((resolve) => {
      resolveSave = resolve;
    });
    const first = coalesceInFlight(pending, "revision-1", () => {
      saveCount += 1;
      return operation;
    });
    const second = coalesceInFlight(pending, "revision-1", () => {
      saveCount += 1;
      return Promise.resolve(2);
    });

    expect(second).toBe(first);
    expect(saveCount).toBe(1);
    resolveSave(1);
    await expect(first).resolves.toBe(1);
    await Promise.resolve();

    await expect(
      coalesceInFlight(pending, "revision-1", () => {
        saveCount += 1;
        return Promise.resolve(3);
      }),
    ).resolves.toBe(3);
    expect(saveCount).toBe(2);
  });
});
