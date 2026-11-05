import { describe, expect, it } from "vitest";

import { stripRecordSchema } from "../lib/gallery-schema";

const image = new Blob([new Uint8Array([1, 2, 3, 4])], { type: "image/jpeg" });
const thumb = new Blob([new Uint8Array([5, 6, 7])], { type: "image/jpeg" });

function record(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    id: "strip-1",
    createdAt: 1_790_000_000_000,
    title: "a slow afternoon",
    layoutId: "classic",
    themeId: "film",
    filterId: "warm",
    width: 800,
    height: 3936,
    mimeType: "image/jpeg",
    image,
    thumb,
    ...overrides,
  };
}

describe("stripRecordSchema", () => {
  it("accepts a valid gallery record", () => {
    const parsed = stripRecordSchema.parse(record());
    expect(parsed.id).toBe("strip-1");
    expect(parsed.image).toBeInstanceOf(Blob);
    expect(parsed.thumb).toBeInstanceOf(Blob);
  });

  it("rejects an unknown schema version", () => {
    expect(
      stripRecordSchema.safeParse(record({ schemaVersion: 2 })).success,
    ).toBe(false);
  });

  it("requires non-empty image and thumbnail blobs", () => {
    expect(
      stripRecordSchema.safeParse(record({ image: undefined })).success,
    ).toBe(false);
    expect(
      stripRecordSchema.safeParse(record({ thumb: undefined })).success,
    ).toBe(false);
    expect(
      stripRecordSchema.safeParse(
        record({ image: new Blob([], { type: "image/jpeg" }) }),
      ).success,
    ).toBe(false);
    expect(
      stripRecordSchema.safeParse(
        record({ thumb: new Blob([], { type: "image/jpeg" }) }),
      ).success,
    ).toBe(false);
  });

  it("requires JPEG mime type", () => {
    expect(
      stripRecordSchema.safeParse(record({ mimeType: "image/png" })).success,
    ).toBe(false);
  });

  it("rejects invalid dimensions", () => {
    expect(stripRecordSchema.safeParse(record({ width: 0 })).success).toBe(
      false,
    );
    expect(stripRecordSchema.safeParse(record({ height: -1 })).success).toBe(
      false,
    );
    expect(stripRecordSchema.safeParse(record({ width: 800.5 })).success).toBe(
      false,
    );
    expect(
      stripRecordSchema.safeParse(record({ height: undefined })).success,
    ).toBe(false);
  });

  it("validates enum fields and title length", () => {
    expect(
      stripRecordSchema.safeParse(record({ layoutId: "poster" })).success,
    ).toBe(false);
    expect(
      stripRecordSchema.safeParse(record({ themeId: "neon" })).success,
    ).toBe(false);
    expect(
      stripRecordSchema.safeParse(record({ filterId: "sepia" })).success,
    ).toBe(false);
    expect(
      stripRecordSchema.safeParse(record({ title: "x".repeat(41) })).success,
    ).toBe(false);
  });

  it("strips unknown keys", () => {
    const parsed = stripRecordSchema.parse(record({ extra: "ignored" }));
    expect(parsed).not.toHaveProperty("extra");
  });
});
